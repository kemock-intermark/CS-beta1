/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
    WEBAPP_BASE_URL: process.env.WEBAPP_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
