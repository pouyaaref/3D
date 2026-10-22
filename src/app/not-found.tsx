import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container page empty">
      <span className="eyebrow">۴۰۴ / خارج از قاب</span>
      <h1>این فضا پیدا نشد.</h1>
      <p>شاید آدرس اشتباه باشد؛ یک فضای تازه کشف کنید.</p>
      <Link className="button" href="/">
        بازگشت به خانه
      </Link>
    </div>
  );
}
