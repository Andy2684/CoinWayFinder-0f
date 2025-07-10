import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#30D5C8]/20 via-[#30D5C8]/10 to-[#30D5C8]/20 blur-3xl" />

          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-12">
            <div className="flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-[#30D5C8]" />
            </div>

            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
              Ready to Transform Your
              <span className="text-[#30D5C8] block">Trading Results?</span>
            </h2>

            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders who are already using AI to maximize their cryptocurrency profits.
              Start your free trial today and see the difference automation can make.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#30D5C8] text-black hover:bg-[#30D5C8]/90 text-lg px-8 py-4">
                  Start Free Trial Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/subscription">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/10 text-lg px-8 py-4 bg-transparent"
                >
                  View Pricing Plans
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-400">
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
