/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  },
  // CSS optimization
  experimental: {
    optimizeCss: true,
  },
  // Turbopack configuration (updated from deprecated turbo)
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/postcss'],
        as: '*.css',
      },
    },
  },
  // Build optimization for Vercel
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  // Ensure proper transpilation of CSS dependencies
  transpilePackages: ['@tailwindcss/postcss'],
  // Additional optimization for CSS and bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable ESLint during build for Vercel deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig