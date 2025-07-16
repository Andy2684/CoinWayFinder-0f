"use client"

import { useEffect } from "react"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import PricingSection from "@/components/pricing-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function HomePage() {
  useEffect(() => {
    // Add smooth scrolling class to body
    document.body.classList.add("page-transition")

    return () => {
      document.body.classList.remove("page-transition")
    }
  }, [])

  return (
    <div className="landing-bg min-h-screen">
      <HeroSection />
      <div className="bg-background transition-colors duration-500">
        <FeaturesSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
