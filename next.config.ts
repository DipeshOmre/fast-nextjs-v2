import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns: [{protocol: "https",hostname: "ik.imagekit.io"}]
  },
  webpack: (config, { isServer }) => {
    // Exclude firebase-admin from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
      };
    }
    
    // Handle Firebase modules properly
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase/app': 'firebase/app',
      'firebase/auth': 'firebase/auth',
      'firebase/firestore': 'firebase/firestore',
      'firebase/analytics': 'firebase/analytics',
    };
    
    return config;
  },
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
