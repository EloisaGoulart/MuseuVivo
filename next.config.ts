import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita o React Compiler
  reactCompiler: true,
  
  // Configuração de imagens para APIs externas
  images: {
    unoptimized: true, // Desabilita otimização para permitir imagens externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.artic.edu',
      },
      {
        protocol: 'https',
        hostname: 'images.metmuseum.org',
      },
    ],
  },
  
  // Desabilita static export para usar Server Components
  output: undefined,
};

export default nextConfig;
