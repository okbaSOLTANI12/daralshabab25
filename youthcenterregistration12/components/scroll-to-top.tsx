"use client"

import { useState, useEffect } from "react"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed left-6 bottom-6 z-50 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-none rounded-full px-5 py-3 text-lg font-bold shadow-lg cursor-pointer flex items-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300"
          aria-label="العودة لأعلى الصفحة"
        >
          <span className="text-2xl">↑</span>
          <span>أعلى الصفحة</span>
        </button>
      )}
    </>
  )
} 