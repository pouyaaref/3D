'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Armchair,
  House,
  Store,
  Building2,
  Landmark,
  Route,
  Shapes,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import { environments, errorMessage, type Environment } from '@/lib/types';
const icons = {
  room: Armchair,
  home: House,
  shop: Store,
  office: Building2,
  building: Landmark,
  street: Route,
  other: Shapes,
};
export default function NewProject() {
  const [environment, setEnvironment] = useState<Environment>('room');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <div className="container page narrow">
      <Link className="text-link" href="/dashboard">
        پروژه‌های من / پروژه جدید
      </Link>
      <div className="form-intro">
        <span className="eyebrow">یک فضای تازه</span>
        <h1>چه فضایی را ثبت می‌کنید؟</h1>
        <p>نوع محیط را انتخاب کنید؛ بقیه مسیر را با هم پیش می‌بریم.</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const p = await repository.create(name, environment);
            toast.success('پروژه ساخته شد.');
            router.push(`/projects/${p.id}`);
          } catch (e) {
            toast.error(errorMessage(e));
            setBusy(false);
          }
        }}
      >
        <fieldset>
          <legend>۱. نوع محیط</legend>
          <div className="environment-grid">
            {Object.entries(environments).map(([key, label]) => {
              const Icon = icons[key as Environment];
              return (
                <label key={key} className={`environment ${key === environment ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="environment"
                    value={key}
                    checked={key === environment}
                    onChange={() => setEnvironment(key as Environment)}
                  />
                  <Icon size={26} />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="panel">
          <label className="field-label" htmlFor="project-name">
            ۲. یک نام برای پروژه انتخاب کنید
          </label>
          <input
            id="project-name"
            placeholder="مثلاً: استودیوی طبقه دوم"
            required
            minLength={1}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="caption muted">می‌توانید نام پروژه را بعداً تغییر دهید.</p>
        </div>
        <div className="form-footer">
          <span>
            <ShieldCheck size={17} /> ذخیره امن روی همین دستگاه
          </span>
          <button className="button" disabled={busy || !name.trim()}>
            {busy ? 'در حال ساخت…' : 'ساخت پروژه و افزودن فایل'}
            <ArrowLeft size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
