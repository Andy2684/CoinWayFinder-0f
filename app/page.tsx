import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { LiveNewsFeed } from "@/components/live-news-feed"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { TelegramWidget } from "@/components/telegram-widget"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <HeroSection />
      <FeaturesSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TelegramWidget />
      </div>
      <LiveNewsFeed variant="homepage" limit={3} />
      <PricingSection />
      <CTASection />
    </main>
  )
}
