import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["deck.gl", "@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox", "@deck.gl/mesh-layers"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eleven-public-cdn.elevenlabs.io",
      },
    ],
  },
};

export default nextConfig;
