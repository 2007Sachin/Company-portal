/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pulse/shared-types', '@pulse/shared-utils', '@pulse/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3001/auth/:path*',
      },
      {
        source: '/api/candidates/:path*',
        destination: 'http://localhost:3002/candidates/:path*',
      },
      {
        source: '/api/pipeline/:path*',
        destination: 'http://localhost:3003/pipeline/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/recruiter/login',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
