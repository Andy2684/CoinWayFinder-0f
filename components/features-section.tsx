import { Card, CardContent } from '@/components/ui/card'
import { Bot, MessageSquare, TrendingUp, Shield, BarChart3, Zap } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Signals via Telegram',
      description:
        'Receive real-time crypto trading signals with buy/sell recommendations, TP, and SL levels directly in Telegram.',
    },
    {
      icon: Bot,
      title: 'Auto DCA Bots',
      description:
        'Set up automated Dollar Cost Averaging bots with customizable risk settings and pair selection.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Market Scanners',
      description:
        'Advanced market scanning algorithms that identify profitable trading opportunities 24/7.',
    },
    {
      icon: Shield,
      title: 'Risk Management Tools',
      description:
        'Built-in stop-loss, take-profit, and trailing stop features to protect your investments.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description:
        'Comprehensive portfolio tracking with P&L analysis, trade history, and performance metrics.',
    },
    {
      icon: Zap,
      title: 'GPT-Based Market Analysis',
      description:
        'AI-powered market summaries and insights to help you make informed trading decisions.',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#191A1E]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need to Trade
            <span className="text-[#30D5C8]"> Smarter</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our comprehensive suite of AI-powered tools gives you the edge in crypto trading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#30D5C8]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
