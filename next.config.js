/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Updated images configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/aildev/**", // ✅ Updated cloud name
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },

  // Enhanced Webpack configuration
  webpack(config, { dev, isServer }) {
    // ✅ Webpack correctly formatted without `const`
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: "vendor",
          chunks: "all",
          test: /node_modules/,
          priority: 20,
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    };

    // ✅ Add file loader for PDFs
    config.module.rules.push({
      test: /\.pdf$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            publicPath: "/_next/static/files",
            outputPath: "static/files",
          },
        },
      ],
    });

    // ✅ Optimize for production
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },

  // Environment configuration
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "aildev",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  // Additional optimizations
  experimental: {
    optimizeFonts: true,
    optimizeImages: true,
    scrollRestoration: true,
  },

  // Increase build output details
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Enable progressive web app features
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
  },

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Handle redirects if needed
  async redirects() {
    return [];
  },

  // Handle headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
