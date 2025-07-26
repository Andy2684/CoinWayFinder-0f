"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Bell, Fingerprint, Wifi, Download, Star, Apple, Play } from "lucide-react"

export function MobileFeatures() {
  const mobileFeatures = [
    {
      icon: Smartphone,
      title: "Native Mobile Apps",
      description: "Full-featured iOS and Android apps with native performance and smooth user experience",
      features: ["iOS & Android", "Native Performance", "Offline Mode", "Touch ID/Face ID"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Real-time alerts for price movements, trade executions, and portfolio changes",
      features: ["Price Alerts", "Trade Notifications", "News Updates", "Custom Alerts"],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Fingerprint,
      title: "Biometric Security",
      description: "Secure access with fingerprint, Face ID, and PIN protection for your mobile trading",
      features: ["Fingerprint Login", "Face ID Support", "PIN Protection", "Auto-Lock"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Wifi,
      title: "Offline Capabilities",
      description: "View portfolio data and charts even when offline, with automatic sync when connected",
      features: ["Offline Charts", "Cached Data", "Auto Sync", "Background Updates"],
      color: "from-orange-500 to-red-500",
    },
  ]

  const appStats = [
    { label: "App Store Rating", value: "4.8", icon: Star, color: "text-yellow-400" },
    { label: "Downloads", value: "100K+", icon: Download, color: "text-blue-400" },
    { label: "Active Users", value: "50K+", icon: Smartphone, color: "text-green-400" },
    { label: "Push Notifications", value: "1M+", icon: Bell, color: "text-purple-400" },
  ]

  const mobileScreens = [
    {
      title: "Dashboard",
      description: "Complete portfolio overview with real-time data",
    },
    {
      title: "Trading",
      description: "Execute trades with professional tools",
    },
    {
      title: "Analytics",
      description: "Advanced charts and performance metrics",
    },
    {
      title: "Alerts",
      description: "Customizable notifications and alerts",
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile Trading
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trade Anywhere with{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Mobile Apps
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Full-featured mobile applications for iOS and Android with all the power of our desktop platform in your
            pocket
          </p>
        </div>

        {/* Mobile Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mobileFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Mobile</Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Mobile Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((item, itemIndex) => (
                      <Badge
                        key={itemIndex}
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-300 justify-center"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Stats */}
        <div className="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Mobile App Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl mb-4 mx-auto w-fit group-hover:bg-white/20 transition-all duration-300">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <h4 className="text-white font-semibold mb-1">{stat.label}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Screens Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Mobile App Features</h3>
            <p className="text-gray-300 mb-8">
              Experience the full power of CoinWayFinder on your mobile device with our native iOS and Android
              applications.
            </p>
            <div className="space-y-4">
              {mobileScreens.map((screen, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{screen.title}</h4>
                    <p className="text-gray-400 text-sm">{screen.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4">Download Our Apps</h4>
            <p className="text-gray-300 mb-6">
              Get started with mobile trading today. Available on both iOS and Android platforms.
            </p>

            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white flex items-center justify-center gap-3 py-3">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>

              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white flex items-center justify-center gap-3 py-3">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs text-green-100">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>4.8/5 Rating</span>
                </div>
                <div>•</div>
                <div>100K+ Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Benefits */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 mb-6 mx-auto w-fit">
              <Smartphone className="h-12 w-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Trading Opportunity</h3>
            <p className="text-gray-300 text-lg mb-6">
              Stay connected to the markets 24/7 with instant notifications, real-time data, and full trading
              capabilities on your mobile device.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-2">
                <Bell className="w-4 h-4 mr-2" />
                Real-time Alerts
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2">
                <Fingerprint className="w-4 h-4 mr-2" />
                Biometric Security
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-2">
                <Wifi className="w-4 h-4 mr-2" />
                Offline Access
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
