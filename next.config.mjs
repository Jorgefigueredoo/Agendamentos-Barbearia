/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ✅ remove completamente o ícone "N" (Dev Indicator)
  devIndicators: false,
};

export default nextConfig;
