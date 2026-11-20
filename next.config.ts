import type { NextConfig } from 'next'
import { withVercelToolbar } from '@vercel/toolbar/plugins/next'

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  async redirects() {
    return [{ source: "/", destination: "/planner", permanent: false }];
  },
}

export default withVercelToolbar()(nextConfig)
