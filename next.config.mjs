/** @type {import('next').NextConfig} */
const nextConfig = {
  // Разрешённые внешние зависимости для serverless-среды
  serverExternalPackages: ['nodemailer', 'bcryptjs', 'jsonwebtoken'],

  // Webpack fallback'и для клиентской сборки
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // Настройки изображений
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },

  // Отключить падение сборки из-за ошибок линтера
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Отключить падение сборки из-за ошибок TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Глобальные переменные окружения
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },
};

export default nextConfig;
