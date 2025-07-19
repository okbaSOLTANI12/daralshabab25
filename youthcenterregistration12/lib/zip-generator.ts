import JSZip from "jszip"
import FileSaver from "file-saver"
import type { Member } from "./supabase"
import { supabase } from "./supabase"

export async function generateMemberZip(member: Member) {
  const zip = new JSZip()

  // Create folders
  const receiptsFolder = zip.folder("receipts")
  const documentsFolder = zip.folder("documents")
  const imagesFolder = documentsFolder?.folder("images")
  const certificatesFolder = documentsFolder?.folder("certificates")

  try {
    // Generate admin receipt HTML
    const adminReceiptHtml = generateAdminReceiptHtml(member)
    receiptsFolder?.file("admin-receipt.html", adminReceiptHtml)

    // Generate candidate receipt HTML
    const candidateReceiptHtml = generateCandidateReceiptHtml(member)
    receiptsFolder?.file("candidate-receipt.html", candidateReceiptHtml)

    // Generate membership card HTML
    const membershipCardHtml = generateMembershipCardHtml(member)
    receiptsFolder?.file("membership-card.html", membershipCardHtml)

    // Add payment certificate
    const paymentCertificate = generatePaymentCertificate(member)
    receiptsFolder?.file("payment-certificate.html", paymentCertificate)

    // Add completion certificate
    const completionCertificate = generateCompletionCertificate(member)
    receiptsFolder?.file("completion-certificate.html", completionCertificate)

    // Download and add actual uploaded documents
    await addDocumentToZip(imagesFolder, member.photo_url, "photo")
    await addDocumentToZip(certificatesFolder, member.birth_certificate_url, "birth-certificate")
    await addDocumentToZip(certificatesFolder, member.parental_consent_url, "parental-consent")
    await addDocumentToZip(certificatesFolder, member.medical_certificate_url, "medical-certificate")

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: "blob" })
    FileSaver.saveAs(content, `${member.member_id}-${member.first_name}-${member.last_name}.zip`)
  } catch (error) {
    console.error("Error generating ZIP:", error)
    throw error
  }
}

async function addDocumentToZip(folder: JSZip | null, fileUrl: string | null | undefined, fileName: string) {
  if (!folder || !fileUrl || fileUrl.startsWith("placeholder/")) {
    return
  }

  try {
    let downloadUrl = fileUrl

    // If it's not a full URL, construct the Supabase storage URL
    if (!fileUrl.startsWith("http")) {
      const { data, error } = supabase.storage.from("documents").getPublicUrl(fileUrl)
      if (error) {
        console.warn(`Supabase getPublicUrl error for ${fileName} (${fileUrl}):`, error.message)
        return
      }
      if (!data || !data.publicUrl) {
        console.warn(`Supabase getPublicUrl returned no publicUrl for ${fileName} (${fileUrl})`)
        return
      }
      downloadUrl = data.publicUrl
    }

    // Fetch the file
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      console.warn(`Failed to fetch ${fileName} from ${downloadUrl}:`, response.statusText)
      return
    }

    const blob = await response.blob()
    const fileExtension = getFileExtension(fileUrl, blob.type)

    // Add the file to the ZIP
    folder.file(`${fileName}${fileExtension}`, blob)
    console.log(`Added ${fileName} to ZIP successfully`)
  } catch (error) {
    console.warn(`Error adding ${fileName} to ZIP:`, error)
  }
}

function getFileExtension(fileName: string, mimeType: string): string {
  // Try to get extension from filename first
  const match = fileName.match(/\.[^.]+$/)
  if (match) {
    return match[0]
  }

  // Fallback to mime type
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/jpg":
      return ".jpg"
    case "application/pdf":
      return ".pdf"
    default:
      return ".bin"
  }
}

function generateAdminReceiptHtml(member: Member): string {
  const getPhotoHtml = () => {
    if (!member.photo_url || member.photo_url.startsWith("placeholder/")) {
      return ""
    }

    let photoUrl = member.photo_url
    if (!member.photo_url.startsWith("http")) {
      const { data, error } = supabase.storage.from("documents").getPublicUrl(member.photo_url)
      if (error || !data || !data.publicUrl) {
        console.warn(
          `Failed to get public URL for admin receipt photo (${member.photo_url}):`,
          error?.message || "No public URL",
        )
        return ""
      }
      photoUrl = data.publicUrl
    }

    return `<img src="${photoUrl}" alt="صورة المنخرط" class="photo" onerror="this.style.display='none'">`
  }

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>وصل التسجيل - نسخة الإدارة</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
        .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px auto; display: block; }
        .title { color: #16a34a; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .photo { 
          width: 180px; 
          height: 220px; 
          object-fit: cover; 
          object-position: center top;
          border-radius: 12px; 
          display: block;
          margin: 0 auto 20px auto;
          border: 4px solid #16a34a;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" alt="شعار دار الشباب" class="logo">
        ${getPhotoHtml()}
        <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
        <h2>وزارة الشباب</h2>
        <h3>مديرية الشباب والرياضة تبسة</h3>
        <h4>ديوان مؤسسات الشباب</h4>
        <h5>دار الشباب سليمي إبراهيم بئر العاتر</h5>
        <div class="title">وصل تسجيل منخرط - نسخة الإدارة</div>
      </div>
      
      <div class="info-grid">
        <div>
          <div class="info-item"><span>الرقم التعريفي:</span><span>${member.member_id}</span></div>
          <div class="info-item"><span>الاسم الكامل:</span><span>${member.first_name} ${member.last_name}</span></div>
          <div class="info-item"><span>تاريخ الميلاد:</span><span>${new Date(member.birth_date).toLocaleDateString("ar-DZ")}</span></div>
          <div class="info-item"><span>مكان الميلاد:</span><span>${member.birth_place_commune}, ${member.birth_place_wilaya}</span></div>
          <div class="info-item"><span>الجنس:</span><span>${member.gender === "male" ? "ذكر" : "أنثى"}</span></div>
        </div>
        <div>
          <div class="info-item"><span>رقم الهاتف:</span><span>${member.phone}</span></div>
          <div class="info-item"><span>المستوى الدراسي:</span><span>${member.education_level}</span></div>
          <div class="info-item"><span>رقم بطاقة الانخراط:</span><span>${member.membership_card_number}</span></div>
          <div class="info-item"><span>تاريخ التسجيل:</span><span>${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</span></div>
          <div class="info-item"><span>حالة الدفع:</span><span style="color: #16a34a;">مدفوع ✓</span></div>
        </div>
      </div>
      
      <div class="section">
        <h3>معلومات النشاط</h3>
        <div class="info-item"><span>الفضاء:</span><span>${member.selected_space}</span></div>
        <div class="info-item"><span>النادي:</span><span>${member.selected_club}</span></div>
        <div class="info-item"><span>النشاط:</span><span>${member.selected_activity}</span></div>
      </div>
      
      <div class="section">
        <h3>معلومات الدفع</h3>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #16a34a;">100 دج</div>
          <div>مائة دينار جزائري</div>
        </div>
      </div>
    </body>
    </html>
  `
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
        body { font-family: Arial, sans-serif; margin: 6px; direction: rtl; max-width: 350px; font-size: 11px; }
        .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 8px; }
        .title { color: #1d4ed8; font-size: 13px; font-weight: bold; background: #dbeafe; padding: 4px; border-radius: 3px; }
        .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 3px 0; }
        .section { background: #f0f9ff; padding: 5px; border-radius: 4px; margin: 7px 0; }
        .status { background: #dcfce7; border: 1px solid #16a34a; }
        .payment { background: #dbeafe; border: 1px solid #1d4ed8; text-align: center; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" alt="شعار دار الشباب" style="width:40px;height:40px;border-radius:50%;margin:0 auto 5px auto;display:block;">
        <h1 style="font-size:14px;margin:0;">دار الشباب سليمي إبراهيم</h1>
        <p style="font-size:11px;margin:0;">بئر العاتر - تبسة</p>
        <div class="title">وصل مؤقت للمنخرط</div>
      </div>
      
      <div class="info-item"><span>الاسم الكامل:</span><span><strong>${member.first_name} ${member.last_name}</strong></span></div>
      <div class="info-item"><span>الرقم التعريفي:</span><span style="color: #1d4ed8; font-weight: bold;">${member.member_id}</span></div>
      <div class="info-item"><span>رقم بطاقة الانخراط:</span><span><strong>${member.membership_card_number}</strong></span></div>
      <div class="info-item"><span>النشاط:</span><span>${member.selected_activity}</span></div>
      <div class="info-item"><span>تاريخ التسجيل:</span><span>${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</span></div>
      
      <div class="section status">
        <h3 style="color: #16a34a; font-size:12px; margin:2px 0;">حالة الملف</h3>
        <div class="info-item"><span>المستندات:</span><span style="color: #16a34a; font-weight: bold;">مكتملة ✓</span></div>
        <div class="info-item"><span>حقوق الانخراط:</span><span style="color: #16a34a; font-weight: bold;">مدفوعة ✓</span></div>
        <div class="info-item"><span>حالة التسجيل:</span><span style="color: #16a34a; font-weight: bold;">مؤكد ✓</span></div>
      </div>
      
      <div class="section payment">
        <h3 style="color: #1d4ed8; font-size:12px; margin:2px 0;">إثبات الدفع</h3>
        <div style="font-size: 15px; font-weight: bold; color: #1d4ed8;">100 دج</div>
        <div style="font-size:11px;">مائة دينار جزائري</div>
        <div style="color: #16a34a; font-size: 10px; margin-top: 2px;">✓ تم الدفع بتاريخ ${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</div>
      </div>
      
      <div style="background: #fef3c7; padding: 4px; border-radius: 3px; text-align: center; font-size: 10px; color: #92400e;">
        يرجى الاحتفاظ بهذا الوصل حتى استلام بطاقة الانخراط النهائية
      </div>
    </body>
    </html>
  `
}

function generateMembershipCardHtml(member: Member): string {
  const age = new Date().getFullYear() - new Date(member.birth_date).getFullYear()

  const getPhotoHtml = () => {
    if (!member.photo_url || member.photo_url.startsWith("placeholder/")) {
      return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 10px; font-weight: bold;">صورة</div>'
    }

    let photoUrl = member.photo_url
    if (!member.photo_url.startsWith("http")) {
      const { data, error } = supabase.storage.from("documents").getPublicUrl(member.photo_url)
      if (error || !data || !data.publicUrl) {
        console.warn(
          `Failed to get public URL for membership card photo (${member.photo_url}):`,
          error?.message || "No public URL",
        )
        return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 10px; font-weight: bold;">صورة</div>'
      }
      photoUrl = data.publicUrl
    }

    return `<img src="${photoUrl}" alt="صورة المنخرط" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\"display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 10px; font-weight: bold;\\">صورة</div>'">`
  }

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>بطاقة الانخراط</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
        .card { 
          width: 85.6mm; height: 53.98mm; 
          background: #fff;
          border-radius: 8px; position: relative; overflow: hidden;
          color: #111; padding: 8px; box-sizing: border-box;
          border: 1.5px solid #222;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .gov-header {
          text-align: center;
          font-size: 8px;
          color: #222;
          font-weight: bold;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .header { text-align: center; margin-bottom: 6px; }
        .content { display: flex; gap: 8px; }
        .photo { 
          width: 50px; 
          height: 60px; 
          background: #eee; 
          border-radius: 6px; 
          overflow: hidden; 
          border: 1px solid #aaa;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        .info { flex: 1; font-size: 10px; color: #111; }
        .name { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
        .footer { position: absolute; bottom: 4px; left: 4px; right: 4px; text-align: center; font-size: 8px; background: #f5f5f5; color: #222; padding: 2px; border-radius: 4px; border-top: 1px solid #ddd; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="gov-header">
          الجمهورية الجزائرية الديمقراطية الشعبية<br>
          وزارة الشباب والرياضة
        </div>
        <div class="header">
          <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" alt="شعار دار الشباب" style="width:20px;height:20px;border-radius:50%;margin:0 auto 2px auto;display:block;">
          <div style="font-size: 10px; font-weight: bold;">دار الشباب سليمي إبراهيم</div>
          <div style="font-size: 8px;">بئر العاتر - تبسة</div>
        </div>
        <div class="content">
          <div class="photo">
            ${getPhotoHtml()}
          </div>
          <div class="info">
            <div class="name">${member.first_name} ${member.last_name}</div>
            <div>الرقم: ${member.member_id}</div>
            <div>البطاقة: ${member.membership_card_number}</div>
            <div>العمر: ${age} سنة</div>
            <div style="font-size: 8px;">${member.selected_activity}</div>
          </div>
        </div>
        <div class="footer">صالحة للموسم 2024-2025</div>
      </div>
    </body>
    </html>
  `
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
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="certificate">
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
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="certificate">
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
