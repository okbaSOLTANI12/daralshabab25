"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Home } from "lucide-react"
import Link from "next/link"
import { supabase, type Member } from "@/lib/supabase"
import { MembershipCard } from "@/components/membership-card"
import { AdminReceipt } from "@/components/admin-receipt"
import { CandidateReceipt } from "@/components/candidate-receipt"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const memberId = searchParams.get("memberId")
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (memberId) {
      fetchMember()
    }
  }, [memberId])

  const fetchMember = async () => {
    try {
      const { data, error } = await supabase.from("members").select("*").eq("member_id", memberId).single()

      if (error) throw error
      setMember(data)
    } catch (error) {
      console.error("Error fetching member:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!member) return

    // This would generate and download a ZIP file with all documents
    console.log("Downloading ZIP file for member:", member.member_id)
    // Implementation would go here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-red-600 mb-4">لم يتم العثور على بيانات المنخرط</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50" dir="rtl">
      <main className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <Card className="max-w-2xl mx-auto mb-8 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">تم التسجيل بنجاح!</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8">
            <p className="text-lg mb-4">
              مرحباً{" "}
              <strong>
                {member.first_name} {member.last_name}
              </strong>
            </p>
            <p className="text-gray-600 mb-6">
              تم تسجيلك بنجاح في دار الشباب. رقمك التعريفي هو:
              <span className="font-mono text-blue-600 font-bold"> {member.member_id}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownloadZip} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                تحميل ملف ZIP
              </Button>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview Documents */}
        <div className="space-y-8">
          {/* Membership Card Preview */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">بطاقة الانخراط</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <MembershipCard member={member} />
            </CardContent>
          </Card>

          {/* Receipts Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">وصل الإدارة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="scale-75 origin-top">
                  <AdminReceipt member={member} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">وصل المنخرط</CardTitle>
              </CardHeader>
              <CardContent>
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
