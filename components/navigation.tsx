'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">CoinWayfinder</Link>
        <div className="flex gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/bots">Bots</Link>
        </div>
      </div>
    </nav>
  )
}
