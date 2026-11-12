/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Batas upload bukti pembayaran 2 MB (default Server Actions hanya 1 MB)
    serverActions: { bodySizeLimit: '3mb' },
  },
};

module.exports = nextConfig;
