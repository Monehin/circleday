import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  
  // Cache Components disabled for now due to client-heavy dashboard architecture
  // The "use cache" directive still works on server actions/components
  // cacheComponents: true,
  
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

