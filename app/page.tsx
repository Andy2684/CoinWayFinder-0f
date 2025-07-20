import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* New Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-cyan-400/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce delay-1500"></div>
      </div>

      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
