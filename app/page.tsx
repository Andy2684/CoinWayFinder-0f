import { TopButtonsBar } from "@/components/top-buttons-bar"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <TopButtonsBar />
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
