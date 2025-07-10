/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_51Rj1tARG8pNq5FjpZxVCMfptuZ1SLQo3PsmtmtPs4LwdBv3KlBBD24FHJfKnnarcKBDRl7LTcjdTBKMtYKp6JDbU00gnNTd0Bq',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rj1tARG8pNq5FjpZxVCMfptuZ1SLQo3PsmtmtPs4LwdBv3KlBBD24FHJfKnnarcKBDRl7LTcjdTBKMtYKp6JDbU00gnNTd0Bq',
  },
}

export default nextConfig
