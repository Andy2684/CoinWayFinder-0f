import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <HeroSection />
      <FeaturesSection />
      <LiveNewsFeed variant="homepage" limit={3} />
      <PricingSection />
      <CTASection />
    </main>
  )
}
