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
  // تعريف الفئات العمرية كما في الصور
  const ageGroups = [
    { key: "5-15", label: "من 5 إلى 15 سنة" },
    { key: "16-22", label: "من 16 إلى 22 سنة" },
    { key: "23-29", label: "من 23 إلى 29 سنة" },
    { key: "30+", label: "30 سنة فما فوق" },
  ]

  // تنظيم الأنشطة حسب الفضاءات والنوادي كما في الصور
  const structure: Record<string, Record<string, string[]>> = {}
  Object.entries(activitiesMapping).forEach(([activity, info]) => {
    const { space, club } = info
    if (!structure[space]) structure[space] = {}
    if (!structure[space][club]) structure[space][club] = []
    structure[space][club].push(activity)
  })

  // إنشاء بيانات الجدول
  const wsData: any[][] = []

  // الصف الأول: العنوان الرئيسي
  wsData.push([
    "الجمهورية الجزائرية الديمقراطية الشعبية",
    "وزارة الشباب والرياضة",
    "ديوان مؤسسات الشباب",
    "دار الشباب سليمي إبراهيم بئر العاتر",
    "ولاية تبسة",
    "مديرية الشباب والرياضة",
  ])

  // صف فارغ
  wsData.push([])

  // الصف الثالث: العنوان الفرعي
  wsData.push([
    "بطاقة إحصائية للمنخرطين بالمؤسسات الشبانية حسب الإختصاصات والأنشطة السنوية",
    "من 01 أكتوبر 2023 إلى 30 سبتمبر 2024"
  ])

  // صف فارغ
  wsData.push([])

  // صفوف العناوين الرئيسية للجدول
  wsData.push([
    "النشاطات",
    "الفضاءات",
    "عدد المنخرطين",
    "",
    "",
    "عدد النوادي",
    "الفئات العمرية للمنخرطين حسب النشاطات",
    "",
    "",
    "",
    "",
    "المجموع العام",
    "عدد الجمعيات الشريكة"
  ])

  // صف العناوين الفرعية
  wsData.push([
    "",
    "",
    "ذكور",
    "إناث",
    "مجموع",
    "",
    ...ageGroups.map(a => a.label),
    "",
    ""
  ])

  // إضافة البيانات لكل فضاء ونادي ونشاط
  Object.entries(structure).forEach(([space, clubs]) => {
    Object.entries(clubs).forEach(([club, activities]) => {
      activities.forEach((activity, idx) => {
        // حساب الإحصائيات للنشاط
        const activityMembers = members.filter(m => m.selected_activity === activity)
        const male = activityMembers.filter(m => m.gender === "male").length
        const female = activityMembers.filter(m => m.gender === "female").length
        const total = activityMembers.length

        // حساب الإحصائيات حسب الفئات العمرية
        const ageCounts = ageGroups.map(ag => {
          const groupMembers = activityMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key)
          return groupMembers.length
        })

        // إضافة الصف
        wsData.push([
          idx === 0 ? club : "", // اسم النادي فقط في الصف الأول
          activity, // اسم النشاط
          male, // عدد الذكور
          female, // عدد الإناث
          total, // المجموع
          "", // عدد النوادي (فارغ)
          ...ageCounts, // أعداد الفئات العمرية
          total, // المجموع العام
          "" // عدد الجمعيات الشريكة (فارغ)
        ])
      })

      // إضافة صف المجموع للنادي
      const clubMembers = members.filter(m => 
        activitiesMapping[m.selected_activity as keyof typeof activitiesMapping]?.club === club
      )
      const clubMale = clubMembers.filter(m => m.gender === "male").length
      const clubFemale = clubMembers.filter(m => m.gender === "female").length
      const clubTotal = clubMembers.length
      const clubAgeCounts = ageGroups.map(ag => {
        const groupMembers = clubMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key)
        return groupMembers.length
      })

      wsData.push([
        `مجموع ${club}`,
        "",
        clubMale,
        clubFemale,
        clubTotal,
        "",
        ...clubAgeCounts,
        clubTotal,
        ""
      ])
    })

    // إضافة صف المجموع للفضاء
    const spaceMembers = members.filter(m => 
      activitiesMapping[m.selected_activity as keyof typeof activitiesMapping]?.space === space
    )
    const spaceMale = spaceMembers.filter(m => m.gender === "male").length
    const spaceFemale = spaceMembers.filter(m => m.gender === "female").length
    const spaceTotal = spaceMembers.length
    const spaceAgeCounts = ageGroups.map(ag => {
      const groupMembers = spaceMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key)
      return groupMembers.length
    })

    wsData.push([
      `مجموع ${space}`,
      "",
      spaceMale,
      spaceFemale,
      spaceTotal,
      "",
      ...spaceAgeCounts,
      spaceTotal,
      ""
    ])
  })

  // إنشاء ورقة العمل
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // دمج الخلايا للعناوين (كما في الصور)
  ws["!merges"] = [
    // العنوان الرئيسي
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    // العنوان الفرعي
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    // عناوين الأعمدة الرئيسية
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // النشاطات
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // الفضاءات
    { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } }, // عدد المنخرطين
    { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } }, // عدد النوادي
    { s: { r: 4, c: 6 }, e: { r: 4, c: 9 } }, // الفئات العمرية
    { s: { r: 4, c: 10 }, e: { r: 5, c: 10 } }, // المجموع العام
    { s: { r: 4, c: 11 }, e: { r: 5, c: 11 } }, // عدد الجمعيات الشريكة
  ]

  // تطبيق التنسيق والألوان
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
  
  // تطبيق التنسيق على جميع الخلايا
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cell_address]) continue

      // تنسيق الخلايا
      ws[cell_address].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        font: {
          bold: R <= 5, // العناوين الرئيسية عريضة
          size: R <= 5 ? 12 : 10
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        },
        fill: {
          fgColor: { rgb: R <= 5 ? "E6E6FA" : "FFFFFF" } // لون خلفية للعناوين
        }
      }
    }
  }

  // إنشاء المصنف
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "إحصائيات الأنشطة")

  // حفظ الملف
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  FileSaver.saveAs(data, `إحصائيات_المنخرطين_${new Date().toISOString().split("T")[0]}.xlsx`)
}
