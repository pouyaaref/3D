import Link from 'next/link';
import Viewer from '@/components/viewer/viewer';
import { ArrowUpLeft } from 'lucide-react';
export default function Demo() {
  return (
    <div className="container page viewer-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE QUIET STUDIO / 01</span>
          <h1>یک اتاق، از زاویه‌ای دیگر.</h1>
          <p>دموی سه‌بعدی با هندسه واقعی؛ ساخته‌شده با Three.js.</p>
        </div>
        <Link href="/new" className="button">
          حالا فضای شما <ArrowUpLeft size={18} />
        </Link>
      </div>
      <Viewer />
      <div className="demo-bottom">
        <p>این صحنه طراحی‌شده است و خروجی بازسازی هوش مصنوعی نیست.</p>
        <p className="caption muted">
          چرخش: کشیدن · زوم: اسکرول یا دو انگشت · جابه‌جایی: راست‌کلیک یا دو انگشت · کیبورد: پس از
          کلیک روی صحنه، کلیدهای جهت یا WASD. حرکت آزاد است و شبیه‌سازی برخورد ندارد.
        </p>
      </div>
    </div>
  );
}
