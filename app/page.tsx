import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#191A1E]">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </main>
  )
}
