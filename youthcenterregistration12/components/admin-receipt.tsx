"use client"

import type { Member } from "@/lib/supabase"
import { calculateAge, formatDate } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useState, useEffect } from "react"

interface AdminReceiptProps {
  member: Member
}

export function AdminReceipt({ member }: AdminReceiptProps) {
  const age = calculateAge(member.birth_date)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Try localStorage first
    const localPhoto = typeof window !== "undefined"
      ? localStorage.getItem(`member-${member.member_id}-photo`)
      : null;
    if (localPhoto) {
      setImageUrl(localPhoto);
      return;
    }
    // Fallback to Supabase signed URL logic
    const getImageUrl = async () => {
      if (!member.photo_url || member.photo_url.startsWith("placeholder/")) {
        setImageUrl(null)
        return
      }
      if (member.photo_url.startsWith("http")) {
        setImageUrl(member.photo_url)
        return
      }
      try {
        const { data, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(member.photo_url, 3600)
        if (error) {
          setImageUrl(null)
          return
        }
        setImageUrl(data?.signedUrl || null)
      } catch {
        setImageUrl(null)
      }
    }
    getImageUrl();
  }, [member.photo_url, member.member_id])

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-6 shadow-2xl print:shadow-none border border-gray-200 rounded-2xl">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-emerald-600 pb-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <Image
              src="/new-logo.jpeg"
              alt="شعار دار الشباب"
              width={60}
              height={60}
              className="relative rounded-full shadow-lg border-2 border-emerald-400"
            />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-emerald-800">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
            <h2 className="text-base font-semibold text-red-700">وزارة الشباب</h2>
            <h3 className="text-sm font-medium text-emerald-700">مديرية الشباب والرياضة تبسة</h3>
            <h4 className="text-sm font-medium text-red-600">ديوان مؤسسات الشباب</h4>
            <h5 className="text-base font-bold text-emerald-800">دار الشباب سليمي إبراهيم بئر العاتر</h5>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-bold">وصل تسجيل منخرط - نسخة الإدارة</h2>
        </div>
      </div>

      {/* Photo & Info Row */}
      <div className="flex flex-row-reverse items-start gap-6 mb-6">
        {imageUrl && (
          <div className="relative flex-shrink-0">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="صورة المنخرط"
              className="object-cover rounded-xl shadow-lg border-2 border-emerald-400 w-[80px] h-[100px]"
              style={{ objectPosition: 'center top' }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">الرقم التعريفي:</span>
              <span className="font-mono font-bold text-emerald-600">{member.member_id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">الاسم الكامل:</span>
              <span className="font-bold text-gray-800">{member.first_name} {member.last_name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">تاريخ الميلاد:</span>
              <span className="font-bold text-gray-800">{formatDate(member.birth_date)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">العمر:</span>
              <span className="font-bold text-gray-800">{age} سنة</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">مكان الميلاد:</span>
              <span className="font-bold text-gray-800">{member.birth_place_commune}, {member.birth_place_wilaya}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">الجنس:</span>
              <span className="font-bold text-gray-800">{member.gender === "male" ? "ذكر" : "أنثى"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">رقم الهاتف:</span>
              <span className="font-bold text-gray-800">{member.phone}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-semibold text-gray-700">رقم بطاقة الانخراط:</span>
              <span className="font-bold text-gray-800">{member.membership_card_number}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Payment */}
      <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
        <h3 className="font-bold text-emerald-800 mb-2 text-base">معلومات النشاط</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white rounded-lg border border-emerald-200">
            <span className="font-semibold text-emerald-700 block mb-1">الفضاء</span>
            <span className="font-bold text-emerald-800">{member.selected_space}</span>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border border-teal-200">
            <span className="font-semibold text-teal-700 block mb-1">النادي</span>
            <span className="font-bold text-teal-800">{member.selected_club}</span>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border border-cyan-200">
            <span className="font-semibold text-cyan-700 block mb-1">النشاط</span>
            <span className="font-bold text-cyan-800">{member.selected_activity}</span>
          </div>
        </div>
      </div>
      <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2 text-base">معلومات الدفع</h3>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 mb-1">100 دج</div>
          <p className="text-base text-emerald-700 font-medium">مائة دينار جزائري</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-200 rounded-full">
            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
            <span className="text-emerald-800 font-semibold">حقوق الانخراط مدفوعة</span>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-3">
        <p className="font-semibold">هذا الوصل صالح للاحتفاظ في ملف المنخرط</p>
        <p className="mt-1">تاريخ الإصدار: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  )
}
