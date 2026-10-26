/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double invocation of heavy canvas computations during dev
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
