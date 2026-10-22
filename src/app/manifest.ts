import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vista3D استودیوی سه‌بعدی',
    short_name: 'Vista3D',
    description: 'مدیریت محلی ویدیو و مدل‌های سه‌بعدی',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0b1013',
    theme_color: '#0b1013',
    lang: 'fa',
    dir: 'rtl',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
