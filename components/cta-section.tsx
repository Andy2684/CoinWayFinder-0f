import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-blue-500/30 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/20 rounded-full">
              <TrendingUp className="h-12 w-12 text-blue-400" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful traders who trust CoinWayFinder for their crypto trading needs. Start your
            journey today with our free trial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">No credit card required • 14-day free trial • Cancel anytime</div>
        </div>
      </div>
    </section>
  )
}
