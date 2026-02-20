/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },

  // Add the experimental proxy configuration to replace the deprecated middleware
  experimental: {
    proxy: true, // "middleware" 대신 "proxy" 사용
  },
};

module.exports = nextConfig;
