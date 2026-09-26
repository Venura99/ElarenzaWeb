import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Image uploads (customer feedback photos, admin product photos) go
      // through server actions, whose default body cap is 1MB — too small
      // even for a compressed phone photo.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
