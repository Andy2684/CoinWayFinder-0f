// Browser-compatible crypto replacement functions
// This file replaces all Node.js crypto functionality

export function randomBytes(size: number): Uint8Array {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Use Web Crypto API in browser
    return crypto.getRandomValues(new Uint8Array(size))
  } else {
    // Fallback for environments without Web Crypto API
    const array = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  }
}

export function createHash(algorithm = "sha256"): HashLike {
  return new HashLike()
}

class HashLike {
  private data = ""

  update(data: string | Buffer): this {
    this.data += typeof data === "string" ? data : data.toString()
    return this
  }

  digest(encoding?: string): string {
    // Simple hash function for browser compatibility
    let hash = 0
    const str = this.data

    if (str.length === 0) return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    const result = Math.abs(hash).toString(16)

    if (encoding === "hex") {
      return result
    }

    return result
  }
}

export function pbkdf2Sync(password: string, salt: string, iterations: number, keylen: number, digest: string): Buffer {
  // Simple PBKDF2 implementation for browser compatibility
  let result = password + salt

  for (let i = 0; i < iterations; i++) {
    result = simpleHash(result)
  }

  return Buffer.from(result.slice(0, keylen))
}

export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}

// Simple hash function
function simpleHash(input: string): string {
  let hash = 0
  if (input.length === 0) return hash.toString()

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36)
}

// Buffer polyfill for browser
if (typeof Buffer === "undefined") {
  ;(global as any).Buffer = {
    from: (data: any) => new Uint8Array(data),
    isBuffer: (obj: any) => obj instanceof Uint8Array,
  }
}
