/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitamos ESLint durante el build para CI/CD
  eslint: {
    ignoreDuringBuilds: true,
  },
  
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
    optimizeCss: false,
  },
};

module.exports = nextConfig;
