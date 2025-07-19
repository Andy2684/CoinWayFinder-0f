'use client'

import React from 'react'

export function SignalFeed() {
  const signals: unknown[] = []

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Signal Feed</h2>
      <ul>
        {signals.map((_, idx) => (
          <li key={idx}>Signal #{idx + 1}</li>
        ))}
      </ul>
    </div>
  )
}
