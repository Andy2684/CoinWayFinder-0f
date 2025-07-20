import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl"></div>
          <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400/20 rounded-full blur-sm"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 bg-purple-400/20 rounded-full blur-sm"></div>
          <div className="absolute top-1/2 left-8 w-4 h-4 bg-cyan-400/20 rounded-full blur-sm"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Trading?
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who are already using AI to maximize their crypto profits. Start your free trial
              today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 bg-transparent"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
