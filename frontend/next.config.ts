import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpack = require('webpack');

const nextConfig: NextConfig = {
  // Fix workspace root detection warning
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  typescript: {
    // Temporarily ignore build errors due to @ethereumjs/tx issue in dependencies
    ignoreBuildErrors: true,
  },
  // Disable Turbopack due to Buffer polyfill issues with @avail-project/nexus
  // Re-enable when Turbopack supports ProvidePlugin equivalent
  // turbopack: {
  //   resolveAlias: {
  //     buffer: 'buffer/',
  //   },
  // },
  // Webpack fallback for compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill Buffer for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        '@react-native-async-storage/async-storage': false,
      };

      // Provide Buffer globally
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }

    // Ignore specific modules that aren't needed in web environment
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
};

export default nextConfig;
