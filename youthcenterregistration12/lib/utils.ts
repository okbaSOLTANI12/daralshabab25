import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function getAgeGroup(age: number): string {
  if (age >= 5 && age <= 15) return "5-15"
  if (age >= 16 && age <= 22) return "16-22"
  if (age >= 23 && age <= 29) return "23-29"
  if (age >= 30) return "30+"
  return "<5"
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateMemberId(counter: number, season: string): string {
  const paddedCounter = counter.toString().padStart(5, "0")
  return `MJBEA${season}${paddedCounter}`
}
