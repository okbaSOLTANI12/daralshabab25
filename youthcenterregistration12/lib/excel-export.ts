import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from './supabase'
import { activitiesMapping } from './activities-data'

export async function exportStatisticsToExcel() {
  try {
    // جلب البيانات من Supabase
    const { data: members, error } = await supabase
      .from('members')
      .select('*')

    if (error) throw error

    // تعريف الفئات العمرية (5-15, 16-22, 23-29, 30+)
    const ageGroups = [
      { name: "من 5 إلى 15 سنة", min: 5, max: 15 },
      { name: "من 16 إلى 22 سنة", min: 16, max: 22 },
      { name: "من 23 إلى 29 سنة", min: 23, max: 29 },
      { name: "30 سنة فما فوق", min: 30, max: 100 }
    ]

    // تنظيم الأنشطة حسب الفضاءات والنوادي
    const structure = {
      "فنون درامية": {
        "مسرح": ["مسرح"],
        "أخرى تذكر": ["أخرى تذكر"]
      },
      "فنون تشكيلية": {
        "رسم": ["رسم"],
        "الوان زيتية": ["الوان زيتية"],
        "خط": ["خط"],
        "أشغال يدوية": ["أشغال يدوية"],
        "أخرى تذكر": ["أخرى تذكر"]
      }
    }

    // بناء بيانات الجدول
    const wsData: any[][] = [];

    // الصف الأول: العنوان الرئيسي
    wsData.push([
      "الجمهورية الجزائرية الديمقراطية الشعبية",
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
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);

    wsData.push([
      "وزارة الشباب والرياضة",
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
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);

    // صف فارغ
    wsData.push([]);

    // الصف الرابع: العنوان الفرعي
    wsData.push([
      "بطاقة احصائية للمنخرطين بالمؤسسات الشبانية حسب الاختصاصات والنشاطات السنوية",
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
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);

    // الصف الخامس: الفترة الزمنية
    wsData.push([
      "من 01 أكتوبر 2023 إلى 30 سبتمبر 2024",
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
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);

    wsData.push([]);

    // صفوف العناوين الرئيسية للجدول
    wsData.push([
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
      "",
      "المجموع العام",
      "عدد الجمعيات الشريكة"
    ]);

    // صف العناوين الفرعية مع ذكور وإناث لكل فئة عمرية
    const subHeaders = [];
    subHeaders.push(""); // الفضاءات
    subHeaders.push("ذكور", "إناث", "مجموع"); // عدد المنخرطين
    subHeaders.push(""); // عدد النوادي
    // إضافة ذكور وإناث ومجموع لكل فئة عمرية
    ageGroups.forEach(() => {
      subHeaders.push("ذكور", "إناث", "مجموع");
    });
    subHeaders.push("", ""); // المجموع العام وعدد الجمعيات
    wsData.push(subHeaders);

    // إضافة البيانات لكل فضاء ونادي ونشاط
    let rowIndex = 8; // بداية البيانات بعد العناوين

    for (const [spaceName, clubs] of Object.entries(structure)) {
      // صف الفضاء
      const spaceRow = [spaceName, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
      wsData.push(spaceRow);
      rowIndex++;

      for (const [clubName, activities] of Object.entries(clubs)) {
        // صفوف الأنشطة
        for (const activity of activities) {
          const activityMembers = members?.filter(m => m.activities?.includes(activity)) || [];
          
          // حساب الإحصائيات
          const totalMembers = activityMembers.length;
          const maleMembers = activityMembers.filter(m => m.gender === 'ذكر').length;
          const femaleMembers = activityMembers.filter(m => m.gender === 'أنثى').length;

          // حساب الفئات العمرية
          const ageStats = ageGroups.map(group => {
            const ageMembers = activityMembers.filter(m => {
              const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
              return age >= group.min && age <= group.max;
            });
            const male = ageMembers.filter(m => m.gender === 'ذكر').length;
            const female = ageMembers.filter(m => m.gender === 'أنثى').length;
            return { male, female, total: male + female };
          });

          const activityRow = [
            activity, // النشاط
            maleMembers, // ذكور
            femaleMembers, // إناث
            totalMembers, // مجموع
            "", // عدد النوادي (سيتم حسابه لاحقاً)
            ...ageStats.flatMap(stat => [stat.male, stat.female, stat.total]), // إحصائيات الفئات العمرية
            totalMembers, // المجموع العام
            "" // عدد الجمعيات الشريكة
          ];
          wsData.push(activityRow);
          rowIndex++;
        }
      }

      // صف مجموع الفضاء
      const spaceMembers = members?.filter(m => 
        m.activities?.some(activity => 
          Object.values(clubs).flat().includes(activity)
        )
      ) || [];
      const spaceTotal = spaceMembers.length;
      const spaceMale = spaceMembers.filter(m => m.gender === 'ذكر').length;
      const spaceFemale = spaceMembers.filter(m => m.gender === 'أنثى').length;

      const spaceAgeStats = ageGroups.map(group => {
        const ageMembers = spaceMembers.filter(m => {
          const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
          return age >= group.min && age <= group.max;
        });
        const male = ageMembers.filter(m => m.gender === 'ذكر').length;
        const female = ageMembers.filter(m => m.gender === 'أنثى').length;
        return { male, female, total: male + female };
      });

      const spaceTotalRow = [
        "المجموع",
        spaceMale,
        spaceFemale,
        spaceTotal,
        Object.values(clubs).flat().length, // عدد النوادي
        ...spaceAgeStats.flatMap(stat => [stat.male, stat.female, stat.total]),
        spaceTotal,
        ""
      ];
      wsData.push(spaceTotalRow);
      rowIndex++;
    }

    // صف المجموع العام
    const totalMembers = members?.length || 0;
    const totalMale = members?.filter(m => m.gender === 'ذكر').length || 0;
    const totalFemale = members?.filter(m => m.gender === 'أنثى').length || 0;

    const totalAgeStats = ageGroups.map(group => {
      const ageMembers = members?.filter(m => {
        const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
        return age >= group.min && age <= group.max;
      }) || [];
      const male = ageMembers.filter(m => m.gender === 'ذكر').length;
      const female = ageMembers.filter(m => m.gender === 'أنثى').length;
      return { male, female, total: male + female };
    });

    const grandTotalRow = [
      "المجموع العام",
      totalMale,
      totalFemale,
      totalMembers,
      Object.values(structure).reduce((acc, clubs) => 
        acc + Object.values(clubs).flat().length, 0
      ), // إجمالي عدد النوادي
      ...totalAgeStats.flatMap(stat => [stat.male, stat.female, stat.total]),
      totalMembers,
      ""
    ];
    wsData.push(grandTotalRow);

    // إنشاء ورقة العمل
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // دمج الخلايا للعناوين
    ws["!merges"] = [
      // العناوين الحكومية
      { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } }, // الجمهورية
      { s: { r: 1, c: 0 }, e: { r: 1, c: 21 } }, // وزارة الشباب
      { s: { r: 3, c: 0 }, e: { r: 3, c: 21 } }, // بطاقة احصائية
      { s: { r: 4, c: 0 }, e: { r: 4, c: 21 } }, // الفترة الزمنية
      // عناوين الأعمدة الرئيسية
      { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } }, // الفضاءات
      { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } }, // عدد المنخرطين
      { s: { r: 6, c: 4 }, e: { r: 7, c: 4 } }, // عدد النوادي
      { s: { r: 6, c: 5 }, e: { r: 6, c: 16 } }, // الفئات العمرية (12 أعمدة: 4 فئات × 3 أعمدة)
      { s: { r: 6, c: 17 }, e: { r: 7, c: 17 } }, // المجموع العام
      { s: { r: 6, c: 18 }, e: { r: 7, c: 18 } }, // عدد الجمعيات الشريكة
    ];

    // تطبيق التنسيق والألوان
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_address]) continue;
        
        let bgColor = "FFFFFF";
        let textColor = "000000";
        let isBold = false;
        
        // العناوين الرئيسية (الصفوف 0-7) - بنفسجي فاتح
        if (R <= 7) {
          bgColor = "E6E6FA";
          isBold = true;
        } 
        // صفوف المجاميع - بنفسجي فاتح
        else if (ws[cell_address].v && typeof ws[cell_address].v === 'string' && ws[cell_address].v.includes('المجموع')) {
          bgColor = "E6E6FA";
          isBold = true;
        }
        // العناوين الفرعية للجنس (ذكور، إناث، مجموع) - برتقالي فاتح
        else if (R === 7 && (C === 1 || C === 2 || C === 3 || 
                 (C >= 5 && C <= 16 && (C - 5) % 3 === 0) || 
                 (C >= 5 && C <= 16 && (C - 5) % 3 === 1) || 
                 (C >= 5 && C <= 16 && (C - 5) % 3 === 2))) {
          bgColor = "FFE6CC";
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

    // تعيين عرض الأعمدة
    ws["!cols"] = [
      { width: 25 }, // الفضاءات
      { width: 15 }, // ذكور
      { width: 15 }, // إناث
      { width: 15 }, // مجموع
      { width: 15 }, // عدد النوادي
      ...Array(12).fill({ width: 12 }), // الفئات العمرية (12 أعمدة: 4 فئات × 3 أعمدة)
      { width: 15 }, // المجموع العام
      { width: 20 }, // عدد الجمعيات الشريكة
    ];

    // إنشاء المصنف وحفظ الملف
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الإحصائيات");
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `إحصائيات_المنخرطين_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
  } catch (error) {
    console.error('خطأ في تصدير الإحصائيات:', error);
    throw error;
  }
}
