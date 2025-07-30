"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Upload, User, CreditCard, CheckCircle, Sparkles, FileText, Activity } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { generateMemberId } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getAllActivities, getActivityInfo } from "@/lib/activities-data"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: { wilaya: "", commune: "" },
    phone: "",
    gender: "",
    educationLevel: "",
    membershipCardNumber: "",
    isMinor: false,
    guardianFirstName: "",
    guardianLastName: "",
    guardianNationalId: "",
    guardianPhone: "",
    guardianRelation: "",
    selectedSpace: "",
    selectedClub: "",
    selectedActivity: "",
    birthCertificate: null as File | null,
    photo: null as File | null,
    parentalConsent: null as File | null,
    medicalCertificate: null as File | null,
    paymentConfirmed: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleActivityChange = (activity: string) => {
    const activityInfo = getActivityInfo(activity)
    if (activityInfo) {
      setFormData((prev) => ({
        ...prev,
        selectedActivity: activity,
        selectedSpace: activityInfo.space,
        selectedClub: activityInfo.club,
      }))
    }
  }

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
  }

  const uploadFile = async (file: File, path: string) => {
    try {
      const { data, error } = await supabase.storage.from("documents").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.warn("File upload error:", error)
        return `placeholder/${path}`
      }

      return data.path
    } catch (error) {
      console.warn("Upload error:", error)
      return `placeholder/${path}`
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log("Starting registration process...")

      // Test database connection first
      const { data: testConnection, error: connectionError } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)

      if (connectionError) {
        console.error("Database connection error:", connectionError)
        throw new Error("فشل في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.")
      }

      // Get current settings
      const { data: settings, error: settingsError } = await supabase.from("system_settings").select("*")

      if (settingsError) {
        console.error("Settings fetch error:", settingsError)
        throw new Error("فشل في جلب إعدادات النظام")
      }

      const settingsMap =
        settings?.reduce(
          (acc, setting) => {
            acc[setting.setting_key] = setting.setting_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      const counter = Number.parseInt(settingsMap.member_id_counter || "1")
      const season = settingsMap.current_season || "2425"
      const currentCardNumber = Number.parseInt(settingsMap.current_card_number || "1")

      // Generate member ID
      const memberId = generateMemberId(counter, season)
      console.log("Generated member ID:", memberId)

      // Upload files
      let birthCertificateUrl = ""
      let photoUrl = ""
      let parentalConsentUrl = ""
      let medicalCertificateUrl = ""

      try {
        if (formData.birthCertificate) {
          birthCertificateUrl = await uploadFile(formData.birthCertificate, `birth-certificates/${memberId}`)
        }
        if (formData.photo) {
          photoUrl = await uploadFile(formData.photo, `photos/${memberId}`)
        }
        if (formData.parentalConsent) {
          parentalConsentUrl = await uploadFile(formData.parentalConsent, `parental-consent/${memberId}`)
        }
        if (formData.medicalCertificate) {
          medicalCertificateUrl = await uploadFile(formData.medicalCertificate, `medical-certificates/${memberId}`)
        }
      } catch (uploadError) {
        console.warn("Some files could not be uploaded:", uploadError)
      }

      // Insert member
      const memberData = {
        member_id: memberId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        birth_place_wilaya: formData.birthPlace.wilaya,
        birth_place_commune: formData.birthPlace.commune,
        phone: formData.phone,
        gender: formData.gender as "male" | "female",
        education_level: formData.educationLevel,
        membership_card_number: currentCardNumber.toString(),
        is_minor: formData.isMinor,
        guardian_first_name: formData.guardianFirstName || null,
        guardian_last_name: formData.guardianLastName || null,
        guardian_national_id: formData.guardianNationalId || null,
        guardian_phone: formData.guardianPhone || null,
        guardian_relation: formData.guardianRelation || null,
        selected_space: formData.selectedSpace,
        selected_club: formData.selectedClub,
        selected_activity: formData.selectedActivity,
        payment_confirmed: formData.paymentConfirmed,
        birth_certificate_url: birthCertificateUrl,
        photo_url: photoUrl,
        parental_consent_url: parentalConsentUrl,
        medical_certificate_url: medicalCertificateUrl,
      }

      console.log("Inserting member data:", memberData)

      const { data: insertedMember, error: memberError } = await supabase.from("members").insert(memberData).select()

      if (memberError) {
        console.error("Member insert error:", memberError)
        throw new Error(`فشل في إدراج بيانات المنخرط: ${memberError.message}`)
      }

      console.log("Member inserted successfully:", insertedMember)

      // Save uploaded files as base64 in localStorage for instant access
      if (formData.photo) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem(`member-${memberId}-photo`, reader.result as string);
        };
        reader.readAsDataURL(formData.photo);
      }
      if (formData.birthCertificate) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem(`member-${memberId}-birth-certificate`, reader.result as string);
        };
        reader.readAsDataURL(formData.birthCertificate);
      }
      if (formData.parentalConsent) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem(`member-${memberId}-parental-consent`, reader.result as string);
        };
        reader.readAsDataURL(formData.parentalConsent);
      }
      if (formData.medicalCertificate) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem(`member-${memberId}-medical-certificate`, reader.result as string);
        };
        reader.readAsDataURL(formData.medicalCertificate);
      }

      // Update counters
      const { error: counterError } = await supabase
        .from("system_settings")
        .update({ setting_value: (counter + 1).toString() })
        .eq("setting_key", "member_id_counter")

      if (counterError) {
        console.warn("Counter update error:", counterError)
      }

      const { error: cardError } = await supabase
        .from("system_settings")
        .update({ setting_value: (currentCardNumber + 1).toString() })
        .eq("setting_key", "current_card_number")

      if (cardError) {
        console.warn("Card number update error:", cardError)
      }

      // Redirect to success page
      router.push(`/success?memberId=${memberId}`)
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء التسجيل"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-emerald-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-3 text-emerald-700 hover:text-emerald-600 transition-all duration-300"
            >
              <div className="p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="font-semibold">العودة للرئيسية</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-75"></div>
                <Image
                  src="/new-logo.jpeg"
                  alt="شعار دار الشباب"
                  width={70}
                  height={70}
                  className="relative rounded-full shadow-lg"
                />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  تسجيل منخرط جديد
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">رحلة التسجيل الذكية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4 space-x-reverse">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    step >= num
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-110"
                      : "bg-white border-2 border-gray-300 text-gray-500"
                  }`}
                >
                  {step > num ? <CheckCircle className="w-6 h-6" /> : <span>{num}</span>}
                  {step >= num && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-50 -z-10"></div>
                  )}
                </div>
                {num < 5 && (
                  <div
                    className={`w-20 h-1 transition-all duration-500 ${
                      step > num ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-emerald-200">
              {step === 1 && (
                <>
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">المعلومات الشخصية</span>
                </>
              )}
              {step === 2 && (
                <>
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 font-medium">معلومات الولي</span>
                </>
              )}
              {step === 3 && (
                <>
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">اختيار النشاط</span>
                </>
              )}
              {step === 4 && (
                <>
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">المستندات</span>
                </>
              )}
              {step === 5 && (
                <>
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">الدفع والتأكيد</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-7 h-7" />
                </div>
                المعلومات الشخصية
              </CardTitle>
              <CardDescription className="text-emerald-100 text-lg">
                يرجى إدخال المعلومات الشخصية للمنخرط بدقة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    الاسم *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="أدخل الاسم"
                    className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    اللقب *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="أدخل اللقب"
                    className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="birthDate" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    تاريخ الميلاد *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-teal-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="05XX XX XX XX"
                    className="h-14 text-lg border-2 border-gray-200 focus:border-teal-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="wilaya" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    ولاية الميلاد *
                  </Label>
                  <Input
                    id="wilaya"
                    value={formData.birthPlace.wilaya}
                    onChange={(e) => handleInputChange("birthPlace", { ...formData.birthPlace, wilaya: e.target.value })}
                    placeholder="أدخل ولاية الميلاد"
                    className="h-14 text-lg border-2 border-gray-200 focus:border-cyan-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="commune" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    بلدية الميلاد *
                  </Label>
                  <Input
                    id="commune"
                    value={formData.birthPlace.commune}
                    onChange={(e) => handleInputChange("birthPlace", { ...formData.birthPlace, commune: e.target.value })}
                    placeholder="أدخل البلدية"
                    className="h-14 text-lg border-2 border-gray-200 focus:border-cyan-500 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    الجنس *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    المستوى الدراسي *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("educationLevel", value)}>
                    <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                      <SelectValue placeholder="اختر المستوى الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="ثانوي">ثانوي</SelectItem>
                      <SelectItem value="جامعي">جامعي</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Checkbox
                    id="isMinor"
                    checked={formData.isMinor}
                    onCheckedChange={(checked) => handleInputChange("isMinor", checked)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="isMinor" className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    المنخرط قاصر (أقل من 18 سنة)
                  </Label>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-14 px-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300"
                  disabled={!formData.firstName || !formData.lastName || !formData.birthDate || !formData.phone}
                >
                  التالي
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Guardian Information */}
        {step === 2 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-7 h-7" />
                </div>
                معلومات الولي أو الوصي
              </CardTitle>
              <CardDescription className="text-amber-100 text-lg">
                {formData.isMinor ? "يرجى إدخال معلومات الولي أو الوصي" : "يمكنك تخطي هذه الخطوة"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {formData.isMinor && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="guardianFirstName"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        اسم الولي *
                      </Label>
                      <Input
                        id="guardianFirstName"
                        value={formData.guardianFirstName}
                        onChange={(e) => handleInputChange("guardianFirstName", e.target.value)}
                        placeholder="أدخل اسم الولي"
                        className="h-14 text-lg border-2 border-gray-200 focus:border-amber-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="guardianLastName"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        لقب الولي *
                      </Label>
                      <Input
                        id="guardianLastName"
                        value={formData.guardianLastName}
                        onChange={(e) => handleInputChange("guardianLastName", e.target.value)}
                        placeholder="أدخل لقب الولي"
                        className="h-14 text-lg border-2 border-gray-200 focus:border-amber-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="guardianNationalId"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        رقم التعريف الوطني *
                      </Label>
                      <Input
                        id="guardianNationalId"
                        value={formData.guardianNationalId}
                        onChange={(e) => handleInputChange("guardianNationalId", e.target.value)}
                        placeholder="أدخل رقم التعريف الوطني"
                        className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="guardianPhone"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        رقم هاتف الولي *
                      </Label>
                      <Input
                        id="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                        placeholder="05XX XX XX XX"
                        className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      صلة القرابة *
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("guardianRelation", value)}>
                      <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl">
                        <SelectValue placeholder="اختر صلة القرابة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الأب">الأب</SelectItem>
                        <SelectItem value="الأم">الأم</SelectItem>
                        <SelectItem value="وصي">وصي</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-14 px-12 text-lg font-semibold rounded-xl border-2 bg-transparent hover:bg-gray-50"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  السابق
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-14 px-12 text-lg font-semibold rounded-xl shadow-lg"
                >
                  التالي
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Activity Selection */}
        {step === 3 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Activity className="w-7 h-7" />
                </div>
                اختيار النشاط
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                اختر النشاط المرغوب فيه وسيتم تحديد الفضاء والنادي تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  النشاط *
                </Label>
                <Select onValueChange={handleActivityChange}>
                  <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl">
                    <SelectValue placeholder="اختر النشاط المرغوب فيه" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getAllActivities().map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.selectedActivity && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    تم التحديد التلقائي
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">الفضاء</p>
                      <p className="text-lg font-bold text-purple-800">{formData.selectedSpace}</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 border border-pink-200">
                      <p className="text-sm text-pink-600 font-medium">النادي</p>
                      <p className="text-lg font-bold text-pink-800">{formData.selectedClub}</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 border border-rose-200">
                      <p className="text-sm text-rose-600 font-medium">النشاط</p>
                      <p className="text-lg font-bold text-rose-800">{formData.selectedActivity}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-14 px-12 text-lg font-semibold rounded-xl border-2 bg-transparent hover:bg-gray-50"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  السابق
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 px-12 text-lg font-semibold rounded-xl shadow-lg"
                  disabled={!formData.selectedActivity}
                >
                  التالي
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Document Upload */}
        {step === 4 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="w-7 h-7" />
                </div>
                تحميل المستندات
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                يرجى تحميل المستندات المطلوبة بصيغة PDF أو صور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="birthCertificate" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    شهادة الميلاد *
                  </Label>
                  <div className="relative">
                    <Input
                      id="birthCertificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleInputChange("birthCertificate", e.target.files?.[0])}
                      className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="photo" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    صورة شمسية *
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleInputChange("photo", e.target.files?.[0])}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {formData.isMinor && (
                <div className="space-y-3">
                  <Label htmlFor="parentalConsent" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    سماح أبوي *
                  </Label>
                  <Input
                    id="parentalConsent"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleInputChange("parentalConsent", e.target.files?.[0])}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              )}

              {(formData.selectedActivity === "الكراتي دو" ||
                formData.selectedActivity === "الجيدو" ||
                formData.selectedActivity === "الكينغ فو") && (
                <div className="space-y-3">
                  <Label
                    htmlFor="medicalCertificate"
                    className="text-sm font-bold text-gray-700 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    شهادة طبية عامة *
                  </Label>
                  <Input
                    id="medicalCertificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleInputChange("medicalCertificate", e.target.files?.[0])}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    مطلوبة للأنشطة القتالية (الكراتي دو، الجيدو، الكينغ فو)
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-14 px-12 text-lg font-semibold rounded-xl border-2 bg-transparent hover:bg-gray-50"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  السابق
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 px-12 text-lg font-semibold rounded-xl shadow-lg"
                >
                  التالي
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment and Confirmation */}
        {step === 5 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-7 h-7" />
                </div>
                الدفع والتأكيد
              </CardTitle>
              <CardDescription className="text-green-100 text-lg">
                مراجعة البيانات وتأكيد دفع حقوق الانخراط
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  ملخص التسجيل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">الاسم الكامل:</span>
                      <span className="font-bold text-green-800">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">تاريخ الميلاد:</span>
                      <span className="font-bold text-green-800">{formData.birthDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">الجنس:</span>
                      <span className="font-bold text-green-800">{formData.gender === "male" ? "ذكر" : "أنثى"}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">الفضاء:</span>
                      <span className="font-bold text-green-800">{formData.selectedSpace}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">النادي:</span>
                      <span className="font-bold text-green-800">{formData.selectedClub}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="font-medium text-green-700">النشاط:</span>
                      <span className="font-bold text-green-800">{formData.selectedActivity}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">حقوق الانخراط</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">100 دج</div>
                  <p className="text-lg text-blue-700 font-medium">مائة دينار جزائري</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">رسوم التسجيل الموحدة</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Checkbox
                    id="paymentConfirmed"
                    checked={formData.paymentConfirmed}
                    onCheckedChange={(checked) => handleInputChange("paymentConfirmed", checked)}
                    className="w-6 h-6"
                  />
                  <Label
                    htmlFor="paymentConfirmed"
                    className="text-lg font-bold text-amber-800 flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    أؤكد دفع حقوق الانخراط (100 دج)
                  </Label>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-14 px-12 text-lg font-semibold rounded-xl border-2 bg-transparent hover:bg-gray-50"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  السابق
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 px-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300"
                  disabled={!formData.paymentConfirmed || loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      تأكيد التسجيل
                      <CheckCircle className="w-5 h-5 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
