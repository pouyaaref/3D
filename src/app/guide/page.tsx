import Link from 'next/link';
import { Move, Sun, ScanLine, PersonStanding, Layers, Video, ArrowUpLeft } from 'lucide-react';
const tips = [
  {
    Icon: Move,
    title: 'آرام و پیوسته حرکت کنید',
    text: 'با قدم‌های کوتاه و سرعت یکنواخت حرکت کنید. چرخش ناگهانی و لرزش زیاد باعث تاری فریم‌ها می‌شود.',
  },
  {
    Icon: ScanLine,
    title: 'از چند زاویه ببینید',
    text: 'دور اشیای اصلی حرکت کنید؛ فقط در یک نقطه نایستید و دوربین را نچرخانید. بالا و پایین محیط را هم پوشش دهید.',
  },
  {
    Icon: Sun,
    title: 'نور یکنواخت انتخاب کنید',
    text: 'نور روزِ غیرمستقیم مناسب است. از محیط تاریک، نور چشمک‌زن، آینه و سطوح بسیار براق دوری کنید.',
  },
  {
    Icon: PersonStanding,
    title: 'فضا را ثابت نگه دارید',
    text: 'در صورت امکان افراد، حیوانات و اجسام متحرک را از قاب خارج کنید. هنگام ضبط چیدمان را تغییر ندهید.',
  },
  {
    Icon: Layers,
    title: 'قاب‌ها هم‌پوشانی داشته باشند',
    text: 'بخش زیادی از قاب قبلی را در قاب بعدی نگه دارید. مسیرهای متصل ضبط کنید تا ارتباط قسمت‌های محیط حفظ شود.',
  },
  {
    Icon: Video,
    title: 'کوتاه، واضح و کامل ضبط کنید',
    text: 'لنز را تمیز کنید، از دوربین اصلی استفاده کنید و زوم دیجیتال را تغییر ندهید. در این نسخه حداکثر ۵ دقیقه و ۵۰۰ مگابایت پذیرفته می‌شود.',
  },
];
export default function Guide() {
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CAPTURE GUIDE / راهنمای ثبت فضا</span>
          <h1>یک ثبت خوب، یک شروع بهتر.</h1>
          <p>چند عادت ساده برای ویدیویی مناسب بازسازی سه‌بعدی آینده.</p>
        </div>
        <Link href="/new" className="button">
          آماده‌ام، شروع کنیم <ArrowUpLeft size={18} />
        </Link>
      </div>
      <div className="guide-hero panel">
        <div className="capture-diagram" aria-label="مسیر حرکت دوربین به دور سوژه">
          <div className="orbit-path">
            <span className="orbit-camera">
              <Video size={24} />
            </span>
          </div>
          <div className="diagram-room">
            <ScanLine size={62} strokeWidth={1} />
          </div>
          <span className="diagram-label">مسیر پیوسته + زاویه‌های متنوع</span>
        </div>
        <div>
          <span className="eyebrow">همه‌چیز به دیدن درست برمی‌گردد</span>
          <h2>
            دور محیط حرکت کنید.
            <br />
            هر بار، کمی زاویه تازه.
          </h2>
          <p>
            از گوشه‌ای روشن شروع کنید، مسیر را آرام ادامه دهید و در پایان به محدوده شروع برگردید.
            روی هر بخش چند لحظه مکث کنید؛ بدون ایست طولانی یا چرخش تند.
          </p>
          <span className="badge inline">گوشی افقی یا عمودی؛ جهت را در میانه ضبط عوض نکنید</span>
        </div>
      </div>
      <div className="grid three guide-tips">
        {tips.map((t, i) => (
          <article className="panel" key={t.title}>
            <div className="step-top">
              <t.Icon size={25} />
              <span>0{i + 1}</span>
            </div>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </article>
        ))}
      </div>
      <div className="notice">
        ویدیوی خوب تضمین‌کننده بازسازی نیست. موتور AI در نسخه فعلی متصل نیست؛ می‌توانید ویدیو را
        ذخیره و مدل آماده را وارد کنید. دوربین مرورگر فقط روی HTTPS یا localhost و در مرورگرهای
        سازگار کار می‌کند.
      </div>
    </div>
  );
}
