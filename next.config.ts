import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Comodin: cubre cualquier IP de la red local 192.168.1.x, para que
  // no se rompa el acceso desde el celular si la PC cambia de IP.
  allowedDevOrigins: ["192.168.1.*", "192.168.1.41", "192.168.1.38"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
