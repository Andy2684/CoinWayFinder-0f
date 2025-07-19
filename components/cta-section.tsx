import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-emerald-600 to-green-600">
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Trading?</h2>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100">
              Join thousands of successful traders who are already using our AI-powered platform to maximize their
              profits and minimize their risks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/auth/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/signals">
                  <TrendingUp className="mr-2 w-5 h-5" />
                  View Live Signals
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">14 Days</div>
                <div className="text-emerald-100">Free Trial</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">No Setup</div>
                <div className="text-emerald-100">Fees Required</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-emerald-100">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
