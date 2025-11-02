import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  
  // Disable typedRoutes during development while routes are being built
  typedRoutes: false,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
}

export default config

