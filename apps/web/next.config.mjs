/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV !== 'production';
const authServiceUrl = process.env.AUTH_SERVICE_URL || (isDevelopment ? 'http://localhost:3001' : 'http://auth-service:3001');
const candidateServiceUrl = process.env.CANDIDATE_SERVICE_URL || (isDevelopment ? 'http://localhost:3002' : 'http://candidate-service:3002');
const pipelineServiceUrl = process.env.PIPELINE_SERVICE_URL || (isDevelopment ? 'http://localhost:3003' : 'http://pipeline-service:3003');
const copilotServiceUrl = process.env.COPILOT_SERVICE_URL || (isDevelopment ? 'http://localhost:3005' : 'http://copilot-service:3005');
const jdParserUrl = process.env.JD_PARSER_URL || (isDevelopment ? 'http://localhost:8000' : 'http://jd-parser:8000');

const nextConfig = {
  output: 'standalone',
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
        destination: `${authServiceUrl}/auth/:path*`,
      },
      {
        source: '/api/candidates/:path*',
        destination: `${candidateServiceUrl}/candidates/:path*`,
      },
      {
        source: '/api/pipeline/:path*',
        destination: `${pipelineServiceUrl}/pipeline/:path*`,
      },
      {
        source: '/api/copilot/:path*',
        destination: `${copilotServiceUrl}/copilot/:path*`,
      },
      {
        source: '/api/jd/:path*',
        destination: `${jdParserUrl}/:path*`,
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
      {
        source: '/recruiter/pipeline',
        destination: '/recruiter/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
