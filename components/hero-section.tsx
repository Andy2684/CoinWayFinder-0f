"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-24 sm:py-32 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-300 ring-1 ring-white/10 hover:ring-white/20">
              Advanced AI-powered trading platform.{" "}
              <Link href="/features" className="font-semibold text-indigo-400">
                <span className="absolute inset-0" aria-hidden="true" />
                Learn more <ArrowRight className="inline h-4 w-4" />
              </Link>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Smart Trading with{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Bots
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            Maximize your crypto trading potential with our advanced AI bots, real-time market analysis, and
            comprehensive portfolio management tools. Trade smarter, not harder.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                View Features
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-indigo-600/10 p-3 ring-1 ring-indigo-600/20">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">AI Trading Bots</h3>
              <p className="mt-2 text-sm text-gray-400">Automated trading strategies powered by machine learning</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-purple-600/10 p-3 ring-1 ring-purple-600/20">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">Secure & Reliable</h3>
              <p className="mt-2 text-sm text-gray-400">Bank-grade security with 99.9% uptime guarantee</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-emerald-600/10 p-3 ring-1 ring-emerald-600/20">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">Real-time Analytics</h3>
              <p className="mt-2 text-sm text-gray-400">Live market data and performance tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
