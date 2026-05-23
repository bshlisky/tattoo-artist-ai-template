/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["replicate"],
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
};

module.exports = nextConfig;