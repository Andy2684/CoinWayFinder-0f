<<<<<<< HEAD
"use client"

import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import PricingSection from "@/components/pricing-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import Navigation from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navigation />
      <main className="transition-all duration-300">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
=======
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Добро пожаловать в CoinWayfinder</h1>
      <p className="mb-4">Анализируй крипторынок и управляй ботами прямо с панели!</p>
      <div className="space-x-4">
        <Link href="/signals" className="text-blue-500 underline">Сигналы</Link>
        <Link href="/auth/login" className="text-blue-500 underline">Войти</Link>
      </div>
    </main>
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
  )
}
