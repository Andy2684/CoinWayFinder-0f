import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { FeaturesHero } from "@/components/features/features-hero"
import { TradingBots } from "@/components/features/trading-bots"
import { AIFeatures } from "@/components/features/ai-features"
import { SecurityFeatures } from "@/components/features/security-features"
import { IntegrationFeatures } from "@/components/features/integration-features"
import { AnalyticsFeatures } from "@/components/features/analytics-features"
import { MobileFeatures } from "@/components/features/mobile-features"
import { FeaturesCTA } from "@/components/features/features-cta"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Features | CoinWayFinder - Advanced Crypto Trading Platform",
  description:
    "Discover all the powerful features of CoinWayFinder: AI trading bots, real-time analytics, multi-exchange support, and more.",
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <FeaturesHero />
      <TradingBots />
      <AIFeatures />
      <SecurityFeatures />
      <IntegrationFeatures />
      <AnalyticsFeatures />
      <MobileFeatures />
      <FeaturesCTA />
      <Footer />
    </div>
  )
}
