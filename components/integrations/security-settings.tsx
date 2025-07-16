"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Key, Lock, Eye, AlertTriangle, CheckCircle, Clock, Smartphone, Globe, Activity } from "lucide-react"

export function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ipWhitelist: true,
    sessionTimeout: "30",
    apiKeyRotation: true,
    encryptionLevel: "AES-256",
    auditLogging: true,
    suspiciousActivityDetection: true,
    withdrawalConfirmation: true,
    deviceVerification: true,
    geolocationRestrictions: false,
  })

  const securityFeatures = [
    {
      title: "Two-Factor Authentication",
      description: "Require 2FA for all API operations",
      icon: Smartphone,
      enabled: securitySettings.twoFactorAuth,
      critical: true,
      status: "active",
    },
    {
      title: "IP Whitelisting",
      description: "Restrict API access to approved IP addresses",
      icon: Globe,
      enabled: securitySettings.ipWhitelist,
      critical: true,
      status: "active",
    },
    {
      title: "API Key Rotation",
      description: "Automatically rotate API keys every 90 days",
      icon: Key,
      enabled: securitySettings.apiKeyRotation,
      critical: false,
      status: "active",
    },
    {
      title: "Audit Logging",
      description: "Log all API calls and trading activities",
      icon: Activity,
      enabled: securitySettings.auditLogging,
      critical: true,
      status: "active",
    },
    {
      title: "Suspicious Activity Detection",
      description: "AI-powered detection of unusual trading patterns",
      icon: Eye,
      enabled: securitySettings.suspiciousActivityDetection,
      critical: false,
      status: "active",
    },
    {
      title: "Device Verification",
      description: "Verify new devices before allowing access",
      icon: Lock,
      enabled: securitySettings.deviceVerification,
      critical: true,
      status: "active",
    },
  ]

  const securityLogs = [
    {
      timestamp: "2024-01-07 14:30:22",
      event: "API Key Created",
      exchange: "Binance",
      ip: "192.168.1.100",
      status: "success",
      details: "New API key added for trading bot",
    },
    {
      timestamp: "2024-01-07 13:15:45",
      event: "Login Attempt",
      exchange: "System",
      ip: "10.0.0.1",
      status: "success",
      details: "Successful login with 2FA",
    },
    {
      timestamp: "2024-01-07 12:45:12",
      event: "Suspicious Activity",
      exchange: "Bybit",
      ip: "192.168.1.100",
      status: "warning",
      details: "Unusual trading volume detected",
    },
    {
      timestamp: "2024-01-07 11:20:33",
      event: "API Rate Limit",
      exchange: "KuCoin",
      ip: "192.168.1.100",
      status: "error",
      details: "Rate limit exceeded, requests throttled",
    },
    {
      timestamp: "2024-01-07 10:05:18",
      event: "Key Rotation",
      exchange: "Coinbase",
      ip: "System",
      status: "success",
      details: "Automatic API key rotation completed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">🔒 Security Settings</h2>
        <p className="text-gray-300">Configure security measures to protect your trading accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Features */}
        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#30D5C8]" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium">{feature.title}</h4>
                        {feature.critical && (
                          <Badge variant="outline" className="border-red-500/20 text-red-400 text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={feature.enabled ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}
                    >
                      {feature.status}
                    </Badge>
                    <Switch checked={feature.enabled} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Advanced Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout" className="text-white">
                    Session Timeout (minutes)
                  </Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="encryption" className="text-white">
                    Encryption Level
                  </Label>
                  <Select
                    value={securitySettings.encryptionLevel}
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, encryptionLevel: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="AES-512">AES-512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Withdrawal Confirmation</Label>
                  <Switch
                    checked={securitySettings.withdrawalConfirmation}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, withdrawalConfirmation: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white">Geolocation Restrictions</Label>
                  <Switch
                    checked={securitySettings.geolocationRestrictions}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, geolocationRestrictions: checked })
                    }
                  />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-yellow-400 font-semibold">Security Recommendation</h4>
                </div>
                <p className="text-yellow-300 text-sm">
                  Enable all critical security features and use hardware 2FA devices for maximum protection.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Logs */}
        <div>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
                  Security Activity Log
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                >
                  Export Log
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {securityLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(log.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">{log.event}</h4>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {log.exchange}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{log.details}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{log.timestamp}</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Score */}
          <Card className="bg-gray-900/50 border-gray-800 mt-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">92/100</h3>
                <p className="text-white font-semibold mb-1">Excellent Security</p>
                <p className="text-gray-400 text-sm mb-4">Your account is well protected</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Authentication</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Access Control</span>
                    <span className="text-green-400">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Monitoring</span>
                    <span className="text-yellow-400">85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Encryption</span>
                    <span className="text-green-400">100%</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
                  Security Audit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
