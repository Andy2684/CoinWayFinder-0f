import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-12 backdrop-blur-lg border border-white/10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  Trading Journey?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of successful traders who are already using our AI-powered platform to maximize their
                cryptocurrency profits. Start your free trial today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Link href="/auth/signup">
                  Start Trading Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent text-lg px-8 py-6"
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm mt-8">
              <span>✓ No Setup Fees</span>
              <span>✓ Cancel Anytime</span>
              <span>✓ 30-Day Money Back</span>
              <span>✓ 24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
