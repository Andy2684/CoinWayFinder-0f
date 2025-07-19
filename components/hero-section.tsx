"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.15)_1px,transparent_0)] [background-size:20px_20px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI-Powered Crypto Trading
            <span className="block text-green-600">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Harness the power of artificial intelligence to automate your cryptocurrency trading. Get real-time signals,
            deploy smart bots, and maximize your profits with our advanced platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-green-600">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <dt className="text-base font-semibold leading-7 text-gray-900">Smart Trading Signals</dt>
              <dd className="mt-1 text-base leading-7 text-gray-600">
                AI-powered signals that analyze market trends and provide actionable trading recommendations.
              </dd>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-green-600">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <dt className="text-base font-semibold leading-7 text-gray-900">Automated Bots</dt>
              <dd className="mt-1 text-base leading-7 text-gray-600">
                Deploy intelligent trading bots that execute trades 24/7 based on your strategy and risk tolerance.
              </dd>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-green-600">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <dt className="text-base font-semibold leading-7 text-gray-900">Secure & Reliable</dt>
              <dd className="mt-1 text-base leading-7 text-gray-600">
                Bank-grade security with encrypted API connections and secure wallet integrations.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
