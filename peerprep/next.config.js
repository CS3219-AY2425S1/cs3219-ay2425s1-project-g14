/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/proxy", // client connects to api/proxy
        // by default we expect NEXT_PUBLIC_COLLAB to be http://collab:4000.
        // double check this before using this.
        destination: `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_COLLAB}/ws`,
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
