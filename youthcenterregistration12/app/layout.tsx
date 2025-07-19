import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Cairo } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })
const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "دار الشباب سليمي إبراهيم بئر العاتر",
  description: "نظام تسجيل المنخرطين في دار الشباب",
  generator: "v0.dev",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${cairo.className} bg-background text-foreground min-h-screen relative`}>
        {/* Watermark background logo */}
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none select-none flex items-center justify-center opacity-10">
          <Image src="/logo-ministry.png" alt="شعار الوزارة" width={600} height={600} className="mx-auto" style={{objectFit:'contain'}} />
        </div>
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg shadow-md border-b border-emerald-200 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button id="menu-btn" className="md:hidden p-2 rounded-lg hover:bg-emerald-100 focus:outline-none" aria-label="فتح القائمة">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect y="4" width="24" height="2" rx="1" fill="#059669"/><rect y="11" width="24" height="2" rx="1" fill="#059669"/><rect y="18" width="24" height="2" rx="1" fill="#059669"/></svg>
            </button>
            <Image src="/logo-ministry.png" alt="شعار الوزارة" width={48} height={48} className="rounded-full shadow border border-emerald-200 bg-white" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-emerald-800 leading-tight">الجمهورية الجزائرية الديمقراطية الشعبية</span>
              <span className="text-sm font-semibold text-emerald-700 leading-tight">وزارة الشباب والرياضة</span>
              <span className="text-xs font-semibold text-emerald-600 leading-tight">دار الشباب سليمي إبراهيم بئر العاتر</span>
            </div>
          </div>
        </header>
        {/* Hidden Sidebar Drawer */}
        <nav id="sidebar-drawer" className="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-emerald-700 to-teal-700 text-white shadow-2xl z-40 transform translate-x-full transition-transform duration-300 md:translate-x-0 md:static md:block">
          <div className="flex flex-col items-center py-8 gap-3">
            <Image src="/logo-ministry.png" alt="شعار الوزارة" width={90} height={90} className="rounded-full shadow-lg border-2 border-white bg-white" />
            <h1 className="text-lg font-bold text-center leading-tight">دار الشباب<br />سليمي إبراهيم</h1>
            <span className="text-xs text-emerald-100">بئر العاتر</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 px-6">
            <Link href="/" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الرئيسية</Link>
            <Link href="/register" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">تسجيل منخرط</Link>
            <Link href="/members" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">قائمة المنخرطين</Link>
            <Link href="/statistics" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الإحصائيات</Link>
            <Link href="/settings" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الإعدادات</Link>
          </div>
        </nav>
        {/* Overlay for sidebar on mobile */}
        <div id="sidebar-overlay" className="fixed inset-0 bg-black bg-opacity-30 z-30 hidden md:hidden"></div>
        {/* Main Content Area */}
        <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
        {/* Drawer open/close script */}
        <script dangerouslySetInnerHTML={{__html:`
          const btn = document.getElementById('menu-btn');
          const drawer = document.getElementById('sidebar-drawer');
          const overlay = document.getElementById('sidebar-overlay');
          if(btn && drawer && overlay) {
            btn.onclick = () => {
              drawer.classList.remove('translate-x-full');
              overlay.classList.remove('hidden');
            };
            overlay.onclick = () => {
              drawer.classList.add('translate-x-full');
              overlay.classList.add('hidden');
            };
          }
        `}} />
      </body>
    </html>
  )
}
