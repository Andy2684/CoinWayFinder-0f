"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Cpu, Target, Zap, TrendingUp, Activity, BarChart3, Eye } from "lucide-react"

export function AIFeatures() {
  const aiCapabilities = [
    {
      icon: Brain,
      title: "Neural Network Analysis",
      description: "Deep learning models analyze thousands of market indicators simultaneously",
      accuracy: 94,
      color: "from-blue-500 to-cyan-500",
      features: ["Pattern Recognition", "Sentiment Analysis", "Price Prediction", "Risk Assessment"],
    },
    {
      icon: Target,
      title: "Predictive Analytics",
      description: "AI algorithms predict market movements with high accuracy using historical data",
      accuracy: 87,
      color: "from-purple-500 to-pink-500",
      features: ["Trend Forecasting", "Support/Resistance", "Volatility Prediction", "Volume Analysis"],
    },
    {
      icon: Zap,
      title: "Real-Time Decision Making",
      description: "Lightning-fast AI decisions based on live market data and news sentiment",
      accuracy: 91,
      color: "from-green-500 to-emerald-500",
      features: ["Millisecond Execution", "News Analysis", "Social Sentiment", "Market Microstructure"],
    },
    {
      icon: Activity,
      title: "Adaptive Learning",
      description: "AI continuously learns from market conditions and improves trading strategies",
      accuracy: 89,
      color: "from-orange-500 to-red-500",
      features: ["Strategy Optimization", "Performance Learning", "Market Adaptation", "Risk Adjustment"],
    },
  ]

  const aiMetrics = [
    {
      icon: Eye,
      title: "Market Vision",
      value: "1000+",
      description: "Data points analyzed per second",
      color: "text-blue-400",
    },
    {
      icon: Cpu,
      title: "Processing Power",
      value: "99.9%",
      description: "AI model accuracy rate",
      color: "text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Prediction Success",
      value: "87%",
      description: "Successful trade predictions",
      color: "text-green-400",
    },
    {
      icon: BarChart3,
      title: "Data Processing",
      value: "24/7",
      description: "Continuous market analysis",
      color: "text-orange-400",
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
            <Brain className="w-4 h-4 mr-2" />
            Artificial Intelligence
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Advanced AI Technology for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Smarter Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harness the power of cutting-edge artificial intelligence to make informed trading decisions and maximize
            your profits
          </p>
        </div>

        {/* AI Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {aiCapabilities.map((capability, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${capability.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <capability.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{capability.accuracy}%</div>
                    <div className="text-xs text-gray-400">Accuracy</div>
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-purple-300 transition-colors">
                  {capability.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {capability.description}
                </CardDescription>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">AI Performance</span>
                    <span className="text-white">{capability.accuracy}%</span>
                  </div>
                  <Progress value={capability.accuracy} className="h-2" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">AI Capabilities:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {capability.features.map((feature, featureIndex) => (
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

        {/* AI Metrics */}
        <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">AI Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiMetrics.map((metric, index) => (
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

        {/* AI Technology Stack */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Powered by Advanced AI Technologies</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            {[
              "TensorFlow",
              "PyTorch",
              "Scikit-learn",
              "Keras",
              "OpenAI GPT",
              "Neural Networks",
              "Deep Learning",
              "Machine Learning",
            ].map((tech, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
