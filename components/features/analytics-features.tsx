"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, PieChart, Activity, Target, Eye, Brain, Zap } from "lucide-react"

export function AnalyticsFeatures() {
  const analyticsTools = [
    {
      icon: BarChart3,
      title: "Advanced Charting",
      description: "Professional-grade charts with 100+ technical indicators and drawing tools",
      features: ["TradingView Integration", "Custom Indicators", "Multi-Timeframe", "Pattern Recognition"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Comprehensive performance tracking with detailed P&L analysis and metrics",
      features: ["P&L Tracking", "Sharpe Ratio", "Max Drawdown", "Win Rate Analysis"],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: PieChart,
      title: "Portfolio Analytics",
      description: "Real-time portfolio monitoring with asset allocation and risk assessment",
      features: ["Asset Allocation", "Risk Metrics", "Correlation Analysis", "Rebalancing Alerts"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Activity,
      title: "Market Analysis",
      description: "Deep market insights with sentiment analysis and trend identification",
      features: ["Market Sentiment", "Volume Analysis", "Volatility Tracking", "News Impact"],
      color: "from-orange-500 to-red-500",
    },
  ]

  const analyticsMetrics = [
    {
      icon: Eye,
      title: "Data Points",
      value: "1M+",
      description: "Real-time market data points processed daily",
      color: "text-blue-400",
    },
    {
      icon: Brain,
      title: "Indicators",
      value: "100+",
      description: "Technical indicators and custom studies",
      color: "text-purple-400",
    },
    {
      icon: Target,
      title: "Accuracy",
      value: "94%",
      description: "Signal accuracy rate for trend predictions",
      color: "text-green-400",
    },
    {
      icon: Zap,
      title: "Speed",
      value: "<1ms",
      description: "Real-time data processing latency",
      color: "text-orange-400",
    },
  ]

  const reportingFeatures = [
    {
      title: "Real-Time Dashboards",
      description: "Live performance monitoring with customizable widgets",
      progress: 100,
    },
    {
      title: "Automated Reports",
      description: "Daily, weekly, and monthly performance reports",
      progress: 95,
    },
    {
      title: "Tax Reporting",
      description: "Comprehensive tax reports for crypto trading activities",
      progress: 90,
    },
    {
      title: "Risk Analytics",
      description: "Advanced risk metrics and portfolio optimization",
      progress: 88,
    },
    {
      title: "Backtesting Engine",
      description: "Historical strategy testing with detailed analytics",
      progress: 92,
    },
    {
      title: "API Analytics",
      description: "Performance metrics for API usage and bot efficiency",
      progress: 85,
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics & Reporting
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional Analytics for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Data-Driven Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Make informed trading decisions with comprehensive analytics, real-time reporting, and advanced performance
            metrics
          </p>
        </div>

        {/* Analytics Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {analyticsTools.map((tool, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Professional</Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {tool.description}
                </CardDescription>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Key Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, featureIndex) => (
                      <Badge
                        key={featureIndex}
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-300 justify-center"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Metrics */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Analytics Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsMetrics.map((metric, index) => (
              <div key={index} className="text-center group">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl mb-4 mx-auto w-fit group-hover:bg-white/20 transition-all duration-300">
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
                <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
                <h4 className="text-white font-semibold mb-1">{metric.title}</h4>
                <p className="text-gray-400 text-sm">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reporting Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Comprehensive Reporting</h3>
            <p className="text-gray-300 mb-8">
              Get detailed insights into your trading performance with automated reports, tax documentation, and risk
              analytics.
            </p>
            <div className="space-y-6">
              {reportingFeatures.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-medium">{feature.title}</h4>
                    <span className="text-sm text-gray-400">{feature.progress}%</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
                  <Progress value={feature.progress} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4">Sample Analytics Dashboard</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">+24.7%</div>
                  <div className="text-xs text-gray-400">Total Return</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">2.4</div>
                  <div className="text-xs text-gray-400">Sharpe Ratio</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">78%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">-8.2%</div>
                  <div className="text-xs text-gray-400">Max Drawdown</div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Portfolio Allocation</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">BTC</span>
                    <span className="text-white">45%</span>
                  </div>
                  <Progress value={45} className="h-1" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">ETH</span>
                    <span className="text-white">30%</span>
                  </div>
                  <Progress value={30} className="h-1" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Others</span>
                    <span className="text-white">25%</span>
                  </div>
                  <Progress value={25} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-full px-6 py-3 border border-blue-500/30">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Powered by TradingView and custom analytics engine</span>
          </div>
        </div>
      </div>
    </section>
  )
}
