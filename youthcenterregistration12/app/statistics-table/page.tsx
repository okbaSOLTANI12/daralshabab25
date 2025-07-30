"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { activitiesMapping } from '@/lib/activities-data'

interface Member {
  id: string
  activities: string[]
  gender: string
  birthDate: string
}

export default function StatisticsTable() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // تعريف الفئات العمرية (5-15, 16-22, 23-29, 30+)
  const ageGroups = [
    { name: "من 5 إلى 15 سنة", min: 5, max: 15 },
    { name: "من 16 إلى 22 سنة", min: 16, max: 22 },
    { name: "من 23 إلى 29 سنة", min: 23, max: 29 },
    { name: "30 سنة فما فوق", min: 30, max: 100 }
  ]

  // تنظيم الأنشطة حسب الفضاءات والنوادي من ملف activities-data
  const structure = {
    "فضاء ثقافي فني": {
      "فنون تشكيلية": ["الرسم", "الخط", "الزخرفة", "أشغال يدوية", "نحت", "شريط مرسوم"],
      "فنون أدبية": ["شعر", "فضاء المواطنة", "محو الأمية", "نادي أدبي فكري", "نشاطات كشفية"],
      "فنون درامية": ["مسرح", "مونولوغ", "مسرح العرائس", "المهرج", "خيال الظل الصيني", "الحكواتي"],
      "فنون غنائية": ["موسيقى", "مجموعات صوتية", "عزف فردي", "فولكلور", "فرق نحاسية"]
    },
    "فضاء علمي تقني": {
      "السمعي البصري": ["التصوير الفوتوغرافي", "التصميم", "الصحفي الصغير", "الصحفي الكبير", "التنشيط الاذاعي والتلفزي", "المحتوى المرئي"],
      "الإعلام الآلي": ["الانترنيت", "الاعلام الآلي", "المواقع", "المكتبة الالكترونية"],
      "النادي البيئي": ["النادي الأخضر", "التطوع البيئي", "تربية الأسماك", "تربية الطيور"],
      "الابتكارات": ["الذكاء الاصطناعي", "الطاقات المتجددة", "الشاطر الصغير", "هواة الجمع", "الالكترونيك", "ابتكارات علمية"],
      "المكتبة": ["مطالعة", "لغات", "تحضير مدرسي"]
    },
    "فضاء رياضي ترفيهي": {
      "رياضي ترفيهي": ["تنس الطاولة", "الكراتي دو", "الجيدو", "البلياردو", "البابي فوت", "الكرة الحديدية", "الكينغ فو", "فول كنتاكت", "فول كنتاكت فو فيتنام", "العاب اجتماعية"],
      "رياضي فكري": ["شطرنج", "العاب الكترونية", "كلمات متقاطعة"],
      "سياحة تربوية": ["تجوال", "تخييم", "رحلات", "نزهات", "خرجات", "تبادلات"]
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const getActivityStats = (activity: string) => {
    const activityMembers = members.filter(m => m.activities?.includes(activity))
    const totalMembers = activityMembers.length
    const maleMembers = activityMembers.filter(m => m.gender === 'ذكر').length
    const femaleMembers = activityMembers.filter(m => m.gender === 'أنثى').length

    const ageStats = ageGroups.map(group => {
      const ageMembers = activityMembers.filter(m => {
        const age = calculateAge(m.birthDate)
        return age >= group.min && age <= group.max
      })
      const male = ageMembers.filter(m => m.gender === 'ذكر').length
      const female = ageMembers.filter(m => m.gender === 'أنثى').length
      return { male, female, total: male + female }
    })

    return { totalMembers, maleMembers, femaleMembers, ageStats }
  }

  const getClubStats = (activities: string[]) => {
    const clubMembers = members.filter(m => 
      m.activities?.some(activity => activities.includes(activity))
    )
    const totalMembers = clubMembers.length
    const maleMembers = clubMembers.filter(m => m.gender === 'ذكر').length
    const femaleMembers = clubMembers.filter(m => m.gender === 'أنثى').length

    const ageStats = ageGroups.map(group => {
      const ageMembers = clubMembers.filter(m => {
        const age = calculateAge(m.birthDate)
        return age >= group.min && age <= group.max
      })
      const male = ageMembers.filter(m => m.gender === 'ذكر').length
      const female = ageMembers.filter(m => m.gender === 'أنثى').length
      return { male, female, total: male + female }
    })

    return { totalMembers, maleMembers, femaleMembers, ageStats }
  }

  const getSpaceStats = (clubs: Record<string, string[]>) => {
    const spaceMembers = members.filter(m => 
      m.activities?.some(activity => 
        Object.values(clubs).flat().includes(activity)
      )
    )
    const totalMembers = spaceMembers.length
    const maleMembers = spaceMembers.filter(m => m.gender === 'ذكر').length
    const femaleMembers = spaceMembers.filter(m => m.gender === 'أنثى').length

    const ageStats = ageGroups.map(group => {
      const ageMembers = spaceMembers.filter(m => {
        const age = calculateAge(m.birthDate)
        return age >= group.min && age <= group.max
      })
      const male = ageMembers.filter(m => m.gender === 'ذكر').length
      const female = ageMembers.filter(m => m.gender === 'أنثى').length
      return { male, female, total: male + female }
    })

    return { totalMembers, maleMembers, femaleMembers, ageStats }
  }

  const getTotalStats = () => {
    const totalMembers = members.length
    const maleMembers = members.filter(m => m.gender === 'ذكر').length
    const femaleMembers = members.filter(m => m.gender === 'أنثى').length

    const ageStats = ageGroups.map(group => {
      const ageMembers = members.filter(m => {
        const age = calculateAge(m.birthDate)
        return age >= group.min && age <= group.max
      })
      const male = ageMembers.filter(m => m.gender === 'ذكر').length
      const female = ageMembers.filter(m => m.gender === 'أنثى').length
      return { male, female, total: male + female }
    })

    return { totalMembers, maleMembers, femaleMembers, ageStats }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              وزارة الشباب والرياضة
            </h2>
            <h3 className="text-lg font-medium text-gray-600 mb-4">
              بطاقة احصائية للمنخرطين بالمؤسسات الشبانية
            </h3>
            <p className="text-gray-500">
              حسب الاختصاصات والنشاطات السنوية
            </p>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table Headers */}
              <thead>
                <tr className="bg-purple-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    الفضاءات
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    النوادي
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    الأنشطة
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" colSpan={3}>
                    عدد المنخرطين
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    عدد النوادي
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" colSpan={12}>
                    الفئات العمرية للمنخرطين حسب النشاطات
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    المجموع العام
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold" rowSpan={2}>
                    عدد الجمعيات الشريكة
                  </th>
                </tr>
                <tr className="bg-orange-100">
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">ذكور</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">إناث</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">مجموع</th>
                  {ageGroups.map(group => (
                    <React.Fragment key={group.name}>
                      <th className="border border-gray-300 px-2 py-2 text-center font-semibold">ذكور</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-semibold">إناث</th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-semibold">مجموع</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {Object.entries(structure).map(([spaceName, clubs]) => (
                  <React.Fragment key={spaceName}>
                    {/* Space Row */}
                    <tr className="bg-purple-50">
                      <td className="border border-gray-300 px-4 py-3 font-bold text-center" colSpan={2}>
                        {spaceName}
                      </td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      {Array(12).fill(0).map((_, i) => (
                        <td key={i} className="border border-gray-300 px-4 py-3"></td>
                      ))}
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                    </tr>

                    {Object.entries(clubs).map(([clubName, activities]) => (
                      <React.Fragment key={clubName}>
                        {/* Club Row */}
                        <tr className="bg-blue-50">
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3 font-semibold text-center">
                            {clubName}
                          </td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          {Array(12).fill(0).map((_, i) => (
                            <td key={i} className="border border-gray-300 px-4 py-3"></td>
                          ))}
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                        </tr>

                        {/* Activity Rows */}
                        {activities.map(activity => {
                          const stats = getActivityStats(activity)
                          return (
                            <tr key={activity} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3"></td>
                              <td className="border border-gray-300 px-4 py-3"></td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {activity}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {stats.maleMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {stats.femaleMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                                {stats.totalMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {activities.length}
                              </td>
                              {stats.ageStats.map((ageStat, index) => (
                                <React.Fragment key={index}>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {ageStat.male}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {ageStat.female}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                                    {ageStat.total}
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="border border-gray-300 px-4 py-3 text-center font-bold">
                                {stats.totalMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                -
                              </td>
                            </tr>
                          )
                        })}

                        {/* Club Total Row */}
                        {(() => {
                          const clubStats = getClubStats(activities)
                          return (
                            <tr className="bg-purple-100 font-bold">
                              <td className="border border-gray-300 px-4 py-3"></td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                مجموع {clubName}
                              </td>
                              <td className="border border-gray-300 px-4 py-3"></td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {clubStats.maleMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {clubStats.femaleMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {clubStats.totalMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {activities.length}
                              </td>
                              {clubStats.ageStats.map((ageStat, index) => (
                                <React.Fragment key={index}>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {ageStat.male}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {ageStat.female}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {ageStat.total}
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {clubStats.totalMembers}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                -
                              </td>
                            </tr>
                          )
                        })()}
                      </React.Fragment>
                    ))}

                    {/* Space Total Row */}
                    {(() => {
                      const spaceStats = getSpaceStats(clubs)
                      return (
                        <tr className="bg-purple-200 font-bold">
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            مجموع {spaceName}
                          </td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3"></td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {spaceStats.maleMembers}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {spaceStats.femaleMembers}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {spaceStats.totalMembers}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {Object.values(clubs).flat().length}
                          </td>
                          {spaceStats.ageStats.map((ageStat, index) => (
                            <React.Fragment key={index}>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {ageStat.male}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {ageStat.female}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {ageStat.total}
                              </td>
                            </React.Fragment>
                          ))}
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {spaceStats.totalMembers}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            -
                          </td>
                        </tr>
                      )
                    })()}
                  </React.Fragment>
                ))}

                {/* Grand Total Row */}
                {(() => {
                  const totalStats = getTotalStats()
                  return (
                    <tr className="bg-blue-200 font-bold">
                      <td className="border border-gray-300 px-4 py-3 text-center" colSpan={2}>
                        المجموع العام
                      </td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {totalStats.maleMembers}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {totalStats.femaleMembers}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {totalStats.totalMembers}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {Object.values(structure).reduce((acc, clubs) => 
                          acc + Object.values(clubs).flat().length, 0
                        )}
                      </td>
                      {totalStats.ageStats.map((ageStat, index) => (
                        <React.Fragment key={index}>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {ageStat.male}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {ageStat.female}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {ageStat.total}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {totalStats.totalMembers}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        -
                      </td>
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
          >
            طباعة الإحصائيات
          </button>
        </div>
      </div>
    </div>
  )
} 