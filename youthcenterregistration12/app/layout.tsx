import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ScrollToTop from "@/components/scroll-to-top"

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
        <ScrollToTop />
      </body>
    </html>
  )
}
