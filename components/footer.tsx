"use client"

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
  ArrowRight,
  Shield,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">CoinWayFinder</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The world's most advanced AI-powered cryptocurrency trading platform. Automate your trades and maximize
              your profits with our intelligent bots.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-white transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="text-gray-400 hover:text-white transition-colors">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-400 hover:text-white transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest trading insights and platform updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 rounded-r-none"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-l-none">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center space-x-3 text-gray-400">
            <Shield className="h-5 w-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Bank-Level Security</div>
              <div className="text-sm">256-bit SSL encryption</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <Award className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-white font-medium">Award Winning</div>
              <div className="text-sm">Best Trading Platform 2024</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <Clock className="h-5 w-5 text-purple-400" />
            <div>
              <div className="text-white font-medium">24/7 Support</div>
              <div className="text-sm">Always here to help</div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center space-x-3 text-gray-400">
            <Mail className="h-5 w-5" />
            <div>
              <div className="text-white">Email</div>
              <div className="text-sm">support@coinwayfinder.com</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <Phone className="h-5 w-5" />
            <div>
              <div className="text-white">Phone</div>
              <div className="text-sm">+1 (555) 123-4567</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <MapPin className="h-5 w-5" />
            <div>
              <div className="text-white">Address</div>
              <div className="text-sm">San Francisco, CA</div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">© 2024 CoinWayFinder. All rights reserved.</div>
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
            <Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">
              Risk Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
