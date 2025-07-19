"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Printer, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase, type Member } from "@/lib/supabase"
import { AdminReceipt } from "@/components/admin-receipt"
import { CandidateReceipt } from "@/components/candidate-receipt"
import { MembershipCard } from "@/components/membership-card"
import { generateMemberZip } from "@/lib/zip-generator"

export default function MemberDetailPage() {
  const params = useParams()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchMember()
    }
  }, [params.id])

  const fetchMember = async () => {
    try {
      const { data, error } = await supabase.from("members").select("*").eq("id", params.id).single()

      if (error) throw error
      setMember(data)
    } catch (error) {
      console.error("Error fetching member:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintAdminReceipt = () => {
    if (!member) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const adminReceiptHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>وصل التسجيل - نسخة الإدارة</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
          .photo { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; float: left; margin: 0 0 10px 10px; }
          .title { color: #16a34a; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${member.photo_url && !member.photo_url.startsWith("placeholder/") ? `<img src="${member.photo_url}" alt="صورة المنخرط" class="photo">` : ""}
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

    printWindow.document.write(adminReceiptHtml)
    printWindow.document.close()
    printWindow.print()
  }

  const handlePrintCandidateReceipt = () => {
    if (!member) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const candidateReceiptHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>وصل مؤقت للمنخرط</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; max-width: 500px; }
          .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
          .title { color: #1d4ed8; font-size: 18px; font-weight: bold; background: #dbeafe; padding: 10px; border-radius: 5px; }
          .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 8px 0; }
          .section { background: #f0f9ff; padding: 12px; border-radius: 6px; margin: 15px 0; }
          .status { background: #dcfce7; border: 1px solid #16a34a; }
          .payment { background: #dbeafe; border: 1px solid #1d4ed8; text-align: center; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>دار الشباب سليمي إبراهيم</h1>
          <p>بئر العاتر - تبسة</p>
          <div class="title">وصل مؤقت للمنخرط</div>
        </div>
        
        <div class="info-item"><span>الاسم الكامل:</span><span><strong>${member.first_name} ${member.last_name}</strong></span></div>
        <div class="info-item"><span>الرقم التعريفي:</span><span style="color: #1d4ed8; font-weight: bold;">${member.member_id}</span></div>
        <div class="info-item"><span>رقم بطاقة الانخراط:</span><span><strong>${member.membership_card_number}</strong></span></div>
        <div class="info-item"><span>النشاط:</span><span>${member.selected_activity}</span></div>
        <div class="info-item"><span>تاريخ التسجيل:</span><span>${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</span></div>
        
        <div class="section status">
          <h3 style="color: #16a34a;">حالة الملف</h3>
          <div class="info-item"><span>المستندات:</span><span style="color: #16a34a; font-weight: bold;">مكتملة ✓</span></div>
          <div class="info-item"><span>حقوق الانخراط:</span><span style="color: #16a34a; font-weight: bold;">مدفوعة ✓</span></div>
          <div class="info-item"><span>حالة التسجيل:</span><span style="color: #16a34a; font-weight: bold;">مؤكد ✓</span></div>
        </div>
        
        <div class="section payment">
          <h3 style="color: #1d4ed8;">إثبات الدفع</h3>
          <div style="font-size: 24px; font-weight: bold; color: #1d4ed8;">100 دج</div>
          <div>مائة دينار جزائري</div>
          <div style="color: #16a34a; font-size: 12px; margin-top: 5px;">✓ تم الدفع بتاريخ ${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(candidateReceiptHtml)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadZip = async () => {
    if (!member) return

    try {
      await generateMemberZip(member)
    } catch (error) {
      console.error("Error downloading ZIP:", error)
      alert("حدث خطأ أثناء تحميل الملف المضغوط")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحميل بيانات المنخرط...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-red-600 mb-4">لم يتم العثور على بيانات المنخرط</p>
            <Link href="/members">
              <Button>العودة لقائمة المنخرطين</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/members"
              className="flex items-center gap-3 text-green-800 hover:text-green-600 transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">العودة لقائمة المنخرطين</span>
            </Link>
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="شعار دار الشباب" width={70} height={70} className="rounded-full shadow-md" />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-green-800">تفاصيل المنخرط</h1>
                <p className="text-sm text-gray-600">
                  {member.first_name} {member.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          <Button onClick={handlePrintAdminReceipt} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Printer className="w-4 h-4" />
            طباعة وصل الإدارة
          </Button>
          <Button
            onClick={handlePrintCandidateReceipt}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            طباعة وصل المنخرط
          </Button>
          <Button onClick={handleDownloadZip} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4" />
            تحميل ملف ZIP
          </Button>
        </div>

        {/* Documents Display */}
        <div className="space-y-8">
          {/* Membership Card */}
          <Card className="max-w-md mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-center">بطاقة الانخراط</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <MembershipCard member={member} />
            </CardContent>
          </Card>

          {/* Receipts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="text-center">وصل الإدارة</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="scale-75 origin-top">
                  <AdminReceipt member={member} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-center">وصل المنخرط</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="scale-90 origin-top">
                  <CandidateReceipt member={member} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
