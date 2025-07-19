import type { Member } from "@/lib/supabase"
import { calculateAge, formatDate } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

interface AdminReceiptProps {
  member: Member
}

export function AdminReceipt({ member }: AdminReceiptProps) {
  const age = calculateAge(member.birth_date)

  const getImageUrl = () => {
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
      // Ensure we have a valid URL
      if (data?.publicUrl && data.publicUrl !== "") {
        return data.publicUrl
      }
    } catch (error) {
      console.warn("Error getting image URL:", error)
    }

    return null
  }

  const imageUrl = getImageUrl()

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 shadow-2xl print:shadow-none border border-gray-200 rounded-xl">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-emerald-600 pb-6">
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-75"></div>
            <Image
              src="/logo.png"
              alt="شعار دار الشباب"
              width={100}
              height={100}
              className="relative rounded-full shadow-lg"
            />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-emerald-800">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
            <h2 className="text-lg font-semibold text-red-700">وزارة الشباب</h2>
            <h3 className="text-md font-medium text-emerald-700">مديرية الشباب والرياضة تبسة</h3>
            <h4 className="text-md font-medium text-red-600">ديوان مؤسسات الشباب</h4>
            <h5 className="text-lg font-bold text-emerald-800">دار الشباب سليمي إبراهيم بئر العاتر</h5>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold">وصل تسجيل منخرط - نسخة الإدارة</h2>
        </div>
      </div>

      {/* Photo Section */}
      {imageUrl && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur opacity-50"></div>
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="صورة المنخرط"
              className="relative object-cover rounded-xl shadow-lg border-4 border-white w-[150px] h-[150px]"
              onError={(e) => {
                console.log("Admin receipt image failed to load:", imageUrl)
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
              onLoad={() => {
                console.log("Admin receipt image loaded successfully:", imageUrl)
              }}
            />
          </div>
        </div>
      )}

      {/* Member Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">الرقم التعريفي:</span>
            <span className="font-mono font-bold text-emerald-600">{member.member_id}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">الاسم الكامل:</span>
            <span className="font-bold text-gray-800">
              {member.first_name} {member.last_name}
            </span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">تاريخ الميلاد:</span>
            <span className="font-bold text-gray-800">{formatDate(member.birth_date)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">العمر:</span>
            <span className="font-bold text-gray-800">{age} سنة</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">مكان الميلاد:</span>
            <span className="font-bold text-gray-800">
              {member.birth_place_commune}, {member.birth_place_wilaya}
            </span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">الجنس:</span>
            <span className="font-bold text-gray-800">{member.gender === "male" ? "ذكر" : "أنثى"}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">رقم الهاتف:</span>
            <span className="font-bold text-gray-800">{member.phone}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">المستوى الدراسي:</span>
            <span className="font-bold text-gray-800">{member.education_level}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">رقم بطاقة الانخراط:</span>
            <span className="font-bold text-gray-800">{member.membership_card_number}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">تاريخ التسجيل:</span>
            <span className="font-bold text-gray-800">{formatDate(member.registration_date)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-gray-200 pb-2">
            <span className="font-semibold text-gray-700">حالة الدفع:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span>مدفوع</span>
              <span className="text-xl">✓</span>
            </span>
          </div>
        </div>
      </div>

      {/* Guardian Info (if minor) */}
      {member.is_minor && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200">
          <h3 className="font-bold text-amber-800 mb-4 text-lg">معلومات الولي أو الوصي</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between border-b border-amber-300 pb-2">
              <span className="font-semibold text-amber-700">اسم الولي:</span>
              <span className="font-bold text-amber-800">
                {member.guardian_first_name} {member.guardian_last_name}
              </span>
            </div>
            <div className="flex justify-between border-b border-amber-300 pb-2">
              <span className="font-semibold text-amber-700">رقم التعريف الوطني:</span>
              <span className="font-mono font-bold text-amber-800">{member.guardian_national_id}</span>
            </div>
            <div className="flex justify-between border-b border-amber-300 pb-2">
              <span className="font-semibold text-amber-700">رقم الهاتف:</span>
              <span className="font-bold text-amber-800">{member.guardian_phone}</span>
            </div>
            <div className="flex justify-between border-b border-amber-300 pb-2">
              <span className="font-semibold text-amber-700">صلة القرابة:</span>
              <span className="font-bold text-amber-800">{member.guardian_relation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Info */}
      <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
        <h3 className="font-bold text-emerald-800 mb-4 text-lg">معلومات النشاط</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-emerald-200">
            <span className="font-semibold text-emerald-700 block mb-2">الفضاء</span>
            <span className="font-bold text-emerald-800">{member.selected_space}</span>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-teal-200">
            <span className="font-semibold text-teal-700 block mb-2">النادي</span>
            <span className="font-bold text-teal-800">{member.selected_club}</span>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-cyan-200">
            <span className="font-semibold text-cyan-700 block mb-2">النشاط</span>
            <span className="font-bold text-cyan-800">{member.selected_activity}</span>
          </div>
        </div>
      </div>

      {/* Documents Status */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
        <h3 className="font-bold text-blue-800 mb-4 text-lg">حالة المستندات</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
            <span className="font-semibold text-blue-700">شهادة الميلاد:</span>
            <span className="text-emerald-600 font-bold">✓ مرفقة</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
            <span className="font-semibold text-blue-700">الصورة الشمسية:</span>
            <span className="text-emerald-600 font-bold">✓ مرفقة</span>
          </div>
          {member.is_minor && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-700">السماح الأبوي:</span>
              <span className="text-emerald-600 font-bold">✓ مرفق</span>
            </div>
          )}
          {(member.selected_activity === "الكراتي دو" ||
            member.selected_activity === "الجيدو" ||
            member.selected_activity === "الكينغ فو") && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-700">الشهادة الطبية:</span>
              <span className="text-emerald-600 font-bold">✓ مرفقة</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-8 bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-xl border-2 border-emerald-300">
        <h3 className="font-bold text-emerald-800 mb-4 text-lg">معلومات الدفع</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">100 دج</div>
          <p className="text-lg text-emerald-700 font-medium">مائة دينار جزائري</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-200 rounded-full">
            <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
            <span className="text-emerald-800 font-semibold">حقوق الانخراط مدفوعة</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-4">
        <p className="font-semibold">هذا الوصل صالح للاحتفاظ في ملف المنخرط</p>
        <p className="mt-2">تاريخ الإصدار: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  )
}
