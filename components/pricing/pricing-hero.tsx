"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"

export function PricingHero() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="container mx-auto max-w-4xl">
        <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Star className="w-4 h-4 mr-2" />
          Trusted by 10,000+ traders
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Simple, Transparent{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Pricing</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Start trading with AI-powered bots today. No hidden fees, no long-term contracts. Scale your trading as you
          grow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold bg-transparent"
          >
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
