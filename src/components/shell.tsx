'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  ArrowUpLeft,
  LayoutGrid,
  BookOpen,
  Settings2,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { usePreferences } from './providers';
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { preferences, update } = usePreferences();
  return (
    <>
      <a className="skip" href="#main">
        رفتن به محتوا
      </a>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="brand" aria-label="Vista3D خانه">
            <span className="brand-icon">
              <Box size={25} />
            </span>
            <span dir="ltr">
              vista<span>3D</span>
              <small>SPACES, REIMAGINED</small>
            </span>
          </Link>
          <nav aria-label="ناوبری اصلی">
            {([
              ['/dashboard', 'پروژه‌های من', LayoutGrid],
              ['/guide', 'راهنمای ضبط', BookOpen],
              ['/settings', 'تنظیمات', Settings2],
            ] as const).map(([href, label, Icon]) => (
              <Link
                key={href}
                className={path.startsWith(href) ? 'active' : ''}
                href={href}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="icon-button theme"
              aria-label="تغییر پوسته"
              onClick={() =>
                update({ ...preferences, theme: preferences.theme === 'dark' ? 'light' : 'dark' })
              }
            >
              {preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/new" className="button small">
              پروژه جدید <ArrowUpLeft size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="footer container">
        <Link href="/" className="brand" dir="ltr">
          <Box size={20} /> vista3D
        </Link>
        <p>فضاهای واقعی. تجربه‌ای تازه.</p>
        <Link href="/privacy">
          <ShieldCheck size={15} /> حریم خصوصی و داده‌ها
        </Link>
        <span className="local-dot">حالت محلی · بدون حساب کاربری</span>
      </footer>
    </>
  );
}
