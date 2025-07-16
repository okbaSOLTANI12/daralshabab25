"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Search, Download, Printer, FileArchive, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase, type Member } from "@/lib/supabase"
import { calculateAge } from "@/lib/utils"
import { exportMembersToExcel } from "@/lib/excel-export"
import { generateMemberZip } from "@/lib/zip-generator"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.first_name.includes(searchTerm) ||
        member.last_name.includes(searchTerm) ||
        member.member_id.includes(searchTerm) ||
        member.selected_activity.includes(searchTerm),
    )
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("registration_date", { ascending: false })

      if (error) throw error
      setMembers(data || [])
      setFilteredMembers(data || [])
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map((member) => member.id))
    }
  }

  const handleDownloadZip = async (member: Member) => {
    try {
      console.log("Starting ZIP generation for member:", member.member_id)
      await generateMemberZip(member)
      console.log("ZIP generation completed successfully")
    } catch (error) {
      console.error("Error downloading ZIP:", error)
      alert("حدث خطأ أثناء تحميل الملف المضغوط")
    }
  }

  const handleExportExcel = async () => {
    try {
      exportMembersToExcel(filteredMembers)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("حدث خطأ أثناء تصدير ملف Excel")
    }
  }

  const handlePrintSelected = () => {
    const selectedMemberData = filteredMembers.filter((member) => selectedMembers.includes(member.id))
    if (selectedMemberData.length === 0) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>قائمة المنخرطين المحددين</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>دار الشباب سليمي إبراهيم بئر العاتر</h1>
          <h2>قائمة المنخرطين المحددين</h2>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-DZ")}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>الرقم التعريفي</th>
              <th>الاسم الكامل</th>
              <th>العمر</th>
              <th>الجنس</th>
              <th>النشاط</th>
              <th>رقم البطاقة</th>
              <th>تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            ${selectedMemberData
              .map(
                (member) => `
              <tr>
                <td>${member.member_id}</td>
                <td>${member.first_name} ${member.last_name}</td>
                <td>${calculateAge(member.birth_date)}</td>
                <td>${member.gender === "male" ? "ذكر" : "أنثى"}</td>
                <td>${member.selected_activity}</td>
                <td>${member.membership_card_number}</td>
                <td>${new Date(member.registration_date).toLocaleDateString("ar-DZ")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const getImageUrl = (member: Member) => {
    if (!member.photo_url || member.photo_url.startsWith("placeholder/")) {
      return null
    }

    // If it's already a full URL, return it
    if (member.photo_url.startsWith("http")) {
      return member.photo_url
    }

    // Construct Supabase storage URL
    try {
      const { data } = supabase.storage.from("documents").getPublicUrl(member.photo_url)
      return data.publicUrl
    } catch (error) {
      console.warn("Error getting image URL:", error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحميل قائمة المنخرطين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-green-800 hover:text-green-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">العودة للرئيسية</span>
            </Link>
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="شعار دار الشباب" width={70} height={70} className="rounded-full shadow-md" />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-green-800">قائمة المنخرطين</h1>
                <p className="text-sm text-gray-600">إدارة ومتابعة المنخرطين</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">قائمة المنخرطين</CardTitle>
                <CardDescription className="text-green-100 text-lg">
                  إجمالي المنخرطين: <span className="font-bold text-yellow-300">{filteredMembers.length}</span>
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 font-semibold"
                >
                  <Download className="w-4 h-4" />
                  تصدير Excel
                </Button>
                <Button
                  onClick={handlePrintSelected}
                  variant="outline"
                  className="flex items-center gap-2 bg-white/10 border-white text-white hover:bg-white/20"
                  disabled={selectedMembers.length === 0}
                >
                  <Printer className="w-4 h-4" />
                  طباعة المحدد ({selectedMembers.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="البحث بالاسم، الرقم التعريفي، أو النشاط..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-12 h-14 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => {
                const imageUrl = getImageUrl(member)

                return (
                  <Card
                    key={member.id}
                    className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 bg-gradient-to-br from-white to-gray-50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleSelectMember(member.id)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <Badge
                          variant={member.payment_confirmed ? "default" : "secondary"}
                          className="bg-green-100 text-green-800"
                        >
                          {member.payment_confirmed ? "مدفوع" : "غير مدفوع"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt="صورة المنخرط"
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                // Hide the image and show initials on error
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `<span class="text-white font-bold text-lg">${member.first_name.charAt(0)}${member.last_name.charAt(0)}</span>`
                                }
                              }}
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {member.first_name.charAt(0)}
                              {member.last_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {member.first_name} {member.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 font-mono">{member.member_id}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">العمر:</span>
                          <span className="font-semibold mr-2">{calculateAge(member.birth_date)} سنة</span>
                        </div>
                        <div>
                          <span className="text-gray-500">الجنس:</span>
                          <span className="font-semibold mr-2">{member.gender === "male" ? "ذكر" : "أنثى"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">النشاط:</span>
                          <span className="font-semibold mr-2">{member.selected_activity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">رقم البطاقة:</span>
                          <span className="font-semibold mr-2">{member.membership_card_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">التسجيل:</span>
                          <span className="font-semibold mr-2">
                            {new Date(member.registration_date).toLocaleDateString("ar-DZ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          onClick={() => handleDownloadZip(member)}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <FileArchive className="w-4 h-4 mr-1" />
                          تحميل ZIP
                        </Button>
                        <Link href={`/member/${member.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">لم يتم العثور على منخرطين يطابقون البحث "{searchTerm}"</p>
              </div>
            )}

            {/* Select All Button */}
            {filteredMembers.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  className="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50"
                >
                  {selectedMembers.length === filteredMembers.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
