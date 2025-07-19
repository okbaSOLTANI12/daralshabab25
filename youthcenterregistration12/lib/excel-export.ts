import * as XLSX from "xlsx"
import FileSaver from "file-saver"
import type { Member } from "./supabase"
import { calculateAge, getAgeGroup } from "./utils"

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
  const wb = XLSX.utils.book_new()

  // Overall statistics
  const overallStats = {
    "إجمالي المنخرطين": members.length,
    الذكور: members.filter((m) => m.gender === "male").length,
    الإناث: members.filter((m) => m.gender === "female").length,
  }

  const overallWs = XLSX.utils.json_to_sheet([overallStats])
  XLSX.utils.book_append_sheet(wb, overallWs, "الإحصائيات العامة")

  // Age group statistics
  // Age group arrays and labels are consistent with lib/utils.ts
  const ageGroups = ["5-15", "16-22", "23-29", "30+"]
  const ageGroupStats = ageGroups.map((ageGroup) => {
    const membersInGroup = members.filter((m) => getAgeGroup(calculateAge(m.birth_date)) === ageGroup)
    return {
      "الفئة العمرية":
        ageGroup === "5-15"
          ? "من 5 إلى 15 سنة"
          : ageGroup === "16-22"
            ? "من 16 إلى 22 سنة"
            : ageGroup === "23-29"
              ? "من 23 إلى 29 سنة"
              : "30 سنة فما فوق",
      الذكور: membersInGroup.filter((m) => m.gender === "male").length,
      الإناث: membersInGroup.filter((m) => m.gender === "female").length,
      المجموع: membersInGroup.length,
      النسبة: `${((membersInGroup.length / members.length) * 100).toFixed(1)}%`,
    }
  })

  const ageGroupWs = XLSX.utils.json_to_sheet(ageGroupStats)
  XLSX.utils.book_append_sheet(wb, ageGroupWs, "الفئات العمرية")

  // Activity statistics
  const activities = [...new Set(members.map((m) => m.selected_activity))]
  const activityStats = activities.map((activity) => {
    const activityMembers = members.filter((m) => m.selected_activity === activity)
    // In activityStats, breakdown uses the consistent ageGroups array
    const ageGroupBreakdown = ageGroups.reduce(
      (acc, ageGroup) => {
        const groupMembers = activityMembers.filter((m) => getAgeGroup(calculateAge(m.birth_date)) === ageGroup)
        acc[`${ageGroup}_ذكور`] = groupMembers.filter((m) => m.gender === "male").length
        acc[`${ageGroup}_إناث`] = groupMembers.filter((m) => m.gender === "female").length
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      النشاط: activity,
      "المجموع الكلي": activityMembers.length,
      ...ageGroupBreakdown,
    }
  })

  const activityWs = XLSX.utils.json_to_sheet(activityStats)
  XLSX.utils.book_append_sheet(wb, activityWs, "إحصائيات الأنشطة")

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  FileSaver.saveAs(data, `إحصائيات_المنخرطين_${new Date().toISOString().split("T")[0]}.xlsx`)
}
