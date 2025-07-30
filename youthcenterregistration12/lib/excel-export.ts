import * as XLSX from "xlsx"
import FileSaver from "file-saver"
import type { Member } from "./supabase"
import { calculateAge, getAgeGroup } from "./utils"
import { activitiesMapping } from "./activities-data"

export function exportMembersToExcel(members: Member[]) {
  // Prepare data for Excel
  const excelData = members.map((member) => ({
    "الرقم التعريفي": member.member_id,
    "الاسم الكامل": `${member.first_name} ${member.last_name}`,
    "تاريخ الميلاد": new Date(member.birth_date).toLocaleDateString("ar-DZ"),
    العمر: calculateAge(member.birth_date),
    الجنس: member.gender === "male" ? "ذكر" : "أنثى",
    "ولاية الميلاد": member.birth_place_wilaya,
    "بلدية الميلاد": member.birth_place_commune,
    "رقم الهاتف": member.phone,
    "المستوى الدراسي": member.education_level,
    "رقم بطاقة الانخراط": member.membership_card_number,
    الفضاء: member.selected_space,
    النادي: member.selected_club,
    النشاط: member.selected_activity,
    "تاريخ التسجيل": new Date(member.registration_date).toLocaleDateString("ar-DZ"),
    "حالة الدفع": member.payment_confirmed ? "مدفوع" : "غير مدفوع",
    قاصر: member.is_minor ? "نعم" : "لا",
  }))

  // Create workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "قائمة المنخرطين")

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  FileSaver.saveAs(data, `قائمة_المنخرطين_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportStatisticsToExcel(members: Member[]) {
  // Define age groups and labels
  const ageGroups = [
    { key: "5-15", label: "من 5 إلى 15 سنة" },
    { key: "16-22", label: "من 16 إلى 22 سنة" },
    { key: "23-29", label: "من 23 إلى 29 سنة" },
    { key: "30+", label: "30 سنة فما فوق" },
  ]

  // Build a nested structure: {space: {club: [activities]}}
  const structure: Record<string, Record<string, string[]>> = {}
  Object.entries(activitiesMapping).forEach(([activity, info]) => {
    const { space, club } = info
    if (!structure[space]) structure[space] = {}
    if (!structure[space][club]) structure[space][club] = []
    structure[space][club].push(activity)
  })

  // Prepare the worksheet data
  const wsData: any[][] = []

  // Header rows (as in screenshot)
  wsData.push([
    "الجمهورية الجزائرية الديمقراطية الشعبية",
    "وزارة الشباب والرياضة",
    "ديوان مؤسسات الشباب",
    "دار الشباب سليمي إبراهيم بئر العاتر",
    "ولاية تبسة",
    "مديرية الشباب والرياضة",
  ])
  wsData.push([])
  wsData.push([
    "بطاقة إحصائية للمنخرطين بالمؤسسات الشبانية حسب الإختصاصات والأنشطة السنوية",
    "من 01 أكتوبر 2023 إلى 30 سبتمبر 2024"
  ])
  wsData.push([])

  // Table header (multi-row, merged)
  wsData.push([
    "الأنشطة الثقافية والفنية", "الفضاءات", "عدد المنخرطين", "عدد النوادي", "الفئات العمرية للمشتركين حسب النشاطات", "المجموع", "عدد الجمعيات الشريكة"
  ])
  wsData.push([
    "", "", "ذكور", "إناث", "مجموع", ...ageGroups.map(a => a.label), "العام", "المجموع"
  ])

  // For each space, club, and activity, add rows
  Object.entries(structure).forEach(([space, clubs]) => {
    Object.entries(clubs).forEach(([club, activities]) => {
      activities.forEach((activity, idx) => {
        // Filter members for this activity
        const activityMembers = members.filter(m => m.selected_activity === activity)
        // Count by gender
        const male = activityMembers.filter(m => m.gender === "male").length
        const female = activityMembers.filter(m => m.gender === "female").length
        const total = activityMembers.length
        // Count by age group and gender
        const ageCounts = ageGroups.map(ag => {
          const groupMembers = activityMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key)
          return {
            male: groupMembers.filter(m => m.gender === "male").length,
            female: groupMembers.filter(m => m.gender === "female").length,
            total: groupMembers.length,
          }
        })
        // Row: [activity, space, male, female, total, ...age group totals, total, ""]
        wsData.push([
          idx === 0 ? club : "", // Only show club name for first activity in club
          activity,
          male,
          female,
          total,
          ...ageCounts.map(a => a.total),
          total,
          ""
        ])
      })
      // Add a subtotal row for the club
      wsData.push([
        `مجموع ${club}`,
        "",
        "",
        "",
        "",
        ...ageGroups.map(() => ""),
        "",
        ""
      ])
    })
    // Add a subtotal row for the space
    wsData.push([
      `مجموع ${space}`,
      "",
      "",
      "",
      "",
      ...ageGroups.map(() => ""),
      "",
      ""
    ])
  })

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Merge cells for headers (as in screenshot)
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Top header
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Title
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // الأنشطة الثقافية والفنية
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // الفضاءات
    { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } }, // عدد المنخرطين
    { s: { r: 4, c: 5 }, e: { r: 4, c: 8 } }, // الفئات العمرية
    { s: { r: 4, c: 9 }, e: { r: 5, c: 9 } }, // المجموع
    { s: { r: 4, c: 10 }, e: { r: 5, c: 10 } }, // عدد الجمعيات
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "إحصائيات الأنشطة")

  // Save file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  FileSaver.saveAs(data, `إحصائيات_المنخرطين_${new Date().toISOString().split("T")[0]}.xlsx`)
}
