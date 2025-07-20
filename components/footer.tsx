"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Bot,
  Shield,
  Award,
  Globe,
  Smartphone,
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Bell,
  HelpCircle,
  FileText,
  Lock,
  Star,
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Trading Bots", href: "/bots", icon: Bot },
        { name: "Market Analysis", href: "/market-analysis", icon: BarChart3 },
        { name: "Portfolio Tracker", href: "/portfolio", icon: TrendingUp },
        { name: "Trading Signals", href: "/signals", icon: Bell },
        { name: "Mobile App", href: "/mobile", icon: Smartphone },
        { name: "API Access", href: "/api", icon: Globe },
      ],
    },
    {
      title: "Features",
      links: [
        { name: "AI Trading", href: "/features/ai-trading", icon: Bot },
        { name: "Security", href: "/features/security", icon: Shield },
        { name: "Analytics", href: "/features/analytics", icon: BarChart3 },
        { name: "Copy Trading", href: "/features/copy-trading", icon: Users },
        { name: "Fast Execution", href: "/features/execution", icon: Zap },
        { name: "Multi-Exchange", href: "/features/exchanges", icon: Globe },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help", icon: HelpCircle },
        { name: "Documentation", href: "/docs", icon: FileText },
        { name: "API Docs", href: "/api-docs", icon: Globe },
        { name: "Trading Guide", href: "/guide", icon: BarChart3 },
        { name: "Video Tutorials", href: "/tutorials", icon: Youtube },
        { name: "Community", href: "/community", icon: Users },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about", icon: Users },
        { name: "Careers", href: "/careers", icon: TrendingUp },
        { name: "Press Kit", href: "/press", icon: FileText },
        { name: "Partners", href: "/partners", icon: Globe },
        { name: "Affiliates", href: "/affiliates", icon: Award },
        { name: "Contact", href: "/contact", icon: Mail },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy", icon: Lock },
        { name: "Terms of Service", href: "/terms", icon: FileText },
        { name: "Cookie Policy", href: "/cookies", icon: Shield },
        { name: "Compliance", href: "/compliance", icon: Award },
        { name: "Security", href: "/security", icon: Shield },
        { name: "Licenses", href: "/licenses", icon: FileText },
      ],
    },
  ]

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "Facebook", href: "https://facebook.com", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { name: "YouTube", href: "https://youtube.com", icon: Youtube },
    { name: "GitHub", href: "https://github.com", icon: Github },
  ]

  const quickActions = [
    { name: "Start Trading", href: "/auth/signup", variant: "default" as const },
    { name: "View Pricing", href: "/pricing", variant: "outline" as const },
    { name: "Contact Sales", href: "/contact", variant: "ghost" as const },
    { name: "Download App", href: "/mobile", variant: "secondary" as const },
  ]

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">CoinWayFinder</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The world's most advanced AI-powered crypto trading platform. Join thousands of traders who trust us to
              maximize their profits with cutting-edge technology and unparalleled security.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="w-3 h-3 mr-1" />
                SSL Secured
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Award className="w-3 h-3 mr-1" />
                Award Winning
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Star className="w-3 h-3 mr-1" />
                4.9/5 Rating
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <span>support@coinwayfinder.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Ahead of the Market</h3>
              <p className="text-gray-300 mb-6">
                Get exclusive trading insights, market analysis, and platform updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => {
                  const Icon = link.icon
                  return (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                      >
                        <Icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h4 className="text-white font-semibold mb-6 text-center">Quick Actions</h4>
          <div className="flex flex-wrap gap-4 justify-center">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant={action.variant}
                className={
                  action.variant === "default"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    : action.variant === "outline"
                      ? "border-white/30 text-white hover:bg-white/10 bg-transparent"
                      : action.variant === "secondary"
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "text-white hover:bg-white/10"
                }
              >
                <Link href={action.href}>{action.name}</Link>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            <p>&copy; {currentYear} CoinWayFinder. All rights reserved.</p>
            <p className="mt-1">
              Built with ❤️ for the crypto community. Licensed and regulated financial services provider.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm mr-2">Follow us:</span>
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <Link
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h5 className="text-white font-medium mb-2">Security & Compliance</h5>
              <p className="text-gray-400 text-sm">
                Bank-grade security with 256-bit encryption. Fully compliant with global financial regulations.
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">24/7 Support</h5>
              <p className="text-gray-400 text-sm">
                Our dedicated support team is available around the clock to help you succeed.
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">Global Reach</h5>
              <p className="text-gray-400 text-sm">
                Serving traders in 150+ countries with localized support and multi-language platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
