/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify compatibility
  output: 'standalone',
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Optimize builds
  swcMinify: true,
  
  // Image optimization for Netlify
  images: {
    unoptimized: false,
  },
};

module.exports = nextConfig;
