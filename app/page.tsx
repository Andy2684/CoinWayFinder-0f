import { Navigation } from "@/components/navigation"
import { TopButtonsBar } from "@/components/top-buttons-bar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <TopButtonsBar />
      <Navigation />

      {/* Back to Dashboard Button */}
      <div className="container mx-auto px-4 pt-4">
        <BackToDashboard className="mb-4" />
      </div>

      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
