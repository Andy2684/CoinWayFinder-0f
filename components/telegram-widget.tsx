"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Zap, TrendingUp, ExternalLink } from "lucide-react"

export function TelegramWidget() {
  return (
    <Card className="bg-gradient-to-br from-[#0088cc]/10 to-[#0088cc]/5 border-[#0088cc]/20 hover:border-[#0088cc]/40 transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left side - Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-3 bg-[#0088cc]/20 rounded-full">
                <MessageSquare className="w-8 h-8 text-[#0088cc]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Join Our Telegram Community</h3>
                <p className="text-gray-400">Get real-time signals and connect with traders</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-300 leading-relaxed">
                CoinWayfinder is an AI-powered platform for crypto market analysis, whale tracking, and smart trading
                tools. Whether you're a beginner or an experienced trader, CoinWayfinder helps you navigate the market
                with real-time data, trading signals, and AI-generated insights.
              </p>

              <p className="text-gray-300 leading-relaxed">
                Our mission is to provide powerful, easy-to-use tools that help crypto traders make smarter, faster
                decisions. Join our growing community to stay ahead of the market and never miss key movements again.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#0088cc]" />
                  <span className="text-xl font-bold text-white">5,000+</span>
                </div>
                <p className="text-sm text-gray-400">Members</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[#0088cc]" />
                  <span className="text-xl font-bold text-white">24/7</span>
                </div>
                <p className="text-sm text-gray-400">Signals</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#0088cc]" />
                  <span className="text-xl font-bold text-white">95%</span>
                </div>
                <p className="text-sm text-gray-400">Accuracy</p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
              <Badge variant="outline" className="border-[#0088cc]/30 text-[#0088cc]">
                Real-time Alerts
              </Badge>
              <Badge variant="outline" className="border-[#0088cc]/30 text-[#0088cc]">
                Whale Tracking
              </Badge>
              <Badge variant="outline" className="border-[#0088cc]/30 text-[#0088cc]">
                AI Analysis
              </Badge>
              <Badge variant="outline" className="border-[#0088cc]/30 text-[#0088cc]">
                Trading Signals
              </Badge>
            </div>
          </div>

          {/* Right side - CTA */}
          <div className="flex-shrink-0">
            <div className="text-center space-y-4">
              <div className="p-6 bg-[#0088cc]/10 rounded-2xl border border-[#0088cc]/20">
                <MessageSquare className="w-16 h-16 text-[#0088cc] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Ready to Join?</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Get instant access to our community of successful crypto traders
                </p>
                <a
                  href="https://t.me/coinwayfinder_chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full"
                >
                  <Button className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-semibold py-3 px-6">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Join Telegram
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
