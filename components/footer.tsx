import Link from "next/link";
import { TrendingUp, MessageSquare, Mail } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "/signals", label: "Signals" },
        { href: "/bots", label: "Trading Bots" },
        { href: "/pricing", label: "Pricing" },
        { href: "/dashboard", label: "Dashboard" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/about", label: "About Us" },
        { href: "/legal/terms", label: "Terms of Use" },
        { href: "/legal/privacy", label: "Privacy Policy" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/legal/disclaimer", label: "Risk Disclaimer" },
        { href: "mailto:support@coinwayfinder.com", label: "Contact Support" },
        { href: "https://t.me/andis_fx_signals_bot", label: "Telegram Bot" },
      ],
    },
    {
      title: "Languages",
      links: [
        { href: "/en", label: "English" },
        { href: "/ru", label: "Русский" },
        { href: "/es", label: "Español" },
        { href: "/pt", label: "Português" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#191A1E]" />
              </div>
              <span className="text-xl font-bold text-white">
                CoinWayfinder
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered crypto trading assistant delivering smart signals and
              automated bots.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://t.me/andis_fx_signals_bot"
                className="text-gray-400 hover:text-[#30D5C8]"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:support@coinwayfinder.com"
                className="text-gray-400 hover:text-[#30D5C8]"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#30D5C8] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CoinWayfinder. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              ⚠️ Crypto trading involves risk. Please read our risk disclaimer.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
