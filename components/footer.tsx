"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  ArrowRight,
  UserPlus,
  LogIn,
  Shield,
  Award,
  Globe,
  Clock,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function Footer() {
  const { user } = useAuth()

  const footerLinks = {
    platform: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Trading Bots", href: "/bots" },
      { name: "Market Analysis", href: "/market-analysis" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Trading Signals", href: "/signals" },
      { name: "News & Insights", href: "/news" },
    ],
    features: [
      { name: "AI Trading", href: "/features/ai-trading" },
      { name: "Risk Management", href: "/features/risk-management" },
      { name: "Real-time Data", href: "/features/real-time-data" },
      { name: "Advanced Analytics", href: "/features/analytics" },
      { name: "Mobile App", href: "/features/mobile" },
      { name: "API Access", href: "/features/api" },
    ],
    resources: [
      { name: "Help Center", href: "/help" },
      { name: "Trading Guide", href: "/guide" },
      { name: "API Documentation", href: "/docs" },
      { name: "Video Tutorials", href: "/tutorials" },
      { name: "Webinars", href: "/webinars" },
      { name: "Community", href: "/community" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Investors", href: "/investors" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Risk Disclosure", href: "/risk" },
      { name: "Compliance", href: "/compliance" },
      { name: "Security", href: "/security" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/coinwayfinder" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/coinwayfinder" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/coinwayfinder" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/coinwayfinder" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/coinwayfinder" },
    { name: "GitHub", icon: Github, href: "https://github.com/coinwayfinder" },
  ]

  const trustBadges = [
    { icon: Shield, text: "SSL Secured" },
    { icon: Award, text: "Award Winning" },
    { icon: Globe, text: "Global Platform" },
    { icon: Clock, text: "24/7 Support" },
  ]

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
      {/* Newsletter Section */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Your Trading Journey?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful traders using our AI-powered platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3 bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Bot className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">CoinWayFinder</span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The world's most advanced AI-powered crypto trading platform. Trade smarter, not harder with our
              cutting-edge algorithms and real-time market analysis.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>support@coinwayfinder.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Quick Auth Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-12 bg-white/10" />

        {/* Newsletter Signup */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-white mb-2">Stay Updated</h4>
              <p className="text-gray-300">Get the latest trading insights and platform updates</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links & Trust Badges */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* Social Links */}
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            <span className="text-white font-medium">Follow Us:</span>
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              )
            })}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center space-x-6">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <div key={index} className="flex items-center space-x-2 text-gray-400">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legal Links */}
        <div className="mb-8">
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <Separator className="mb-8 bg-white/10" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 CoinWayFinder. All rights reserved. Trading involves risk and may not be suitable for all investors.
          </div>

          {!user && (
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Now
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
