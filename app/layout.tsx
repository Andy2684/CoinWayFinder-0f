import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ClientLayout from "./ClientLayout"
import { getNonce } from "@/lib/security"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinWayFinder - Advanced Crypto Trading Platform",
  description:
    "Professional cryptocurrency trading platform with AI-powered bots, real-time market data, and advanced analytics.",
  keywords: "cryptocurrency, trading, bitcoin, ethereum, crypto bot, trading signals, market analysis",
  authors: [{ name: "CoinWayFinder Team" }],
  creator: "CoinWayFinder",
  publisher: "CoinWayFinder",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://coinwayfinder.com",
    title: "CoinWayFinder - Advanced Crypto Trading Platform",
    description:
      "Professional cryptocurrency trading platform with AI-powered bots, real-time market data, and advanced analytics.",
    siteName: "CoinWayFinder",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinWayFinder - Advanced Crypto Trading Platform",
    description:
      "Professional cryptocurrency trading platform with AI-powered bots, real-time market data, and advanced analytics.",
    creator: "@coinwayfinder",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = await getNonce()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://api.coinbase.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>

        {/* Security monitoring script */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              // Security monitoring
              (function() {
                // Monitor for XSS attempts
                const originalWrite = document.write;
                document.write = function(content) {
                  console.warn('Blocked document.write attempt:', content);
                  return false;
                };
                
                // Monitor for eval attempts
                const originalEval = window.eval;
                window.eval = function(code) {
                  console.warn('Blocked eval attempt:', code);
                  throw new Error('eval is disabled for security');
                };
                
                // Report CSP violations
                document.addEventListener('securitypolicyviolation', function(e) {
                  console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
                  // In production, send to monitoring service
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
