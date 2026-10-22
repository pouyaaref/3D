'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowUpLeft,
  Play,
  ShieldCheck,
  Move3d,
  Video,
  Layers3,
  Box,
  ScanLine,
  Smartphone,
  Building2,
  Armchair,
  MousePointer2,
  Check,
  Plus,
} from 'lucide-react';
import Viewer from '@/components/viewer/viewer';
export default function Home() {
  return (
    <>
      <section className="hero container">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="eyebrow">
            <span className="pulse" /> استودیوی فضایی شما، در مرورگر
          </div>
          <h1>
            به فضاهای شما،
            <br />
            <span>بُعد تازه‌ای بدهید.</span>
          </h1>
          <p>
            از یک ویدیوی ساده شروع کنید.
            <br />
            فضایتان را ثبت کنید، مدل سه‌بعدی وارد کنید و از زاویه‌ای تازه در آن قدم بزنید.
          </p>
          <div className="hero-buttons">
            <Link className="button" href="/new">
              ساخت اولین پروژه <ArrowUpLeft size={19} />
            </Link>
            <Link className="button secondary" href="/demo">
              <Play size={16} /> تجربه دموی سه‌بعدی
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <ShieldCheck size={16} /> فایل‌ها روی دستگاه شما می‌مانند
            </span>
            <span>
              <Check size={15} /> بدون نیاز به ثبت‌نام
            </span>
          </div>
          <div className="engine-note">
            <span /> بازسازی هوش مصنوعی: در انتظار اتصال موتور پردازش
          </div>
        </motion.div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="visual-top">
            <span>
              <span className="pulse" /> LIVE 3D EXPERIENCE
            </span>
            <span>01 / STUDIO</span>
          </div>
          <Viewer hero />
          <div className="visual-bottom">
            <span>
              <Box size={15} /> یک اتاق، بی‌نهایت زاویه
            </span>
            <span dir="ltr">THREE.JS · INTERACTIVE DEMO</span>
          </div>
          <span className="corner c1" />
          <span className="corner c2" />
        </motion.div>
      </section>
      <div className="tech-strip">
        <div className="container">
          <span>ساخته‌شده برای دیدن فراتر</span>
          <span dir="ltr">GAUSSIAN SPLATTING</span>
          <i />
          <span dir="ltr">SUPERSPLAT VIEWER</span>
          <i />
          <span dir="ltr">THREE.JS</span>
          <i />
          <span dir="ltr">LOCAL-FIRST</span>
        </div>
      </div>
      <section className="container section" id="workflow">
        <div className="section-heading">
          <div>
            <span className="eyebrow">از ثبت تا تجربه</span>
            <h2>فضای شما، در سه قدم</h2>
          </div>
          <p>
            ابزارهای ساده برای یک مسیر روشن.
            <br />
            همه‌چیز تحت کنترل شماست.
          </p>
        </div>
        <div className="grid three steps">
          {[
            {
              icon: Video,
              title: 'فضایتان را ثبت کنید',
              text: 'با دوربین گوشی فیلم بگیرید یا ویدیوی آماده را به پروژه اضافه کنید.',
              n: '01',
            },
            {
              icon: Layers3,
              title: 'مدل آماده را وارد کنید',
              text: 'خروجی واقعی Gaussian Splat یا GLB را از دستگاه خود انتخاب کنید.',
              n: '02',
            },
            {
              icon: Move3d,
              title: 'آزادانه کشف کنید',
              text: 'بچرخید، نزدیک شوید و فضا را روی موبایل و دسکتاپ تجربه کنید.',
              n: '03',
            },
          ].map((x) => (
            <article key={x.n} className="step">
              <div className="step-top">
                <x.icon size={26} />
                <span>{x.n}</span>
              </div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
        <div className="notice subtle">
          <ScanLine size={20} />
          <p>
            نسخه فعلی ویدیو را ذخیره و مدل آماده را نمایش می‌دهد. تبدیل خودکار ویدیو به مدل، پس از
            اتصال سرویس پردازش در دسترس خواهد بود.
          </p>
        </div>
      </section>
      <section className="container section use-cases">
        <div className="section-heading">
          <div>
            <span className="eyebrow">یک ابزار، فضاهای بی‌شمار</span>
            <h2>برای فضاهایی که مهم‌اند.</h2>
          </div>
          <Link href="/new" className="text-link">
            فضای خودتان را بسازید <ArrowUpLeft size={18} />
          </Link>
        </div>
        <div className="grid three">
          {[
            {
              Icon: Armchair,
              title: 'خانه و طراحی داخلی',
              text: 'جزئیات، چیدمان و حس یک فضای شخصی.',
              cls: 'interior',
            },
            {
              Icon: Building2,
              title: 'معماری و املاک',
              text: 'زاویه تازه‌ای برای مرور و معرفی محیط.',
              cls: 'architecture',
            },
            {
              Icon: Box,
              title: 'فروشگاه و فضای کار',
              text: 'کشف محیط‌های تجاری، از هر کجا.',
              cls: 'retail',
            },
          ].map((x) => (
            <article key={x.title} className={`use-card ${x.cls}`}>
              <div className="use-art">
                <x.Icon strokeWidth={0.8} />
                <span className="art-grid" />
              </div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container section faq">
        <div>
          <span className="eyebrow">پیش از شروع</span>
          <h2>کمی بیشتر بدانید.</h2>
          <p>پاسخ‌های روشن، بدون وعده‌های دور.</p>
          <Link href="/guide" className="text-link">
            راهنمای کامل <ArrowUpLeft size={17} />
          </Link>
        </div>
        <div>
          {[
            [
              'آیا همین حالا ویدیو به مدل سه‌بعدی تبدیل می‌شود؟',
              'خیر. موتور بازسازی هنوز متصل نیست. اکنون می‌توانید پروژه بسازید، ویدیو را محلی ذخیره کنید و مدل آماده PLY، SOG یا GLB را وارد و مشاهده کنید.',
            ],
            [
              'فایل‌های من کجا ذخیره می‌شوند؟',
              'فقط در IndexedDB مرورگر همین دستگاه. فایل‌ها آپلود نمی‌شوند و بین دستگاه‌ها همگام نیستند. پاک‌کردن داده‌های مرورگر می‌تواند آن‌ها را حذف کند.',
            ],
            [
              'کدام مدل‌ها پشتیبانی می‌شوند؟',
              'PLY مخصوص Gaussian Splat، SOG تک‌فایلی و GLB نسخه ۲ مستقل. PLY مش یا ابرنقاط معمولی، و مدل دارای فایل‌های خارجی پشتیبانی نمی‌شود.',
            ],
            [
              'روی گوشی هم می‌توانم استفاده کنم؟',
              'بله، رابط لمسی و ریسپانسیو است. نمایش مدل نیاز به WebGL2 و حافظه کافی دارد. برای موبایل مدل کم‌حجم انتخاب کنید.',
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container final-cta">
        <div>
          <span className="eyebrow">از همین‌جا شروع کنید</span>
          <h2>هر فضا، داستانی برای کشف دارد.</h2>
          <p>
            <Smartphone size={17} /> با گوشی شما شروع می‌شود. روی دستگاه شما می‌ماند.
          </p>
        </div>
        <Link className="button" href="/new">
          ساخت پروژه جدید <ArrowUpLeft size={18} />
        </Link>
        <MousePointer2 className="cta-decoration" />
      </section>
    </>
  );
}
