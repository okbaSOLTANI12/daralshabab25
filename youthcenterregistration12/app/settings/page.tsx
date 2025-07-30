"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Settings, RotateCcw, Hash, CreditCard, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { generateMemberId } from "@/lib/utils"

export default function SettingsPage() {
  const [memberIdCounter, setMemberIdCounter] = useState(1)
  const [cardNumberStart, setCardNumberStart] = useState(1)
  const [cardNumberEnd, setCardNumberEnd] = useState(1000)
  const [currentSeason, setCurrentSeason] = useState("2425")
  const [currentCardNumber, setCurrentCardNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("system_settings").select("*")

      if (error) {
        console.error("Settings fetch error:", error)
        return
      }

      const settingsMap =
        data?.reduce(
          (acc, setting) => {
            acc[setting.setting_key] = setting.setting_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      setMemberIdCounter(Number.parseInt(settingsMap.member_id_counter || "1"))
      setCurrentSeason(settingsMap.current_season || "2425")
      setCardNumberStart(Number.parseInt(settingsMap.card_number_start || "1"))
      setCardNumberEnd(Number.parseInt(settingsMap.card_number_end || "1000"))
      setCurrentCardNumber(Number.parseInt(settingsMap.current_card_number || "1"))
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase.from("system_settings").update({ setting_value: value }).eq("setting_key", key)

      if (error) {
        console.error("Setting update error:", error)
        throw new Error(`فشل في تحديث الإعداد: ${error.message}`)
      }
    } catch (error) {
      console.error("Error updating setting:", error)
      throw error
    }
  }

  const handleResetMemberIdCounter = async () => {
    setLoading(true)
    try {
      await updateSetting("member_id_counter", "1")
      setMemberIdCounter(1)
      alert("تم إعادة تصفير العداد بنجاح")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إعادة تصفير العداد"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCardNumberRange = async () => {
    setLoading(true)
    try {
      await updateSetting("card_number_start", cardNumberStart.toString())
      await updateSetting("card_number_end", cardNumberEnd.toString())
      await updateSetting("current_card_number", cardNumberStart.toString())
      setCurrentCardNumber(cardNumberStart)
      alert("تم تحديث نطاق البطاقات بنجاح")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث نطاق البطاقات"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSeason = async () => {
    setLoading(true)
    try {
      await updateSetting("current_season", currentSeason)
      alert("تم تحديث الموسم بنجاح")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الموسم"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMemberIdCounter = async () => {
    setLoading(true)
    try {
      await updateSetting("member_id_counter", memberIdCounter.toString())
      alert("تم تحديث العداد بنجاح")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث العداد"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setLoading(true)
    try {
      console.log("Starting data deletion...")

      // Test database connection first
      const { data: testConnection, error: connectionError } = await supabase.from("members").select("id").limit(1)

      if (connectionError) {
        console.error("Database connection error:", connectionError)
        throw new Error("فشل في الاتصال بقاعدة البيانات")
      }

      // Delete all members
      const { error: membersError } = await supabase
        .from("members")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

      if (membersError) {
        console.error("Members deletion error:", membersError)
        throw new Error(`فشل في حذف بيانات المنخرطين: ${membersError.message}`)
      }

      // Reset counters
      await updateSetting("member_id_counter", "1")
      await updateSetting("current_card_number", cardNumberStart.toString())

      setMemberIdCounter(1)
      setCurrentCardNumber(cardNumberStart)
      setShowDeleteConfirm(false)

      alert("تم حذف جميع البيانات بنجاح")
    } catch (error) {
      console.error("Error deleting data:", error)
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء حذف البيانات"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateMemberIdPreview = () => {
    return generateMemberId(memberIdCounter, currentSeason)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-green-800 hover:text-green-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">العودة للرئيسية</span>
            </Link>
            <div className="flex items-center gap-4">
              <Image src="/new-logo.jpeg" alt="شعار دار الشباب" width={70} height={70} className="rounded-full shadow-md" />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-green-800">إعدادات النظام</h1>
                <p className="text-sm text-gray-600">إدارة إعدادات النظام والبيانات</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Member ID Settings */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Hash className="w-6 h-6" />
                إعدادات الرقم التعريفي
              </CardTitle>
              <CardDescription className="text-green-100">إدارة عداد الأرقام التعريفية للمنخرطين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">العداد الحالي</Label>
                <Input
                  type="number"
                  value={memberIdCounter}
                  onChange={(e) => setMemberIdCounter(Number.parseInt(e.target.value) || 1)}
                  min="1"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">الموسم الحالي</Label>
                <Input
                  value={currentSeason}
                  onChange={(e) => setCurrentSeason(e.target.value)}
                  placeholder="2425"
                  className="h-12 text-lg"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">معاينة الرقم التعريفي التالي:</p>
                <p className="font-mono text-2xl text-blue-600 font-bold">{generateMemberIdPreview()}</p>
                <p className="text-sm text-gray-600 mt-2">
                  الرقم الحالي: <span className="font-mono font-bold">{generateMemberId(memberIdCounter - 1, currentSeason)}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateMemberIdCounter}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                  disabled={loading}
                >
                  تحديث العداد
                </Button>
                <Button
                  onClick={handleResetMemberIdCounter}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة تصفير
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateSeason}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  disabled={loading}
                >
                  تحديث الموسم
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Number Settings */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="w-6 h-6" />
                إعدادات أرقام البطاقات
              </CardTitle>
              <CardDescription className="text-purple-100">تحديد نطاق أرقام بطاقات الانخراط</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardStart" className="text-sm font-semibold">
                    رقم البداية
                  </Label>
                  <Input
                    id="cardStart"
                    type="number"
                    value={cardNumberStart}
                    onChange={(e) => setCardNumberStart(Number.parseInt(e.target.value) || 1)}
                    min="1"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardEnd" className="text-sm font-semibold">
                    رقم النهاية
                  </Label>
                  <Input
                    id="cardEnd"
                    type="number"
                    value={cardNumberEnd}
                    onChange={(e) => setCardNumberEnd(Number.parseInt(e.target.value) || 1000)}
                    min="1"
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">النطاق المتاح:</p>
                <p className="text-green-600 text-lg font-semibold">
                  من {cardNumberStart} إلى {cardNumberEnd}
                  <span className="text-sm text-gray-600 mr-2 block mt-1">
                    ({cardNumberEnd - cardNumberStart + 1} بطاقة متاحة)
                  </span>
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  الرقم الحالي: <span className="font-bold">{currentCardNumber}</span>
                </p>
              </div>

              <Button
                onClick={handleUpdateCardNumberRange}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={loading}
              >
                تحديث نطاق البطاقات
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trash2 className="w-6 h-6" />
                إدارة البيانات
              </CardTitle>
              <CardDescription className="text-red-100">حذف جميع بيانات المنخرطين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-semibold">تحذير!</p>
                </div>
                <p className="text-red-700 text-sm">
                  سيؤدي هذا الإجراء إلى حذف جميع بيانات المنخرطين نهائياً ولا يمكن التراجع عنه.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  onClick={handleDeleteAllData}
                  variant="outline"
                  className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 h-12 bg-transparent"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف جميع البيانات
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-red-700 font-semibold">هل أنت متأكد من حذف جميع البيانات؟</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={loading}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleDeleteAllData}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? "جاري الحذف..." : "تأكيد الحذف"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-6 h-6" />
                معلومات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">إصدار النظام</h3>
                  <p className="text-blue-600 text-lg font-bold">v1.0.0</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">آخر تحديث</h3>
                  <p className="text-green-600 text-lg font-bold">2024-10-15</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">حالة قاعدة البيانات</h3>
                  <p className="text-purple-600 text-lg font-bold">متصلة ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
