import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["deck.gl", "@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox", "@deck.gl/mesh-layers"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "eleven-public-cdn.elevenlabs.io" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
