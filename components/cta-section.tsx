"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Users, TrendingUp, Star } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-white/30 text-white bg-white/10 backdrop-blur-sm">
            Ready to Start?
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Join 50,000+ Successful Traders Today</h2>

          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start your journey to financial freedom with our AI-powered trading platform. No experience required - our
            bots do the work for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Trading Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white/90">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 mb-2 text-emerald-200" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-emerald-100">Secure</div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 mb-2 text-emerald-200" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-emerald-100">Users</div>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-8 h-8 mb-2 text-emerald-200" />
              <div className="text-2xl font-bold">94%</div>
              <div className="text-sm text-emerald-100">Success Rate</div>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 mb-2 text-emerald-200" />
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm text-emerald-100">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
