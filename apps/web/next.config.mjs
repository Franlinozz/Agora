import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@agora/shared', '@agora/chains', '@agora/sdk', '@agora/ui'],
  images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      '@rainbow-me/rainbowkit': path.resolve('./node_modules/@rainbow-me/rainbowkit'),
      '@tanstack/react-query': path.resolve('./node_modules/@tanstack/react-query'),
      viem: path.resolve('./node_modules/viem'),
      wagmi: path.resolve('./node_modules/wagmi'),
    };
    return config;
  },
};

export default nextConfig;
