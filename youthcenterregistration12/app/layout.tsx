import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "دار الشباب سليمي إبراهيم بئر العاتر",
  description: "نظام تسجيل المنخرطين في دار الشباب",
  generator: "v0.dev",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
}

// Force dynamic rendering to prevent static generation issues
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
      </head>
      <body className={inter.className}>
        {children}
        {/* Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            left: 24,
            bottom: 24,
            zIndex: 50,
            background: 'linear-gradient(to right, #10b981, #06b6d4)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 20px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          aria-label="العودة لأعلى الصفحة"
        >
          <span style={{ fontSize: '1.5em', lineHeight: 1 }}>↑</span>
          <span>أعلى الصفحة</span>
        </button>
      </body>
    </html>
  )
}
