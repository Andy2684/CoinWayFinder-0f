"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  CheckCircle,
  Globe,
  Shield,
  Award,
  MessageCircle,
  Download,
} from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
    setEmail("")
  }

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Trading Bots", href: "/bots", icon: Bot },
        { name: "AI Analytics", href: "/analytics", icon: null },
        { name: "Portfolio Management", href: "/portfolio", icon: null },
        { name: "Market Signals", href: "/signals", icon: null },
        { name: "Copy Trading", href: "/copy-trading", icon: null },
        { name: "Mobile App", href: "/mobile", icon: Download }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs", icon: null },
        { name: "API Reference", href: "/api", icon: null },
        { name: "Trading Academy", href: "/academy", icon: null },
        { name: "Market Analysis", href: "/analysis", icon: null },
        { name: "Blog", href: "/blog", icon: null },
        { name: "Help Center", href: "/help", icon: null }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about", icon: null },
        { name: "Careers", href: "/careers", icon: null },
        { name: "Press Kit", href: "/press", icon: null },
        { name: "Partners", href: "/partners", icon: null },
        { name: "Affiliates", href: "/affiliates", icon: null },
        { name: "Contact", href: "/contact", icon: null }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", href: "/terms", icon: null },
        { name: "Privacy Policy", href: "/privacy", icon: null },
        { name: "Cookie Policy", href: "/cookies", icon: null },
        { name: "Risk Disclosure", href: "/risk", icon: null },
        { name: "Compliance", href: "/compliance", icon: Shield },
        { name: "Security", href: "/security", icon: null }
      ]
    }
  ]

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/coinwayfinder", icon: Twitter },
    { name: "Facebook", href: "https://facebook.com/coinwayfinder", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com/coinwayfinder", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/coinwayfinder", icon: Linkedin },
    { name: "YouTube", href: "https://youtube.com/coinwayfinder", icon: Youtube },
    { name: "GitHub", href: "https://github.com/coinwayfinder", icon: Github }
  ]

  const contactInfo = [
    { icon: Mail, label: "Email", value: "support@coinwayfinder.com", href: "mailto:support@coinwayfinder.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, label: "Address", value: "123 Trading St, Crypto City, CC 12345", href: null },
    { icon: MessageCircle, label: "Live Chat", value: "Available 24/7", href: "/chat" }
  ]

  const certifications = [
    { name: "SOC 2 Certified", icon: Shield },
    { name: "ISO 27001", icon: Award },
    { name: "PCI DSS", icon: Shield },
    { name: "GDPR Compliant", icon: Globe }
  ]

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Bot className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">CoinWayFinder</span>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              The world's most advanced AI-powered crypto trading platform. Join thousands of traders maximizing their profits with our intelligent algorithms.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                  required
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Get market insights, trading tips, and platform updates.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon
                const content = (
                  <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">{contact.label}</div>
                      <div className="text-sm">{contact.value}</div>
                    </div>
                  </div>
                )

                return contact.href ? (
                  <Link key={index} href={contact.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={index}>{content}</div>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h4 className="text-white font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => {
                  const Icon = link.icon
                  return (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors flex items-\
