// components/navigation.tsx
"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <nav className="p-4 bg-gray-900 text-white flex gap-6">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/analysis">Analysis</Link>
      <Link href="/signals">Signals</Link>
      <Link href="/bots">Bots</Link>
    </nav>
  );
}
