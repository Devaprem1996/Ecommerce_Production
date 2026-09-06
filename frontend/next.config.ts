import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/:path*`,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Enable polling watch options in development mode to fix file watching issues
    // on Windows (especially within OneDrive/Desktop/WSL/Docker paths)
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every 1 second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: /node_modules/, // Ignore node_modules to keep performance high
      };
    }
    return config;
  },
};

export default nextConfig;
