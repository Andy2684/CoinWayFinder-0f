"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/images/home-bg.png')" }}
        />
        {/* Soft radial gradients (avoid heavy blues) */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_20%_15%,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_80%_30%,rgba(217,70,239,0.20),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_50%_90%,rgba(251,191,36,0.12),transparent_65%)]" />
        </div>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:60px_60px]" />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
          style={{ backgroundImage: "url('/images/noise.png')" }}
        />
        {/* Dark vignette for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>

      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
