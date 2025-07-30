import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BarChart3, List, Settings, Phone, MapPin, Clock, Sparkles, Activity, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-emerald-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-75"></div>
              <Image
                src="/new-logo.jpeg"
                alt="شعار دار الشباب"
                width={140}
                height={140}
                className="relative rounded-full shadow-2xl"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </h1>
              <h2 className="text-2xl font-semibold text-red-700">وزارة الشباب</h2>
              <h3 className="text-xl font-medium text-emerald-700">مديرية الشباب والرياضة تبسة</h3>
              <h4 className="text-xl font-medium text-red-600">ديوان مؤسسات الشباب</h4>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl shadow-lg">
                <h5 className="text-2xl font-bold flex items-center justify-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  دار الشباب سليمي إبراهيم بئر العاتر
                  <Sparkles className="w-8 h-8" />
                </h5>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Registration Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-t-xl">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">تسجيل منخرط</CardTitle>
              <CardDescription className="text-emerald-100">تسجيل منخرط جديد في دار الشباب</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Link href="/register">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300">
                  بدء التسجيل
                  <Activity className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Members List Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-t-xl">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <List className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">قائمة المنخرطين</CardTitle>
              <CardDescription className="text-blue-100">عرض وإدارة قائمة المنخرطين</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Link href="/members">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300">
                  عرض القائمة
                  <FileText className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-t-xl">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">الإحصائيات</CardTitle>
              <CardDescription className="text-purple-100">عرض الإحصائيات الكاملة</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Link href="/statistics">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300">
                  عرض الإحصائيات
                  <BarChart3 className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-t-xl">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">الإعدادات</CardTitle>
              <CardDescription className="text-orange-100">إدارة إعدادات النظام</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Link href="/settings">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300">
                  الإعدادات
                  <Settings className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                أوقات العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <p className="text-lg font-bold text-emerald-800 mb-2">كل يوم:</p>
                <div className="space-y-2">
                  <p className="text-emerald-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    من الساعة 09:00 صباحاً إلى 12:00 ظهراً
                  </p>
                  <p className="text-emerald-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    من الساعة 02:00 مساءً إلى 08:00 مساءً
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
                معلومات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-blue-800 font-medium">بئر العاتر، تبسة، الجزائر</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-blue-800 font-medium">037648656</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v2m0 0h-2m2 0h2" /></svg>
                    </div>
                    <span className="text-blue-800 font-medium">mj.birelater@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0z"/></svg>
                    </div>
                    <a href="https://www.facebook.com/mjeunes.birelater" target="_blank" rel="noopener noreferrer" className="text-blue-800 font-medium underline">صفحة الفيسبوك</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <p className="text-xl font-bold">دار الشباب سليمي إبراهيم بئر العاتر</p>
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-emerald-200 font-medium">جميع الحقوق محفوظة © 2024</p>
        </div>
      </footer>
    </div>
  )
}
