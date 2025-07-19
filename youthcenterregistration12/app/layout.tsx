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
      <body className={`${inter.className} ${cairo.className} bg-background text-foreground min-h-screen flex`}>
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 h-screen bg-gradient-to-b from-emerald-700 to-teal-700 text-white shadow-2xl fixed right-0 top-0 z-30">
          <div className="flex flex-col items-center py-8 gap-3">
            <Image src="/new-logo.jpeg" alt="شعار دار الشباب" width={70} height={70} className="rounded-full shadow-lg border-2 border-white" />
            <h1 className="text-lg font-bold text-center leading-tight">دار الشباب<br />سليمي إبراهيم</h1>
            <span className="text-xs text-emerald-100">بئر العاتر</span>
          </div>
          <nav className="flex-1 flex flex-col gap-2 px-6">
            <Link href="/" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الرئيسية</Link>
            <Link href="/register" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">تسجيل منخرط</Link>
            <Link href="/members" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">قائمة المنخرطين</Link>
            <Link href="/statistics" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الإحصائيات</Link>
            <Link href="/settings" className="py-3 px-4 rounded-lg hover:bg-emerald-800 transition-all font-semibold">الإعدادات</Link>
          </nav>
        </aside>
        {/* Main Content Area */}
        <div className="flex-1 min-h-screen md:mr-64 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 transition-colors duration-300">
          {/* Topbar */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg shadow-md border-b border-emerald-200 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Image src="/new-logo.jpeg" alt="شعار دار الشباب" width={40} height={40} className="rounded-full shadow border border-emerald-200" />
              <span className="text-lg font-bold text-emerald-800">نظام تسجيل المنخرطين</span>
            </div>
            {/* Future: user menu or notifications */}
          </header>
          <main className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
