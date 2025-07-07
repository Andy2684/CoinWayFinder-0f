import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageSquare, Bot } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#30D5C8]/20 via-blue-500/10 to-purple-500/20 border border-[#30D5C8]/30">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

          <div className="relative p-8 sm:p-12 text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-[#30D5C8]/20 text-[#30D5C8] border-[#30D5C8]/30">
              <Bot className="w-4 h-4 mr-2" />
              Ready to Start?
            </Badge>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Join Thousands of Successful
              <br />
              <span className="bg-gradient-to-r from-[#30D5C8] to-blue-400 bg-clip-text text-transparent">
                Crypto Traders
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start receiving AI-powered trading signals and automated DCA strategies directly in your Telegram today.
              No experience required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black font-semibold px-8 py-4 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800/50 px-8 py-4 text-lg bg-transparent"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Join Telegram
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <span>✓ 100,000+ Active Users</span>
              <span>✓ 95% Signal Accuracy</span>
              <span>✓ 24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
