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
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thumb.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const backendBase = (
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:8080"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || `${backendBase}/api/v1`}/:path*`,
      },
      {
        source: "/api/create-order",
        destination: `${backendBase}/api/create-order`,
      },
      {
        source: "/api/verify-payment",
        destination: `${backendBase}/api/verify-payment`,
      },
      {
        source: "/api/order-status/:path*",
        destination: `${backendBase}/api/order-status/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
              "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com http://localhost:* ws://localhost:* https://*.vercel.app https://*.fly.dev",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.wikimedia.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
            ].join("; "),
          },
        ],
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
