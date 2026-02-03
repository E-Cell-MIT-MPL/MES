import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.hindustantimes.com',
      },
      {
        protocol: 'https',
        hostname: 'images.indianexpress.com',
      },
      {
        protocol: 'https',
        hostname: 'img.etimg.com',
      },
      {
        protocol: 'https',
        hostname: 'neon.fund',
      },
      {
        protocol: 'https',
        hostname: 'elevatesociety.com',
      },
    ],
  },
};

export default nextConfig;  