"use client"

import type { Member } from "@/lib/supabase"
import { calculateAge } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

interface MembershipCardProps {
  member: Member
}

export function MembershipCard({ member }: MembershipCardProps) {
  const age = calculateAge(member.birth_date)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
    console.log("Membership card image loaded successfully:", imageUrl)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
    console.log("Membership card image failed to load:", imageUrl)
  }

  return (
    <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-lg overflow-hidden relative border border-gray-200 print:shadow-none">
      {/* Header */}
      <div className="bg-gray-50/50 backdrop-blur-sm p-2 text-center relative z-10 border-b border-gray-100">
        <div className="text-center text-[7px] leading-tight text-gray-700 mb-1">
          <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
          <p>وزارة الشباب والرياضة</p>
        </div>
        <div className="flex items-center justify-center gap-1 mb-1">
          <img src="/new-logo.jpeg" alt="شعار دار الشباب" className="w-6 h-6 rounded-full shadow-sm" />
          <h3 className="text-gray-900 text-xs font-bold">دار الشباب سليمي إبراهيم</h3>
        </div>
        <p className="text-gray-700 text-[7px] font-medium">بئر العاتر - تبسة</p>
      </div>

      {/* Main Content */}
      <div className="p-3 flex gap-3 h-full relative z-10">
        {/* Photo */}
        <div className="w-16 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md border border-gray-200">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="صورة المنخرط"
              className="object-cover w-full h-full rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
              style={{ objectPosition: 'center top' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
              <span className="text-gray-500 text-xs font-bold">
                {member.first_name.charAt(0)}
                {member.last_name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-gray-800">
          <h4 className="font-bold text-sm mb-1">
            {member.first_name} {member.last_name}
          </h4>
          <div className="space-y-0.5 text-xs">
            <p className="bg-gray-100 rounded px-2 py-0.5 inline-block">الرقم: {member.member_id}</p>
            <p className="bg-gray-100 rounded px-2 py-0.5 inline-block">البطاقة: {member.membership_card_number}</p>
            <p className="bg-gray-100 rounded px-2 py-0.5 inline-block">العمر: {age} سنة</p>
            <p className="text-[10px] bg-gray-100 rounded px-2 py-0.5 inline-block mt-1">{member.selected_activity}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50/50 backdrop-blur-sm p-1 text-center relative z-10 border-t border-gray-100">
        <p className="text-gray-700 text-[8px] font-medium">صالحة للموسم 2024-2025</p>
      </div>
    </div>
  )
}
