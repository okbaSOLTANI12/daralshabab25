"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Users, Activity, TrendingUp, PieChart } from "lucide-react"
import { supabase, type Member } from "@/lib/supabase"
import { calculateAge, getAgeGroup } from "@/lib/utils"
import { exportStatisticsToExcel } from "@/lib/excel-export"
import Link from "next/link"
import Image from "next/image"

interface Statistics {
  totalMembers: number
  maleMembers: number
  femaleMembers: number
  ageGroups: Record<string, { male: number; female: number; total: number }>
  spaces: Record<string, number>
  activities: Record<string, Record<string, { male: number; female: number }>>
}

export default function StatisticsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembersAndCalculateStats()
  }, [])

  const fetchMembersAndCalculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("registration_date", { ascending: false })

      if (error) throw error

      const membersData = data || []
      setMembers(membersData)

      // Calculate statistics
      const stats = calculateStatistics(membersData)
      setStatistics(stats)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (membersData: Member[]): Statistics => {
    const totalMembers = membersData.length
    const maleMembers = membersData.filter((m) => m.gender === "male").length
    const femaleMembers = membersData.filter((m) => m.gender === "female").length

    // Age groups - UPDATED to match lib/utils.ts and lib/excel-export.ts
    const ageGroups = ["5-15", "16-22", "23-29", "30+"].reduce(
      (acc, ageGroup) => {
        const groupMembers = membersData.filter((m) => getAgeGroup(calculateAge(m.birth_date)) === ageGroup)
        acc[ageGroup] = {
          male: groupMembers.filter((m) => m.gender === "male").length,
          female: groupMembers.filter((m) => m.gender === "female").length,
          total: groupMembers.length,
        }
        return acc
      },
      {} as Record<string, { male: number; female: number; total: number }>,
    )

    // Spaces
    const spaces = membersData.reduce(
      (acc, member) => {
        acc[member.selected_space] = (acc[member.selected_space] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Activities by age group and gender
    const activities = membersData.reduce(
      (acc, member) => {
        const activity = member.selected_activity
        const ageGroup = getAgeGroup(calculateAge(member.birth_date))

        if (!acc[activity]) {
          acc[activity] = {}
        }
        if (!acc[activity][ageGroup]) {
          acc[activity][ageGroup] = { male: 0, female: 0 }
        }

        acc[activity][ageGroup][member.gender]++
        return acc
      },
      {} as Record<string, Record<string, { male: number; female: number }>>,
    )

    return {
      totalMembers,
      maleMembers,
      femaleMembers,
      ageGroups,
      spaces,
      activities,
    }
  }

  const handleExportStatistics = async () => {
    try {
      exportStatisticsToExcel(members)
    } catch (error) {
      console.error("Error exporting statistics:", error)
      alert("حدث خطأ أثناء تصدير الإحصائيات")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-red-600 mb-4">لم يتم العثور على بيانات إحصائية</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-green-800 hover:text-green-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">العودة للرئيسية</span>
            </Link>
            <div className="flex items-center gap-4">
              <Image
                src="/new-logo.jpeg"
                alt="شعار دار الشباب"
                width={70}
                height={70}
                className="rounded-full shadow-md"
              />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-green-800">الإحصائيات</h1>
                <p className="text-sm text-gray-600">تحليل شامل لبيانات المنخرطين</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleExportStatistics}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Download className="w-5 h-5" />
            تصدير الإحصائيات (Excel)
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">إجمالي المنخرطين</CardTitle>
              <Users className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalMembers}</div>
              <p className="text-xs opacity-80 mt-1">منخرط نشط</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">الذكور</CardTitle>
              <Users className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.maleMembers}</div>
              <p className="text-xs opacity-80 mt-1">
                {statistics.totalMembers > 0
                  ? ((statistics.maleMembers / statistics.totalMembers) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">الإناث</CardTitle>
              <Users className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.femaleMembers}</div>
              <p className="text-xs opacity-80 mt-1">
                {statistics.totalMembers > 0
                  ? ((statistics.femaleMembers / statistics.totalMembers) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">الأنشطة</CardTitle>
              <Activity className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(statistics.activities).length}</div>
              <p className="text-xs opacity-80 mt-1">نشاط متنوع</p>
            </CardContent>
          </Card>
        </div>

        {/* Age Groups Statistics */}
        <Card className="mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6" />
              إحصائيات الفئات العمرية
            </CardTitle>
            <CardDescription className="text-green-100">توزيع المنخرطين حسب الفئات العمرية والجنس</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="border-2 border-gray-300 px-6 py-4 text-right font-bold text-gray-700">
                      الفئة العمرية
                    </th>
                    <th className="border-2 border-gray-300 px-6 py-4 font-bold text-green-600">الذكور</th>
                    <th className="border-2 border-gray-300 px-6 py-4 font-bold text-pink-600">الإناث</th>
                    <th className="border-2 border-gray-300 px-6 py-4 font-bold text-blue-600">المجموع</th>
                    <th className="border-2 border-gray-300 px-6 py-4 font-bold text-purple-600">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics.ageGroups).map(([ageGroup, data]) => (
                    <tr key={ageGroup} className="hover:bg-gray-50 transition-colors">
                      <td className="border-2 border-gray-300 px-6 py-4 font-medium bg-gray-50">
                        {/* UPDATED age group labels */}
                        {ageGroup === "5-15" && "من 5 إلى 15 سنة"}
                        {ageGroup === "16-22" && "من 16 إلى 22 سنة"}
                        {ageGroup === "23-29" && "من 23 إلى 29 سنة"}
                        {ageGroup === "30+" && "30 سنة فما فوق"}
                      </td>
                      <td className="border-2 border-gray-300 px-6 py-4 text-center text-green-600 font-bold text-lg">
                        {data.male}
                      </td>
                      <td className="border-2 border-gray-300 px-6 py-4 text-center text-pink-600 font-bold text-lg">
                        {data.female}
                      </td>
                      <td className="border-2 border-gray-300 px-6 py-4 text-center text-blue-600 font-bold text-xl">
                        {data.total}
                      </td>
                      <td className="border-2 border-gray-300 px-6 py-4 text-center font-semibold">
                        {statistics.totalMembers > 0 ? ((data.total / statistics.totalMembers) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-blue-100 to-green-100 font-bold text-lg">
                    <td className="border-2 border-gray-300 px-6 py-4">المجموع الكلي</td>
                    <td className="border-2 border-gray-300 px-6 py-4 text-center text-green-600">
                      {statistics.maleMembers}
                    </td>
                    <td className="border-2 border-gray-300 px-6 py-4 text-center text-pink-600">
                      {statistics.femaleMembers}
                    </td>
                    <td className="border-2 border-gray-300 px-6 py-4 text-center text-blue-600">
                      {statistics.totalMembers}
                    </td>
                    <td className="border-2 border-gray-300 px-6 py-4 text-center">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Spaces Distribution */}
        <Card className="mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="w-6 h-6" />
              توزيع المنخرطين حسب الفضاءات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(statistics.spaces).map(([space, count]) => (
                <div
                  key={space}
                  className="text-center p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-sm mb-3 text-gray-700">{space}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{count}</div>
                  <div className="text-sm text-gray-500 font-semibold">
                    {statistics.totalMembers > 0 ? ((count / statistics.totalMembers) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Activity Statistics */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">إحصائيات مفصلة للأنشطة</CardTitle>
            <CardDescription className="text-orange-100">
              توزيع المنخرطين في كل نشاط حسب الفئات العمرية والجنس
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {Object.entries(statistics.activities).map(([activity, ageData]) => (
              <div
                key={activity}
                className="mb-8 p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50"
              >
                <h3 className="font-bold text-xl mb-4 text-green-800 border-b-2 border-green-200 pb-2">{activity}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <th className="border border-gray-300 px-3 py-2 text-right font-bold">الفئة العمرية</th>
                        <th className="border border-gray-300 px-3 py-2 font-bold text-green-600">ذكور</th>
                        <th className="border border-gray-300 px-3 py-2 font-bold text-pink-600">إناث</th>
                        <th className="border border-gray-300 px-3 py-2 font-bold text-blue-600">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(ageData).map(([ageGroup, genderData]) => {
                        const total = genderData.male + genderData.female
                        return (
                          <tr key={ageGroup} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                              {/* UPDATED age group labels */}
                              {ageGroup === "5-15" && "5-15 سنة"}
                              {ageGroup === "16-22" && "16-22 سنة"}
                              {ageGroup === "23-29" && "23-29 سنة"}
                              {ageGroup === "30+" && "30+ سنة"}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-semibold">
                              {genderData.male}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-pink-600 font-semibold">
                              {genderData.female}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center font-bold text-blue-600">
                              {total}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
