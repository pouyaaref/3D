'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page empty">
      <span className="eyebrow">خطای برنامه</span>
      <h1>این بخش باز نشد.</h1>
      <p>دوباره تلاش کنید. داده‌های مرورگر شما پاک نشده‌اند.</p>
      <button className="button" onClick={reset}>
        تلاش دوباره
      </button>
      <Link href="/dashboard" className="button secondary">
        پروژه‌های من
      </Link>
    </div>
  );
}
