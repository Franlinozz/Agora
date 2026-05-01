/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agora/shared', '@agora/chains', '@agora/sdk', '@agora/ui'],
  images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

export default nextConfig;
