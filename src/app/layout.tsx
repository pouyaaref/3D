import type { Metadata, Viewport } from 'next';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import './globals.css';
import Providers from '@/components/providers';
import Shell from '@/components/shell';
export const metadata: Metadata = {
  title: { default: 'Vista3D | بُعد تازه‌ای برای فضاهای شما', template: '%s | Vista3D' },
  description: 'استودیوی محلی برای مدیریت ویدیوی فضاها و مشاهده مدل‌های Gaussian Splat و GLB.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1013' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
