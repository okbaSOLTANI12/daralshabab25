import type { Member } from "@/lib/supabase"
import { calculateAge, formatDate } from "@/lib/utils"
import Image from "next/image"

interface CandidateReceiptProps {
  member: Member
}

export function CandidateReceipt({ member }: CandidateReceiptProps) {
  const age = calculateAge(member.birth_date)

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 shadow-lg print:shadow-none border-2 border-dashed border-gray-300">
      {/* Header */}
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image src="/logo.png" alt="شعار دار الشباب" width={50} height={50} className="rounded-full" />
          <div>
            <h1 className="text-sm font-bold text-green-800">دار الشباب سليمي إبراهيم</h1>
            <p className="text-xs text-gray-600">بئر العاتر - تبسة</p>
          </div>
        </div>
        <h2 className="text-lg font-bold text-blue-800 bg-blue-50 py-2 px-4 rounded">وصل مؤقت للمنخرط</h2>
      </div>

      {/* Member Basic Info */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between border-b pb-1">
          <span className="font-semibold">الاسم الكامل:</span>
          <span className="font-bold">
            {member.first_name} {member.last_name}
          </span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-semibold">الرقم التعريفي:</span>
          <span className="font-mono text-blue-600">{member.member_id}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-semibold">رقم بطاقة الانخراط:</span>
          <span className="font-bold">{member.membership_card_number}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-semibold">النشاط:</span>
          <span>{member.selected_activity}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="font-semibold">تاريخ التسجيل:</span>
          <span>{formatDate(member.registration_date)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
        <h3 className="font-bold text-green-800 mb-2">حالة الملف</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>المستندات:</span>
            <span className="text-green-600 font-semibold">مكتملة ✓</span>
          </div>
          <div className="flex justify-between">
            <span>حقوق الانخراط:</span>
            <span className="text-green-600 font-semibold">مدفوعة ✓</span>
          </div>
          <div className="flex justify-between">
            <span>حالة التسجيل:</span>
            <span className="text-green-600 font-semibold">مؤكد ✓</span>
          </div>
        </div>
      </div>

      {/* Payment Confirmation */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">إثبات الدفع</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">100 دج</p>
          <p className="text-sm text-gray-600">مائة دينار جزائري</p>
          <p className="text-xs text-green-600 mt-1">✓ تم الدفع بتاريخ {formatDate(member.registration_date)}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
        <p className="text-xs text-yellow-800 text-center">
          يرجى الاحتفاظ بهذا الوصل حتى استلام بطاقة الانخراط النهائية
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-3">
        <p>وصل مؤقت - صالح لمدة 30 يوماً</p>
        <p>تاريخ الإصدار: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  )
}
