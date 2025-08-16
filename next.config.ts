import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  
  // Configuración de imágenes
  images: {
    domains: ['bwcbtafocttjdwvhuryb.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuración experimental para mejor rendimiento
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
