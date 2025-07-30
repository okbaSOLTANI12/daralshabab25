import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import type { Member } from "./supabase";
import { calculateAge, getAgeGroup } from "./utils";
import { activitiesMapping } from "./activities-data";

export function exportStatisticsToExcel(members: Member[]) {
  const ageGroups = [
    { key: "5-15", label: "من 5 إلى 15 سنة" },
    { key: "16-22", label: "من 16 إلى 22 سنة" },
    { key: "23-29", label: "من 23 إلى 29 سنة" },
    { key: "30+", label: "30 سنة فما فوق" },
  ];

  // تنظيم الأنشطة حسب الفضاءات والنوادي كما في الصور
  const structure: Record<string, Record<string, string[]>> = {};
  Object.entries(activitiesMapping).forEach(([activity, info]) => {
    const { space, club } = info;
    if (!structure[space]) structure[space] = {};
    if (!structure[space][club]) structure[space][club] = [];
    structure[space][club].push(activity);
  });

  const wsData: any[][] = [];

  // الصف الأول: العنوان الرئيسي
  wsData.push([
    "الجمهورية الجزائرية الديمقراطية الشعبية",
    "وزارة الشباب والرياضة",
    "ديوان مؤسسات الشباب",
    "دار الشباب سليمي إبراهيم بئر العاتر",
    "ولاية تبسة",
    "مديرية الشباب والرياضة",
  ]);

  wsData.push([]);

  // الصف الثالث: العنوان الفرعي
  wsData.push([
    "بطاقة إحصائية للمنخرطين بالمؤسسات الشبانية حسب الإختصاصات والأنشطة السنوية",
    "من 01 أكتوبر 2023 إلى 30 سبتمبر 2024"
  ]);

  wsData.push([]);

  // صفوف العناوين الرئيسية للجدول (كما في الصور)
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
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "المجموع العام",
    "عدد الجمعيات الشريكة"
  ]);

  // صف العناوين الفرعية مع ذكور وإناث لكل فئة عمرية
  const subHeaders = [];
  subHeaders.push("", ""); // النشاطات والفضاءات
  subHeaders.push("ذكور", "إناث", "مجموع"); // عدد المنخرطين
  subHeaders.push(""); // عدد النوادي
  // إضافة ذكور وإناث ومجموع لكل فئة عمرية
  ageGroups.forEach(() => {
    subHeaders.push("ذكور", "إناث", "مجموع");
  });
  subHeaders.push("", ""); // المجموع العام وعدد الجمعيات
  wsData.push(subHeaders);

  // إضافة البيانات لكل فضاء ونادي ونشاط
  Object.entries(structure).forEach(([space, clubs]) => {
    Object.entries(clubs).forEach(([club, activities]) => {
      activities.forEach((activity, idx) => {
        const activityMembers = members.filter(m => m.selected_activity === activity);
        const male = activityMembers.filter(m => m.gender === "male").length;
        const female = activityMembers.filter(m => m.gender === "female").length;
        const total = activityMembers.length;

        // حساب الإحصائيات حسب الفئات العمرية مع ذكور وإناث
        const ageData = ageGroups.map(ag => {
          const groupMembers = activityMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key);
          const groupMale = groupMembers.filter(m => m.gender === "male").length;
          const groupFemale = groupMembers.filter(m => m.gender === "female").length;
          const groupTotal = groupMembers.length;
          return { male: groupMale, female: groupFemale, total: groupTotal };
        });

        // إضافة الصف
        const row = [];
        row.push(idx === 0 ? club : ""); // اسم النادي فقط في الصف الأول
        row.push(activity); // اسم النشاط
        row.push(male, female, total); // عدد المنخرطين
        row.push(""); // عدد النوادي (فارغ)
        // إضافة بيانات الفئات العمرية
        ageData.forEach(data => {
          row.push(data.male, data.female, data.total);
        });
        row.push(total, ""); // المجموع العام وعدد الجمعيات
        wsData.push(row);
      });

      // إضافة صف المجموع للنادي
      const clubMembers = members.filter(m => 
        activitiesMapping[m.selected_activity as keyof typeof activitiesMapping]?.club === club
      );
      const clubMale = clubMembers.filter(m => m.gender === "male").length;
      const clubFemale = clubMembers.filter(m => m.gender === "female").length;
      const clubTotal = clubMembers.length;
      const clubAgeData = ageGroups.map(ag => {
        const groupMembers = clubMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key);
        const groupMale = groupMembers.filter(m => m.gender === "male").length;
        const groupFemale = groupMembers.filter(m => m.gender === "female").length;
        const groupTotal = groupMembers.length;
        return { male: groupMale, female: groupFemale, total: groupTotal };
      });

      const clubRow = [];
      clubRow.push(`مجموع ${club}`, "");
      clubRow.push(clubMale, clubFemale, clubTotal);
      clubRow.push("");
      clubAgeData.forEach(data => {
        clubRow.push(data.male, data.female, data.total);
      });
      clubRow.push(clubTotal, "");
      wsData.push(clubRow);
    });

    // إضافة صف المجموع للفضاء
    const spaceMembers = members.filter(m => 
      activitiesMapping[m.selected_activity as keyof typeof activitiesMapping]?.space === space
    );
    const spaceMale = spaceMembers.filter(m => m.gender === "male").length;
    const spaceFemale = spaceMembers.filter(m => m.gender === "female").length;
    const spaceTotal = spaceMembers.length;
    const spaceAgeData = ageGroups.map(ag => {
      const groupMembers = spaceMembers.filter(m => getAgeGroup(calculateAge(m.birth_date)) === ag.key);
      const groupMale = groupMembers.filter(m => m.gender === "male").length;
      const groupFemale = groupMembers.filter(m => m.gender === "female").length;
      const groupTotal = groupMembers.length;
      return { male: groupMale, female: groupFemale, total: groupTotal };
    });

    const spaceRow = [];
    spaceRow.push(`مجموع ${space}`, "");
    spaceRow.push(spaceMale, spaceFemale, spaceTotal);
    spaceRow.push("");
    spaceAgeData.forEach(data => {
      spaceRow.push(data.male, data.female, data.total);
    });
    spaceRow.push(spaceTotal, "");
    wsData.push(spaceRow);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

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
    { s: { r: 4, c: 6 }, e: { r: 4, c: 17 } }, // الفئات العمرية (12 أعمدة: 4 فئات × 3 أعمدة)
    { s: { r: 4, c: 18 }, e: { r: 5, c: 18 } }, // المجموع العام
    { s: { r: 4, c: 19 }, e: { r: 5, c: 19 } }, // عدد الجمعيات الشريكة
  ];

  // تطبيق التنسيق والألوان (كما في الصور)
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_address]) continue;
      
      let bgColor = "FFFFFF";
      let textColor = "000000";
      let isBold = false;
      
      // العناوين الرئيسية (الصفوف 0-5)
      if (R <= 5) {
        bgColor = "E6E6FA";
        isBold = true;
      } 
      // صفوف المجاميع
      else if (ws[cell_address].v && typeof ws[cell_address].v === 'string' && ws[cell_address].v.includes('مجموع')) {
        bgColor = "E6E6FA";
        isBold = true;
      }
      
      ws[cell_address].s = {
        alignment: { 
          horizontal: "center", 
          vertical: "center", 
          wrapText: true 
        },
        font: { 
          bold: isBold, 
          size: isBold ? 12 : 10, 
          color: { rgb: textColor } 
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
        fill: { fgColor: { rgb: bgColor } },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "إحصائيات الأنشطة");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  FileSaver.saveAs(data, `إحصائيات_المنخرطين_${new Date().toISOString().split("T")[0]}.xlsx`);
}
