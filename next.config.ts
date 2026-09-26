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
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
  // Leaving Prisma unbundled lets the runtime pick the right build via export
  // conditions — the Node build reads its WASM engine off disk with
  // fs.readFileSync, which does not exist on Cloudflare Workers.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
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
