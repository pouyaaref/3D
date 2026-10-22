'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Box,
  Film,
  ArrowUpLeft,
  Download,
  Cpu,
  ShieldCheck,
  Trash2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { checkStorage, download, repository } from '@/lib/repository';
import { validateModel } from '@/lib/files';
import { bytes, environments, errorMessage, statusLabels, type Project } from '@/lib/types';
import VideoInput from './video-input';
import Viewer from './viewer/viewer';
import Confirm from './ui/confirm';
function SavedVideo({ file }: { file: Blob }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <video
      className="saved-video"
      src={url}
      controls
      playsInline
      preload="metadata"
      aria-label="ویدیوی ذخیره‌شده"
    />
  );
}
export default function ProjectDetail({
  id,
  viewerOnly = false,
}: {
  id: string;
  viewerOnly?: boolean;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [video, setVideo] = useState<Blob>();
  const [model, setModel] = useState<Blob>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [remove, setRemove] = useState<'video' | 'model' | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    try {
      const p = await repository.get(id);
      if (!p)
        throw new Error('پروژه در این مرورگر پیدا نشد. پروژه‌های محلی بین دستگاه‌ها همگام نیستند.');
      const [v, m] = await Promise.all([
        repository.file(id, 'video'),
        repository.file(id, 'model'),
      ]);
      setProject(p);
      setVideo(v);
      setModel(m);
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  const importModel = async (f: File) => {
    setImporting(true);
    try {
      const info = await validateModel(f);
      await checkStorage(f.size);
      await repository.saveFile(id, 'model', f, info);
      await load();
      toast.success('مدل در پروژه ذخیره شد.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setImporting(false);
    }
  };
  if (loading)
    return (
      <div className="container page">
        <div className="skeleton" style={{ height: 450 }} />
      </div>
    );
  if (error || !project)
    return (
      <div className="container page empty">
        <Info size={40} />
        <h1>پروژه باز نشد</h1>
        <p role="alert">{error}</p>
        <Link href="/dashboard" className="button">
          پروژه‌های من
        </Link>
        <button className="button secondary" onClick={load}>
          تلاش دوباره
        </button>
      </div>
    );
  return (
    <div className={`container page ${viewerOnly ? 'viewer-page' : ''}`}>
      <Link className="text-link" href="/dashboard">
        پروژه‌های من / {project.name}
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{environments[project.environment]} / فضای شخصی</span>
          <h1>{project.name}</h1>
          <span className="badge inline success">{statusLabels[project.status]}</span>
        </div>
        <div className="actions">
          <button
            className="button secondary small"
            onClick={() => {
              download(
                new Blob(
                  [
                    JSON.stringify(
                      {
                        ...project,
                        thumbnail: undefined,
                        exportVersion: 1,
                        exportedAt: new Date().toISOString(),
                        note: 'Metadata only. Media files are not embedded.',
                      },
                      null,
                      2,
                    ),
                  ],
                  { type: 'application/json' },
                ),
                `vista3d-${project.id}.json`,
              );
              toast.success('اطلاعات پروژه دانلود شد؛ فایل‌های رسانه جدا هستند.');
            }}
          >
            <Download size={16} />
            خروجی اطلاعات
          </button>
          {!viewerOnly && model && (
            <Link className="button small" href={`/projects/${id}/viewer`}>
              ورود به نمایشگر <ArrowUpLeft size={17} />
            </Link>
          )}
          {viewerOnly && (
            <Link className="button secondary small" href={`/projects/${id}`}>
              مدیریت پروژه
            </Link>
          )}
        </div>
      </div>
      <input
        ref={input}
        hidden
        type="file"
        data-testid="model-input"
        accept=".ply,.sog,.glb"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importModel(f);
          e.target.value = '';
        }}
      />
      {model && project.model && (
        <section className="model-section">
          <div className="section-line">
            <h2>
              <Box size={21} /> مدل سه‌بعدی
            </h2>
            <span dir="auto">
              {project.model.name} · {bytes(project.model.size)}
            </span>
          </div>
          <Viewer
            key={`${project.updatedAt}-${project.model.name}`}
            file={model}
            format={project.model.format}
          />
          {project.model.format === 'glb' && (
            <p className="caption muted">
              برای چرخش بکشید، برای زوم اسکرول کنید؛ لمس با دو انگشت برای جابه‌جایی. پس از تمرکز روی
              نمایشگر، کلیدهای جهت یا WASD دوربین را جابه‌جا می‌کنند.
            </p>
          )}
          <div className="actions">
            <button
              className="button secondary small"
              onClick={() => download(model, project.model!.name)}
            >
              <Download size={15} />
              دانلود فایل مدل
            </button>
            <button
              className="button secondary small danger-text"
              onClick={() => setRemove('model')}
            >
              <Trash2 size={15} />
              حذف مدل
            </button>
          </div>
        </section>
      )}
      {viewerOnly && !model && (
        <div className="panel empty">
          <Box size={40} />
          <h2>هنوز مدلی وارد نشده است.</h2>
          <button className="button" onClick={() => input.current?.click()}>
            انتخاب مدل سه‌بعدی
          </button>
        </div>
      )}
      {!viewerOnly && (
        <div className="detail-grid">
          <div>
            <section className="panel">
              <div className="section-line">
                <h2>
                  <Film size={20} /> ویدیوی محیط
                </h2>
                <Link href="/guide" className="text-link">
                  راهنمای ضبط <ArrowUpLeft size={15} />
                </Link>
              </div>
              {video && project.video ? (
                <>
                  <SavedVideo file={video} />
                  <div className="file-info">
                    <Film size={21} />
                    <div>
                      <strong dir="auto">{project.video.name}</strong>
                      <span>
                        {bytes(project.video.size)} ·{' '}
                        {Math.round(project.video.duration ?? 0).toLocaleString('fa')} ثانیه ·{' '}
                        <bdi>
                          {project.video.width} × {project.video.height}
                        </bdi>
                      </span>
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="button secondary small"
                      onClick={() => download(video, project.video!.name)}
                    >
                      <Download size={15} />
                      دانلود ویدیو
                    </button>
                    <button
                      className="button secondary small danger-text"
                      onClick={() => setRemove('video')}
                    >
                      <Trash2 size={15} />
                      حذف و انتخاب دوباره
                    </button>
                  </div>
                </>
              ) : (
                <VideoInput
                  onSave={async (file, info, thumbnail) => {
                    await repository.saveFile(id, 'video', file, info, thumbnail);
                    await load();
                  }}
                />
              )}
            </section>
            <section className="panel import-panel">
              <div className="section-line">
                <h2>
                  <Box size={20} /> مدل سه‌بعدی آماده
                </h2>
                <span className="badge inline">فعال</span>
              </div>
              <p>
                خروجی ابزارهای بازسازی را از دستگاه خود وارد کنید. مدل در مرورگر باز می‌شود و از
                دستگاه شما خارج نمی‌شود.
              </p>
              <button
                className="button"
                disabled={importing}
                onClick={() => input.current?.click()}
              >
                <Upload size={18} />
                {importing
                  ? 'در حال بررسی و ذخیره…'
                  : model
                    ? 'جایگزینی مدل سه‌بعدی'
                    : 'واردکردن مدل سه‌بعدی آماده'}
              </button>
              <p className="caption muted" dir="auto">
                Gaussian PLY · SOG · GLB — حداکثر ۳۰۰ مگابایت
              </p>
              <p className="caption muted">
                PLY معمولی پشتیبانی نمی‌شود. GLB باید تمام منابع را داخل خود داشته باشد. برای گوشی
                مدل کوچک‌تر از ۵۰ مگابایت پیشنهاد می‌شود.
              </p>
            </section>
          </div>
          <aside>
            <section className="panel ai-panel">
              <span className="eyebrow">
                <Cpu size={17} /> گام بعدی / بازسازی هوشمند
              </span>
              <h2>از ویدیو به یک فضای زنده</h2>
              <p>موتور پردازش متصل نیست.</p>
              <div className="pipeline">
                {[
                  'استخراج فریم‌ها',
                  'تخمین موقعیت دوربین',
                  'آموزش Gaussian Splat',
                  'خروجی و نمایش',
                ].map((s, i) => (
                  <div key={s}>
                    <span>{(i + 1).toLocaleString('fa')}</span>
                    {s}
                  </div>
                ))}
              </div>
              <button className="button secondary" disabled>
                نیازمند اتصال موتور پردازش
              </button>
              <p className="caption muted">
                هیچ پردازشی شروع نشده و هیچ فایلی ارسال نمی‌شود. برای مشاهده سه‌بعدی از مسیر
                واردکردن مدل آماده استفاده کنید.
              </p>
            </section>
            <section className="panel metadata">
              <h3>جزئیات پروژه</h3>
              <dl>
                <dt>ایجاد</dt>
                <dd>{new Date(project.createdAt).toLocaleDateString('fa-IR')}</dd>
                <dt>آخرین تغییر</dt>
                <dd>{new Date(project.updatedAt).toLocaleDateString('fa-IR')}</dd>
                <dt>محیط</dt>
                <dd>{environments[project.environment]}</dd>
                <dt>شناسه</dt>
                <dd className="project-id" dir="ltr">
                  {id}
                </dd>
              </dl>
              <p className="caption">
                <ShieldCheck size={15} /> حالت مهمان · ذخیره محلی
              </p>
            </section>
          </aside>
        </div>
      )}
      <Confirm
        open={!!remove}
        title="فایل از پروژه حذف شود؟"
        description="فایل ذخیره‌شده از این مرورگر پاک می‌شود. نسخه اصلی روی دستگاه شما تغییری نمی‌کند."
        onClose={() => setRemove(null)}
        onConfirm={async () => {
          if (!remove) return;
          try {
            await repository.removeFile(id, remove);
            setRemove(null);
            await load();
            toast.success('فایل حذف شد.');
          } catch (e) {
            toast.error(errorMessage(e));
          }
        }}
      />
    </div>
  );
}
