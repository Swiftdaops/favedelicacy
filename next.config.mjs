/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    // During local development, proxy /api requests to the deployed backend
    // to avoid CORS issues when the backend only allows the production origin.
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://favedelicacybackend.onrender.com/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
