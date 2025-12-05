import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configuración para Prisma en Vercel
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
