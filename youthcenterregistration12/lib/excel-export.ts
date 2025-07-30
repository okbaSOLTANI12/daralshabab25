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

    // تعريف الفئات العمرية (5-15 سنة)
    const ageGroups = [
      { name: "5-7 سنوات", min: 5, max: 7 },
      { name: "8-10 سنوات", min: 8, max: 10 },
      { name: "11-13 سنة", min: 11, max: 13 },
      { name: "14-15 سنة", min: 14, max: 15 }
    ]

    // تنظيم الأنشطة حسب الفضاءات والنوادي
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

    wsData.push([
      "ديوان مؤسسات الشباب تبسة",
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

    // الصف الخامس: العنوان الفرعي
    wsData.push([
      "بطاقة إحصائية للمنخرطين بالمؤسسات الشبانية حسب الإختصاصات والأنشطة السنوية",
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
    let rowIndex = 8; // بداية البيانات بعد العناوين

    for (const [spaceName, clubs] of Object.entries(structure)) {
      // صف الفضاء
      const spaceRow = [spaceName, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
      wsData.push(spaceRow);
      rowIndex++;

      for (const [clubName, activities] of Object.entries(clubs)) {
        // صف النادي
        const clubRow = ["", clubName, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        wsData.push(clubRow);
        rowIndex++;

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
            "", // الفضاء (فارغ لأن النشاط تحت النادي)
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

        // صف مجموع النادي
        const clubMembers = members?.filter(m => 
          m.activities?.some(activity => activities.includes(activity))
        ) || [];
        const clubTotal = clubMembers.length;
        const clubMale = clubMembers.filter(m => m.gender === 'ذكر').length;
        const clubFemale = clubMembers.filter(m => m.gender === 'أنثى').length;

        const clubAgeStats = ageGroups.map(group => {
          const ageMembers = clubMembers.filter(m => {
            const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
            return age >= group.min && age <= group.max;
          });
          const male = ageMembers.filter(m => m.gender === 'ذكر').length;
          const female = ageMembers.filter(m => m.gender === 'أنثى').length;
          return { male, female, total: male + female };
        });

        const clubTotalRow = [
          "مجموع " + clubName,
          "",
          clubMale,
          clubFemale,
          clubTotal,
          activities.length, // عدد النوادي
          ...clubAgeStats.flatMap(stat => [stat.male, stat.female, stat.total]),
          clubTotal,
          ""
        ];
        wsData.push(clubTotalRow);
        rowIndex++;
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
        "مجموع " + spaceName,
        "",
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
      "",
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
      { s: { r: 2, c: 0 }, e: { r: 2, c: 21 } }, // ديوان مؤسسات الشباب تبسة
      { s: { r: 4, c: 0 }, e: { r: 4, c: 21 } }, // بطاقة إحصائية
      // عناوين الأعمدة الرئيسية
      { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } }, // النشاطات
      { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } }, // الفضاءات
      { s: { r: 6, c: 2 }, e: { r: 6, c: 4 } }, // عدد المنخرطين
      { s: { r: 6, c: 5 }, e: { r: 7, c: 5 } }, // عدد النوادي
      { s: { r: 6, c: 6 }, e: { r: 6, c: 17 } }, // الفئات العمرية
      { s: { r: 6, c: 18 }, e: { r: 7, c: 18 } }, // المجموع العام
      { s: { r: 6, c: 19 }, e: { r: 7, c: 19 } }, // عدد الجمعيات الشريكة
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
        
        // العناوين الرئيسية (الصفوف 0-7)
        if (R <= 7) {
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

    // تعيين عرض الأعمدة
    ws["!cols"] = [
      { width: 25 }, // النشاطات
      { width: 20 }, // الفضاءات
      { width: 15 }, // ذكور
      { width: 15 }, // إناث
      { width: 15 }, // مجموع
      { width: 15 }, // عدد النوادي
      ...Array(12).fill({ width: 12 }), // الفئات العمرية (12 عمود)
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
