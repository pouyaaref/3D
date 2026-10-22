'use client';
import { useEffect, useState } from 'react';
import { HardDrive, ShieldCheck, Trash2, Check, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePreferences } from './providers';
import { bytes, errorMessage, defaultPreferences } from '@/lib/types';
import { download, repository } from '@/lib/repository';
import Confirm from './ui/confirm';
export default function Settings() {
  const { preferences, update } = usePreferences();
  const [storage, setStorage] = useState<{ usage?: number; quota?: number; persistent?: boolean }>(
    {},
  );
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const refresh = async () => {
    if (navigator.storage?.estimate) {
      const s = await navigator.storage.estimate();
      const persistent = await navigator.storage.persisted?.();
      setStorage({ ...s, persistent });
    }
    setCanPersist(!!navigator.storage?.persist);
  };
  useEffect(() => {
    refresh().catch(() => toast.error('خواندن فضای ذخیره‌سازی ممکن نشد.'));
  }, []);
  return (
    <div className="container page narrow">
      <span className="eyebrow">MAKE IT YOURS</span>
      <h1>فضای کاری، به سلیقه شما.</h1>
      <p className="lead">نمایش، عملکرد و داده‌های محلی را مدیریت کنید.</p>
      <section className="panel settings-panel">
        <h2>ظاهر و تجربه</h2>
        <div className="setting-row">
          <div>
            <h3>پوسته برنامه</h3>
            <p>تاریک برای تمرکز، روشن برای روز.</p>
          </div>
          <select
            aria-label="پوسته برنامه"
            value={preferences.theme}
            onChange={(e) => update({ ...preferences, theme: e.target.value as 'dark' | 'light' })}
          >
            <option value="dark">تاریک</option>
            <option value="light">روشن</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <h3>کاهش حرکت</h3>
            <p>انیمیشن‌های تزئینی را کم کنید.</p>
          </div>
          <input
            type="checkbox"
            aria-label="کاهش حرکت"
            checked={preferences.reducedMotion}
            onChange={(e) => {
              document.documentElement.dataset.motion = e.target.checked ? 'reduced' : 'full';
              void update({ ...preferences, reducedMotion: e.target.checked });
            }}
          />
        </div>
        <div className="setting-row">
          <div>
            <h3>کیفیت نمایشگر</h3>
            <p>حالت سبک، مناسب گوشی و مدل‌های بزرگ‌تر.</p>
          </div>
          <select
            aria-label="کیفیت نمایشگر"
            value={preferences.quality}
            onChange={(e) =>
              update({ ...preferences, quality: e.target.value as 'balanced' | 'performance' })
            }
          >
            <option value="balanced">متعادل</option>
            <option value="performance">سبک</option>
          </select>
        </div>
      </section>
      <section className="panel settings-panel">
        <h2>
          <HardDrive size={22} /> فضای ذخیره‌سازی
        </h2>
        <div className="storage-numbers">
          <div>
            <span>مصرف کل این مبدأ</span>
            <strong dir="ltr">
              {storage.usage !== undefined ? bytes(storage.usage) : 'نامشخص'}
            </strong>
          </div>
          <div>
            <span>سهمیه تقریبی مرورگر</span>
            <strong dir="ltr">{storage.quota ? bytes(storage.quota) : 'نامشخص'}</strong>
          </div>
        </div>
        <progress
          aria-label="فضای استفاده‌شده"
          value={storage.usage ?? 0}
          max={storage.quota || 1}
        />
        <p className="caption muted">
          اعداد تخمینی و شامل داده‌های سایت هستند. سهمیه به مرورگر و دستگاه بستگی دارد.
        </p>
        <div className="actions">
          <button
            disabled={!canPersist || storage.persistent}
            className="button secondary small"
            onClick={async () => {
              try {
                const ok = await navigator.storage.persist();
                await refresh();
                toast[ok ? 'success' : 'info'](
                  ok
                    ? 'نگهداری پایدار توسط مرورگر پذیرفته شد.'
                    : 'مرورگر درخواست نگهداری پایدار را نپذیرفت. نسخه پشتیبان نگه دارید.',
                );
              } catch (e) {
                toast.error(errorMessage(e));
              }
            }}
          >
            <ShieldCheck size={16} />
            {storage.persistent
              ? 'نگهداری پایدار فعال'
              : canPersist
                ? 'درخواست نگهداری پایدار'
                : 'نگهداری پایدار پشتیبانی نمی‌شود'}
          </button>
          <button
            className="button secondary small"
            onClick={() => refresh().catch((e) => toast.error(errorMessage(e)))}
          >
            به‌روزرسانی آمار
          </button>
        </div>
      </section>
      <section className="panel settings-panel">
        <h2>خروجی و مدیریت داده</h2>
        <p>
          خروجی JSON فقط شامل اطلاعات پروژه‌هاست. فایل‌های رسانه را از صفحه هر پروژه جداگانه دانلود
          کنید.
        </p>
        <div className="actions">
          <button
            className="button secondary"
            onClick={async () => {
              try {
                const projects = await repository.list();
                download(
                  new Blob(
                    [
                      JSON.stringify(
                        {
                          version: 1,
                          exportedAt: new Date().toISOString(),
                          projects: projects.map((p) => ({ ...p, thumbnail: undefined })),
                          note: 'Metadata only; media must be downloaded separately.',
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: 'application/json' },
                  ),
                  'vista3d-projects.json',
                );
                toast.success('اطلاعات پروژه‌ها دانلود شد.');
              } catch (e) {
                toast.error(errorMessage(e));
              }
            }}
          >
            <Download size={17} />
            خروجی تمام اطلاعات
          </button>
          <button className="button secondary danger-text" onClick={() => setConfirm(true)}>
            <Trash2 size={17} />
            پاک‌سازی داده‌های محلی
          </button>
        </div>
      </section>
      <div className="notice">
        <Check size={19} />
        <p>
          حالت مهمان فعال است. فایل‌ها آپلود نمی‌شوند.{' '}
          <Link href="/privacy">جزئیات حریم خصوصی و نسخه پشتیبان</Link>
        </p>
      </div>
      <Confirm
        open={confirm}
        title="تمام داده‌های محلی پاک شوند؟"
        description="تمام پروژه‌ها، ویدیوها، مدل‌ها و تنظیمات Vista3D در این مرورگر حذف می‌شوند. این کار قابل بازگشت نیست."
        busy={busy}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await repository.clear();
            await update(defaultPreferences);
            await refresh();
            setConfirm(false);
            toast.success('داده‌های محلی پاک شدند.');
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
