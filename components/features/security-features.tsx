"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Key, Eye, Server, Fingerprint, AlertTriangle, CheckCircle } from "lucide-react"

export function SecurityFeatures() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Grade Encryption",
      description: "AES-256 encryption protects all your data and API keys with military-grade security",
      level: "Enterprise",
      color: "from-green-500 to-emerald-500",
      features: ["AES-256 Encryption", "SSL/TLS Protocols", "End-to-End Security", "Data Integrity"],
    },
    {
      icon: Key,
      title: "API Key Management",
      description: "Secure storage and management of exchange API keys with read-only permissions",
      level: "Advanced",
      color: "from-blue-500 to-cyan-500",
      features: ["Read-Only APIs", "Encrypted Storage", "Key Rotation", "Access Control"],
    },
    {
      icon: Fingerprint,
      title: "Multi-Factor Authentication",
      description: "Multiple layers of authentication including 2FA, biometrics, and device verification",
      level: "Premium",
      color: "from-purple-500 to-pink-500",
      features: ["2FA Support", "Biometric Auth", "Device Verification", "SMS/Email Codes"],
    },
    {
      icon: Server,
      title: "Infrastructure Security",
      description: "Secure cloud infrastructure with DDoS protection and 99.9% uptime guarantee",
      level: "Enterprise",
      color: "from-orange-500 to-red-500",
      features: ["DDoS Protection", "Load Balancing", "Redundancy", "24/7 Monitoring"],
    },
  ]

  const securityCertifications = [
    {
      icon: CheckCircle,
      title: "SOC 2 Type II",
      description: "Audited security controls and procedures",
    },
    {
      icon: Shield,
      title: "ISO 27001",
      description: "International security management standard",
    },
    {
      icon: Lock,
      title: "GDPR Compliant",
      description: "European data protection regulation compliance",
    },
    {
      icon: Eye,
      title: "PCI DSS",
      description: "Payment card industry data security standard",
    },
  ]

  const securityMetrics = [
    { label: "Uptime Guarantee", value: "99.9%", color: "text-green-400" },
    { label: "Security Incidents", value: "0", color: "text-blue-400" },
    { label: "Data Breaches", value: "0", color: "text-purple-400" },
    { label: "Response Time", value: "<1min", color: "text-orange-400" },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30">
            <Shield className="w-4 h-4 mr-2" />
            Security & Protection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise-Grade Security for{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Your Peace of Mind
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your funds and data are protected by the same security standards used by major financial institutions
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
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
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{feature.level}</Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-green-300 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Security Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Certifications */}
        <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Security Certifications & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityCertifications.map((cert, index) => (
              <div key={index} className="text-center group">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl mb-4 mx-auto w-fit group-hover:bg-white/20 transition-all duration-300">
                  <cert.icon className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-green-300 transition-colors">
                  {cert.title}
                </h4>
                <p className="text-gray-400 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {securityMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
              <div className="text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Security Promise */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 mb-6 mx-auto w-fit">
              <Shield className="h-12 w-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Security Promise</h3>
            <p className="text-gray-300 text-lg mb-6">
              We never store your exchange passwords or withdrawal permissions. All API keys are encrypted and stored
              securely with read-only access only.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-2">
                <Lock className="w-4 h-4 mr-2" />
                No Withdrawal Access
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                Read-Only Permissions
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Zero Trust Architecture
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
