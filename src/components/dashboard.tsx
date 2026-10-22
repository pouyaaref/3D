'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Box,
  Pencil,
  Trash2,
  ArrowUpLeft,
  HardDrive,
  Film,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import { environments, statusLabels, bytes, errorMessage, type Project } from '@/lib/types';
import Confirm from './ui/confirm';
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('new');
  const [removing, setRemoving] = useState<Project | null>(null);
  const [renaming, setRenaming] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setProjects(await repository.list());
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const shown = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        (filter === 'all' || p.environment === filter),
    )
    .sort((a, b) => (sort === 'new' ? -1 : 1) * a.updatedAt.localeCompare(b.updatedAt));
  return (
    <div className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / فضای شخصی</span>
          <h1>
            پروژه‌های من<span className="count">{projects.length.toLocaleString('fa')}</span>
          </h1>
          <p>فضاهایی که ثبت کرده‌اید، همیشه نزدیک شما.</p>
        </div>
        <Link className="button" href="/new">
          <Plus size={19} /> پروژه جدید
        </Link>
      </div>
      <div className="stats">
        <div>
          <Box />
          <span>
            کل پروژه‌ها<strong>{projects.length.toLocaleString('fa')}</strong>
          </span>
        </div>
        <div>
          <Film />
          <span>
            ویدیوهای ذخیره‌شده
            <strong>{projects.filter((p) => p.video).length.toLocaleString('fa')}</strong>
          </span>
        </div>
        <div>
          <HardDrive />
          <span>
            حجم فایل‌های پروژه‌ها
            <strong dir="ltr">
              {bytes(projects.reduce((s, p) => s + (p.video?.size ?? 0) + (p.model?.size ?? 0), 0))}
            </strong>
          </span>
        </div>
        <div className="stats-note">
          <span className="pulse" /> فضای کاری محلی <small>فقط در این مرورگر</small>
        </div>
      </div>
      <div className="toolbar">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="جست‌وجوی پروژه‌ها"
            placeholder="جست‌وجو در فضاهای شما…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="فیلتر نوع محیط"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">همه محیط‌ها</option>
          {Object.entries(environments).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select aria-label="مرتب‌سازی" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">آخرین تغییر · جدیدترین</option>
          <option value="old">آخرین تغییر · قدیمی‌ترین</option>
        </select>
      </div>
      {error && (
        <div className="notice error" role="alert">
          {error}
          <button onClick={load}>تلاش دوباره</button>
        </div>
      )}
      {loading ? (
        <div className="grid three">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 300 }} />
          ))}
        </div>
      ) : shown.length ? (
        <div className="grid three">
          {shown.map((p) => (
            <article key={p.id} className="project-card">
              <Link href={`/projects/${p.id}`} className="project-cover">
                {p.thumbnail ? (
                  <Image
                    src={p.thumbnail}
                    alt={`پیش‌نمایش ${p.name}`}
                    width={480}
                    height={270}
                    unoptimized
                  />
                ) : (
                  <>
                    <Box size={65} strokeWidth={0.8} />
                    <span>{environments[p.environment]}</span>
                  </>
                )}
                <span className={`badge ${p.status === 'model-ready' ? 'success' : ''}`}>
                  {statusLabels[p.status]}
                </span>
              </Link>
              <div className="project-body">
                <div className="project-title">
                  <Link href={`/projects/${p.id}`}>
                    <h3>{p.name}</h3>
                  </Link>
                  <span>{environments[p.environment]}</span>
                </div>
                <p className="caption muted">
                  <CalendarDays size={14} />
                  {new Date(p.updatedAt).toLocaleDateString('fa-IR')}
                  <span>·</span>
                  {bytes((p.video?.size ?? 0) + (p.model?.size ?? 0))}
                </p>
                <div className="project-actions">
                  <Link className="text-link" href={`/projects/${p.id}`}>
                    باز کردن پروژه <ArrowUpLeft size={16} />
                  </Link>
                  <div>
                    <button
                      aria-label={`تغییر نام ${p.name}`}
                      className="icon-button"
                      onClick={() => {
                        setRenaming(p);
                        setName(p.name);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      aria-label={`حذف ${p.name}`}
                      className="icon-button danger-text"
                      onClick={() => setRemoving(p)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty panel">
          <Box size={48} strokeWidth={1} />
          <h2>
            {projects.length
              ? 'فضایی با این مشخصات پیدا نشد.'
              : 'اولین فضای شما از اینجا شروع می‌شود.'}
          </h2>
          <p>
            {projects.length
              ? 'عبارت جست‌وجو یا فیلتر محیط را تغییر دهید.'
              : 'یک پروژه بسازید، ویدیویتان را اضافه کنید و مدل آماده را ببینید.'}
          </p>
          <Link href="/new" className="button">
            <Plus size={18} />
            ساخت پروژه
          </Link>
          <Link href="/demo" className="text-link">
            یا دموی سه‌بعدی را تجربه کنید <ArrowUpLeft size={16} />
          </Link>
        </div>
      )}
      <p className="privacy-note">
        پروژه‌ها در این مرورگر ذخیره می‌شوند. برای نگهداری بلندمدت، فایل‌های اصلی و خروجی اطلاعات
        پروژه را حفظ کنید.
      </p>
      <Confirm
        open={!!removing}
        title="این پروژه حذف شود؟"
        description={`«${removing?.name}» و همه فایل‌های آن از این مرورگر پاک می‌شوند. این کار قابل بازگشت نیست.`}
        busy={busy}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          setBusy(true);
          try {
            await repository.delete(removing.id);
            setRemoving(null);
            await load();
            toast.success('پروژه حذف شد.');
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      />
      {renaming && (
        <div className="modal-backdrop">
          <dialog open className="modal" aria-labelledby="rename-title">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await repository.rename(renaming.id, name);
                  setRenaming(null);
                  await load();
                  toast.success('نام پروژه تغییر کرد.');
                } catch (e) {
                  toast.error(errorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <h2 id="rename-title">تغییر نام پروژه</h2>
              <label>
                نام جدید
                <input
                  autoFocus
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <div className="actions">
                <button className="button" disabled={busy}>
                  ذخیره نام
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setRenaming(null)}
                >
                  انصراف
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}
