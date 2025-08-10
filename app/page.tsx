import Footer from "@/components/footer"
import CTASection from "@/components/cta-section"
import PricingSection from "@/components/pricing-section"
import FeaturesSection from "@/components/features-section"
import HeroSection from "@/components/hero-section"

// Homepage with a new, lightweight, layered background:
// - Radial accent gradients
// - Subtle grid pattern
// - Soft noise overlay to avoid color banding
// No heavy animations; responsive and accessible.
export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Radial glow top-right */}
        <div
          className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(16,185,129,0.25), rgba(147,51,234,0.12) 45%, rgba(0,0,0,0) 70%)",
          }}
        />
        {/* Radial glow bottom-left */}
        <div
          className="absolute -bottom-40 -left-40 h-[540px] w-[540px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(147,51,234,0.20), rgba(16,185,129,0.10) 50%, rgba(0,0,0,0) 75%)",
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 0 0",
          }}
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
          style={{ backgroundImage: "url('/images/noise-texture.png')" }}
        />
      </div>

      {/* Content stack */}
      <div className="relative z-10">
        {/* If your Navigation component exists and you want it here, uncomment:
        import Navigation from "@/components/navigation"
        <Navigation />
        */}

        {/* Existing sections */}
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}
