import JSZip from "jszip"
import FileSaver from "file-saver"
import type { Member } from "./supabase"
import { supabase } from "./supabase"

// Real logo base64 (converted from new-logo.jpeg)
const LOGO_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iI2NjYyIvPjxwYXRoIGQ9Ik01MCA1MGMtMTUgMC0yNSA1LTEwIDIwczI1IDAgMjUgMCIgZmlsbD0iI2JiYiIvPjwvc3ZnPg=="

function getLocalBase64(memberId: string, docType: string): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem(`member-${memberId}-${docType}`)
    : null;
}

function getBase64Extension(base64: string): string {
  if (!base64) return ".bin";
  if (base64.startsWith("data:image/png")) return ".png";
  if (base64.startsWith("data:image/jpeg")) return ".jpg";
  if (base64.startsWith("data:application/pdf")) return ".pdf";
  return ".bin";
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.split(",")[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateMemberZip(member: Member) {
  const zip = new JSZip()

  // Create folders
  const receiptsFolder = zip.folder("receipts")
  const documentsFolder = zip.folder("documents")
  const imagesFolder = documentsFolder?.folder("images")
  const certificatesFolder = documentsFolder?.folder("certificates")

  // Get all uploaded files from localStorage if available
  const photoBase64 = getLocalBase64(member.member_id, "photo") || PLACEHOLDER_PHOTO;
  const birthCertBase64 = getLocalBase64(member.member_id, "birth-certificate");
  const parentalConsentBase64 = getLocalBase64(member.member_id, "parental-consent");
  const medicalCertBase64 = getLocalBase64(member.member_id, "medical-certificate");

  // Add the photo as a file in the images folder (decode base64 to binary)
  if (photoBase64 && imagesFolder) {
    imagesFolder.file("photo" + getBase64Extension(photoBase64), base64ToUint8Array(photoBase64));
  }
  if (birthCertBase64 && certificatesFolder) {
    certificatesFolder.file("birth-certificate" + getBase64Extension(birthCertBase64), base64ToUint8Array(birthCertBase64));
  }
  if (parentalConsentBase64 && certificatesFolder) {
    certificatesFolder.file("parental-consent" + getBase64Extension(parentalConsentBase64), base64ToUint8Array(parentalConsentBase64));
  }
  if (medicalCertBase64 && certificatesFolder) {
    certificatesFolder.file("medical-certificate" + getBase64Extension(medicalCertBase64), base64ToUint8Array(medicalCertBase64));
  }

  try {
    // Generate admin receipt HTML (logo, government lines, then photo on the side, then info)
    const adminReceiptHtml = generateAdminReceiptHtml(member, photoBase64)
    receiptsFolder?.file("admin-receipt.html", adminReceiptHtml)

    // Generate candidate receipt HTML
    const candidateReceiptHtml = generateCandidateReceiptHtml(member)
    receiptsFolder?.file("candidate-receipt.html", candidateReceiptHtml)

    // Generate membership card HTML
    const membershipCardHtml = generateMembershipCardHtml(member, photoBase64)
    receiptsFolder?.file("membership-card.html", membershipCardHtml)

    // Add payment certificate
    const paymentCertificate = generatePaymentCertificate(member)
    receiptsFolder?.file("payment-certificate.html", paymentCertificate)

    // Add completion certificate
    const completionCertificate = generateCompletionCertificate(member)
    receiptsFolder?.file("completion-certificate.html", completionCertificate)

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: "blob" })
    FileSaver.saveAs(content, `${member.member_id}-${member.first_name}-${member.last_name}.zip`)
  } catch (error) {
    console.error("Error generating ZIP:", error)
    throw error
  }
}

function generateAdminReceiptHtml(member: Member, photoBase64: string): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>وصل تسجيل منخرط - نسخة الإدارة</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7fafc;
          margin: 0;
          padding: 0;
          color: #222;
        }
        .receipt-container {
          max-width: 600px;
          margin: 32px auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 32px 24px 24px 24px;
        }
        .logo {
          display: block;
          margin: 0 auto 18px auto;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .gov-header {
          text-align: center;
          margin-bottom: 18px;
          color: #1e293b;
        }
        .gov-header h1, .gov-header h2, .gov-header h3, .gov-header h4, .gov-header h5 {
          margin: 2px 0;
          font-weight: 600;
        }
        .receipt-title {
          text-align: center;
          font-size: 1.4rem;
          color: #16a34a;
          font-weight: bold;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }
        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }
        .photo {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #16a34a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          background: #f1f5f9;
          flex-shrink: 0;
        }
        .info-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #2563eb;
          margin-left: 6px;
        }
        .info-value {
          color: #222;
        }
        .section {
          background: #f0fdf4;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 18px;
          border: 1px solid #bbf7d0;
        }
        .section-title {
          color: #16a34a;
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 1.1rem;
        }
        .footer {
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 32px;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <img src="${LOGO_BASE64}" alt="شعار دار الشباب" class="logo">
        <div class="gov-header">
          <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
          <h2>وزارة الشباب</h2>
          <h3>مديرية الشباب والرياضة تبسة</h3>
          <h4>ديوان مؤسسات الشباب</h4>
          <h5>دار الشباب سليمي إبراهيم بئر العاتر</h5>
        </div>
        <div class="receipt-title">وصل تسجيل منخرط - نسخة الإدارة</div>
        <div class="info-row">
          <img src="${photoBase64}" alt="صورة المنخرط" class="photo" onerror="this.style.display='none'">
          <div class="info-block">
            <div><span class="info-label">الرقم التعريفي:</span><span class="info-value">${member.member_id}</span></div>
            <div><span class="info-label">الاسم الكامل:</span><span class="info-value">${member.first_name} ${member.last_name}</span></div>
            <div><span class="info-label">تاريخ الميلاد:</span><span class="info-value">${new Date(member.birth_date).toLocaleDateString("ar-DZ")}</span></div>
            <div><span class="info-label">مكان الميلاد:</span><span class="info-value">${member.birth_place_commune}, ${member.birth_place_wilaya}</span></div>
            <div><span class="info-label">الجنس:</span><span class="info-value">${member.gender === "male" ? "ذكر" : "أنثى"}</span></div>
            <div><span class="info-label">رقم الهاتف:</span><span class="info-value">${member.phone}</span></div>
            <div><span class="info-label">المستوى الدراسي:</span><span class="info-value">${member.education_level}</span></div>
            <div><span class="info-label">رقم بطاقة الانخراط:</span><span class="info-value">${member.membership_card_number}</span></div>
            <div><span class="info-label">تاريخ التسجيل:</span><span class="info-value">${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</span></div>
            <div><span class="info-label">حالة الدفع:</span><span class="info-value" style="color: #16a34a;">مدفوع ✓</span></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">معلومات النشاط</div>
          <div><span class="info-label">الفضاء:</span><span class="info-value">${member.selected_space}</span></div>
          <div><span class="info-label">النادي:</span><span class="info-value">${member.selected_club}</span></div>
          <div><span class="info-label">النشاط:</span><span class="info-value">${member.selected_activity}</span></div>
        </div>
        <div class="section">
          <div class="section-title">معلومات الدفع</div>
          <div style="font-size: 1.2rem; color: #16a34a; font-weight: bold;">100 دج</div>
          <div>مائة دينار جزائري</div>
        </div>
        <div class="footer">
          هذا الوصل صالح للاحتفاظ في ملف المنخرط<br>
          تاريخ الإصدار: ${new Date().toLocaleDateString("ar-DZ")}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCandidateReceiptHtml(member: Member): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>وصل مؤقت للمنخرط</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7fafc;
          margin: 0;
          padding: 0;
          color: #222;
        }
        .receipt-container {
          max-width: 400px;
          margin: 32px auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 28px 18px 18px 18px;
        }
        .logo {
          display: block;
          margin: 0 auto 14px auto;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .gov-header {
          text-align: center;
          margin-bottom: 12px;
          color: #1e293b;
        }
        .gov-header h1 {
          margin: 2px 0;
          font-weight: 600;
          font-size: 1rem;
        }
        .receipt-title {
          text-align: center;
          font-size: 1.1rem;
          color: #16a34a;
          font-weight: bold;
          margin-bottom: 18px;
        }
        .info-block {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 14px;
        }
        .info-label {
          font-weight: bold;
          color: #2563eb;
          margin-left: 6px;
        }
        .info-value {
          color: #222;
        }
        .footer {
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 18px;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <img src="${LOGO_BASE64}" alt="شعار دار الشباب" class="logo">
        <div class="gov-header">
          <h1>دار الشباب سليمي إبراهيم</h1>
        </div>
        <div class="receipt-title">وصل مؤقت للمنخرط</div>
        <div class="info-block">
          <div><span class="info-label">الاسم الكامل:</span><span class="info-value">${member.first_name} ${member.last_name}</span></div>
          <div><span class="info-label">الرقم التعريفي:</span><span class="info-value">${member.member_id}</span></div>
          <div><span class="info-label">رقم بطاقة الانخراط:</span><span class="info-value">${member.membership_card_number}</span></div>
          <div><span class="info-label">النشاط:</span><span class="info-value">${member.selected_activity}</span></div>
          <div><span class="info-label">تاريخ التسجيل:</span><span class="info-value">${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</span></div>
        </div>
        <div class="footer">
          وصل مؤقت - صالح لمدة 30 يوماً<br>
          تاريخ الإصدار: ${new Date().toLocaleDateString("ar-DZ")}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMembershipCardHtml(member: Member, photoBase64: string): string {
  const age = new Date().getFullYear() - new Date(member.birth_date).getFullYear();
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>بطاقة الانخراط</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7fafc;
          margin: 0;
          padding: 0;
          color: #222;
        }
        .card-container {
          max-width: 400px;
          margin: 32px auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 28px 18px 18px 18px;
        }
        .logo {
          display: block;
          margin: 0 auto 14px auto;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .gov-header {
          text-align: center;
          margin-bottom: 12px;
          color: #1e293b;
        }
        .gov-header h1, .gov-header h2 {
          margin: 2px 0;
          font-weight: 600;
          font-size: 1rem;
        }
        .card-title {
          text-align: center;
          font-size: 1.2rem;
          color: #16a34a;
          font-weight: bold;
          margin-bottom: 18px;
        }
        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 18px;
        }
        .photo {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #16a34a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          background: #f1f5f9;
          flex-shrink: 0;
        }
        .info-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .info-label {
          font-weight: bold;
          color: #2563eb;
          margin-left: 6px;
        }
        .info-value {
          color: #222;
        }
        .footer {
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 18px;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="card-container">
        <img src="${LOGO_BASE64}" alt="شعار دار الشباب" class="logo">
        <div class="gov-header">
          <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
          <h2>وزارة الشباب والرياضة</h2>
        </div>
        <div class="card-title">بطاقة الانخراط</div>
        <div class="info-row">
          <img src="${photoBase64}" alt="صورة المنخرط" class="photo" onerror="this.style.display='none'">
          <div class="info-block">
            <div><span class="info-label">الاسم:</span><span class="info-value">${member.first_name} ${member.last_name}</span></div>
            <div><span class="info-label">الرقم:</span><span class="info-value">${member.member_id}</span></div>
            <div><span class="info-label">البطاقة:</span><span class="info-value">${member.membership_card_number}</span></div>
            <div><span class="info-label">العمر:</span><span class="info-value">${age} سنة</span></div>
            <div><span class="info-label">النشاط:</span><span class="info-value">${member.selected_activity}</span></div>
          </div>
        </div>
        <div class="footer">صالحة للموسم 2024-2025</div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentCertificate(member: Member): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>شهادة دفع</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; text-align: center; }
        .certificate { border: 3px solid #16a34a; padding: 30px; border-radius: 10px; }
        .title { font-size: 24px; color: #16a34a; font-weight: bold; margin-bottom: 20px; }
        .amount { font-size: 36px; color: #1d4ed8; font-weight: bold; margin: 20px 0; }
        .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; display: block; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="certificate">
        <img src="${LOGO_BASE64}" alt="شعار دار الشباب" class="logo">
        <h1 class="title">شهادة دفع حقوق الانخراط</h1>
        <p>نشهد بأن المنخرط:</p>
        <h2>${member.first_name} ${member.last_name}</h2>
        <p>الرقم التعريفي: ${member.member_id}</p>
        <p>قد دفع حقوق الانخراط بمبلغ:</p>
        <div class="amount">100 دج</div>
        <p>مائة دينار جزائري</p>
        <p>بتاريخ: ${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</p>
        <br>
        <p>دار الشباب سليمي إبراهيم بئر العاتر</p>
      </div>
    </body>
    </html>
  `
}

function generateCompletionCertificate(member: Member): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>شهادة اكتمال الملف</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; text-align: center; }
        .certificate { border: 3px solid #1d4ed8; padding: 30px; border-radius: 10px; }
        .title { font-size: 24px; color: #1d4ed8; font-weight: bold; margin-bottom: 20px; }
        .checkmark { font-size: 48px; color: #16a34a; margin: 20px 0; }
        .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; display: block; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="certificate">
        <img src="${LOGO_BASE64}" alt="شعار دار الشباب" class="logo">
        <h1 class="title">شهادة اكتمال الملف</h1>
        <div class="checkmark">✓</div>
        <p>نشهد بأن ملف المنخرط:</p>
        <h2>${member.first_name} ${member.last_name}</h2>
        <p>الرقم التعريفي: ${member.member_id}</p>
        <p>مكتمل ويحتوي على جميع المستندات المطلوبة</p>
        <ul style="text-align: right; display: inline-block;">
          <li>شهادة الميلاد ✓</li>
          <li>الصورة الشمسية ✓</li>
          ${member.is_minor ? "<li>السماح الأبوي ✓</li>" : ""}
          ${member.selected_activity === "الكراتي دو" || member.selected_activity === "الجيدو" || member.selected_activity === "الكينغ فو" ? "<li>الشهادة الطبية ✓</li>" : ""}
        </ul>
        <br>
        <p>بتاريخ: ${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</p>
        <br>
        <p>دار الشباب سليمي إبراهيم بئر العاتر</p>
      </div>
    </body>
    </html>
  `
}
