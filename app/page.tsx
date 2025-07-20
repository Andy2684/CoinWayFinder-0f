import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="relative">
        <Navigation />
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
        <Footer />
        <FloatingDashboardButton />
      </div>
    </div>
  )
}
