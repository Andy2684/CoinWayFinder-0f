import { PricingSection } from "@/components/pricing-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Pricing - CoinWayFinder",
  description: "Choose the perfect plan for your crypto trading needs. Start free and upgrade as you grow.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      <main>
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
