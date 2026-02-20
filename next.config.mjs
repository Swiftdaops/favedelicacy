/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    // Proxy /api requests to the deployed backend. Use NEXT_PUBLIC_API_URL
    // when provided; otherwise fall back to the known Render backend URL.
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://favedelicacybackend.onrender.com').replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
