"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Twitter, Github, Linkedin, Mail, Phone, MapPin, Bot, TrendingUp, Shield, Zap } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">CoinWayFinder</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The most advanced AI-powered cryptocurrency trading platform. Automate your trades, maximize profits, and
              minimize risks with our cutting-edge technology.
            </p>
            <div className="flex space-x-4">
              <Link href="https://twitter.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Product</h3>
            <div className="space-y-3">
              <Link href="/features" className="block text-gray-400 hover:text-white transition-colors">
                Trading Bots
              </Link>
              <Link href="/analytics" className="block text-gray-400 hover:text-white transition-colors">
                Analytics
              </Link>
              <Link href="/portfolio" className="block text-gray-400 hover:text-white transition-colors">
                Portfolio Management
              </Link>
              <Link href="/signals" className="block text-gray-400 hover:text-white transition-colors">
                Trading Signals
              </Link>
              <Link href="/api" className="block text-gray-400 hover:text-white transition-colors">
                API Access
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <div className="space-y-3">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/careers" className="block text-gray-400 hover:text-white transition-colors">
                Careers
              </Link>
              <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/press" className="block text-gray-400 hover:text-white transition-colors">
                Press Kit
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            <p className="text-gray-400">
              Get the latest trading insights and platform updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">Bank-Grade Security</div>
              <div className="text-gray-400 text-sm">Your funds are always safe</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">95% Success Rate</div>
              <div className="text-gray-400 text-sm">Proven trading algorithms</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold">24/7 Trading</div>
              <div className="text-gray-400 text-sm">Never miss an opportunity</div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Mail className="h-5 w-5 text-blue-400" />
            <span className="text-gray-300">support@coinwayfinder.com</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Phone className="h-5 w-5 text-green-400" />
            <span className="text-gray-300">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <MapPin className="h-5 w-5 text-purple-400" />
            <span className="text-gray-300">San Francisco, CA</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">© {currentYear} CoinWayFinder. All rights reserved.</div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
