"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Star, Trophy, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { Reward } from "@/types/gamification"

interface RewardNotificationProps {
  reward: Reward | null
  onClose: () => void
  newLevel?: number | null
}

export function RewardNotification({ reward, onClose, newLevel }: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (reward) {
      setIsVisible(true)

      // Trigger confetti for legendary achievements
      if (reward.animation === "confetti") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [reward])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!reward) return null

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500"
      case "epic":
        return "from-purple-400 to-pink-500"
      case "rare":
        return "from-blue-400 to-cyan-500"
      default:
        return "from-green-400 to-emerald-500"
    }
  }

  const getIcon = () => {
    switch (reward.type) {
      case "achievement":
        return <Trophy className="w-8 h-8" />
      case "badge":
        return <Star className="w-8 h-8" />
      case "points":
        return <Zap className="w-8 h-8" />
      default:
        return <Trophy className="w-8 h-8" />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className={`bg-gradient-to-r ${getRarityColor()} p-1 shadow-2xl`}>
            <Card className="bg-slate-900 m-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={reward.animation === "bounce" ? { y: [0, -10, 0] } : {}}
                      transition={{ duration: 0.6, repeat: 2 }}
                      className="text-yellow-400"
                    >
                      {getIcon()}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{reward.title}</h3>
                      <p className="text-gray-300 text-sm">{reward.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {newLevel && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-3"
                  >
                    <Badge className="bg-blue-500 text-white">🎉 Level Up! You're now Level {newLevel}</Badge>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-bold">+{reward.value} points</span>
                    <span className="text-2xl">{reward.icon}</span>
                  </div>
                  <Button size="sm" onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                    Awesome!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
