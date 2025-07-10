/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponents: true, // Enable server components experimental feature
    serverComponentsExternalPackages: ['@sentry/nextjs'] // Specify external packages used with server components
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'], // Whitelist domains for images
    loader: 'imgix', // Image loader (optional, adjust as per your needs)
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY // Access environment variables
  },
  async headers() {
    return [
      {
        source: '/api/:path*', // API route path
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript build errors
  },
};

export default nextConfig;
