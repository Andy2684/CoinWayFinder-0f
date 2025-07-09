"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Zap, TrendingUp } from "lucide-react"

export function TelegramWidget() {
  return (
    <Card className="bg-gradient-to-br from-[#0088cc]/10 to-[#0088cc]/5 border-[#0088cc]/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Join Our Telegram Community</h3>
            <p className="text-sm text-gray-400">Get real-time signals & connect with traders</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[#0088cc]" />
            <p className="text-sm font-medium text-white">5,000+</p>
            <p className="text-xs text-gray-400">Members</p>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-[#0088cc]" />
            <p className="text-sm font-medium text-white">24/7</p>
            <p className="text-xs text-gray-400">Signals</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-[#0088cc]" />
            <p className="text-sm font-medium text-white">95%</p>
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
        </div>

        <a href="https://t.me/coinwayfinder_chat" target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-semibold">
            💬 Join Telegram Community
          </Button>
        </a>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Free signals • Market analysis • Community support</p>
        </div>
      </CardContent>
    </Card>
  )
}
