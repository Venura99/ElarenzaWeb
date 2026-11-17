import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next's own optimizer needs Cloudflare's Images binding, which this
    // Worker does not have — without it `/_next/image` handed back every
    // source file at full size whatever width was requested. The custom
    // loader pushes resizing to Cloudinary (which already hosts the product
    // photos) and to pre-built WebP for the images we ship ourselves, so that
    // endpoint is bypassed entirely.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
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
