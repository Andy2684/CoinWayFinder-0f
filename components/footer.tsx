"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Twitter, Github, Linkedin, Mail, Phone, MapPin, Bot, TrendingUp, Shield, Users } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* About Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-emerald-500 text-emerald-400">
              About CoinWayFinder
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Revolutionizing Crypto Trading with{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                CoinWayFinder is a cutting-edge cryptocurrency trading platform that harnesses the power of artificial
                intelligence to help traders maximize their profits while minimizing risks. Founded in 2023 by a team of
                experienced traders, data scientists, and blockchain engineers, we've built the most advanced automated
                trading ecosystem in the industry.
              </p>

              <p className="text-gray-300 leading-relaxed">
                Our mission is to democratize professional-grade trading tools and make them accessible to everyone,
                from beginners taking their first steps in crypto to seasoned professionals managing large portfolios.
                We believe that everyone deserves access to the same sophisticated algorithms and market insights that
                institutional traders use.
              </p>

              <p className="text-gray-300 leading-relaxed">
                With over 50,000 active users and $100M+ in trading volume, CoinWayFinder has become the trusted choice
                for traders worldwide. Our AI-powered bots have achieved an average success rate of 94%, helping our
                users generate consistent returns in both bull and bear markets.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">SEC Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">50K+ Users</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">94% Success Rate</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Our Core Values</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Bot className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Innovation First</h4>
                      <p className="text-sm text-gray-400">
                        Constantly pushing the boundaries of AI and blockchain technology
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Security & Trust</h4>
                      <p className="text-sm text-gray-400">
                        Bank-grade security with full transparency in all operations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Community Driven</h4>
                      <p className="text-sm text-gray-400">
                        Building tools that serve our community's needs and feedback
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Results Focused</h4>
                      <p className="text-sm text-gray-400">Delivering consistent, measurable results for our users</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Join Our Success Story</h3>
                <p className="text-emerald-100 mb-4">Start your journey to financial freedom today</p>
                <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CoinWayFinder</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The world's most advanced AI-powered cryptocurrency trading platform. Trade smarter, not harder.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bots" className="text-gray-400 hover:text-white transition-colors">
                  Trading Bots
                </Link>
              </li>
              <li>
                <Link href="/signals" className="text-gray-400 hover:text-white transition-colors">
                  Signals
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                  Market News
                </Link>
              </li>
              <li>
                <Link href="/market-analysis" className="text-gray-400 hover:text-white transition-colors">
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link href="/ai-bots" className="text-gray-400 hover:text-white transition-colors">
                  AI Bots
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@coinwayfinder.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2 text-white">Stay Updated</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 CoinWayFinder. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
