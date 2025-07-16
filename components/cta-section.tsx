// File: components/cta-section.tsx

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white py-16">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold mb-4">
          Ready to take your crypto analytics to the next level?
        </h2>
        <p className="text-lg mb-8">
          Sign up today and get full access to AI-driven market insights, advanced charting tools,
          and automated trading strategies.
        </p>
        <Link href="/pricing" passHref>
          <Button className="bg-white text-[#191A1E] font-semibold px-8 py-3 text-lg hover:opacity-90 transition">
            Start Your Free Trial
          </Button>
        </Link>
      </div>
    </section>
  )
}
