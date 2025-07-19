import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"

interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
}

export default function Header({ 
  title = "دار الشباب سليمي إبراهيم بئر العاتر",
  subtitle = "نظام تسجيل المنخرطين",
  showBackButton = false,
  backUrl = "/"
}: HeaderProps) {
  return (
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
                {title}
                <Sparkles className="w-8 h-8" />
              </h5>
              {subtitle && (
                <p className="text-emerald-100 mt-2 text-lg">{subtitle}</p>
              )}
            </div>
          </div>
          {showBackButton && (
            <Link 
              href={backUrl} 
              className="flex items-center gap-3 text-emerald-800 hover:text-emerald-600 transition-colors bg-white/80 px-4 py-2 rounded-lg shadow-md"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">العودة للرئيسية</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
} 