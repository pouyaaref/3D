'use client';
import { useEffect, useRef, useState } from 'react';
import { createViewer } from '@playcanvas/supersplat-viewer/viewer';
import { defaultSettings } from '@playcanvas/supersplat-viewer/settings';
import '@playcanvas/supersplat-viewer/viewer.css';
import { usePreferences } from '../providers';
import { toast } from 'sonner';
import type { Asset } from 'playcanvas';
type Handle = Awaited<ReturnType<typeof createViewer>>;
export default function SplatViewer({ file, format }: { file: Blob; format: string }) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<Handle | null>(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const { preferences } = usePreferences();
  useEffect(() => {
    let disposed = false;
    let viewer: Handle | undefined;
    setLoaded(false);
    setError('');
    const url = URL.createObjectURL(file);
    const timeout = setTimeout(() => {
      if (!disposed && !viewer?.state.loaded)
        setError('بارگذاری مدل کامل نشد. سالم بودن فایل و توان گرافیکی دستگاه را بررسی کنید.');
    }, 60000);
    const run = async () => {
      try {
        const v = await createViewer({
          container: host.current!,
          settings: defaultSettings('object'),
          contentUrl: url,
          contentFilename: `scene.${format}`,
          renderer: 'webgl',
          ui: true,
          lang: 'en',
          budget: preferences.quality === 'performance' ? 0.5 : 1.5,
        });
        if (disposed) {
          v.destroy();
          return;
        }
        viewer = v;
        handle.current = v;
        // SOG's parser can fall back to external URLs for missing archive entries.
        // Reject those assets before the parser starts any texture loads.
        v.app.assets.on('add', (asset: Asset) => {
          const source = asset.file as { url?: string; contents?: unknown } | null;
          if (
            asset.type === 'texture' &&
            source &&
            !source.contents &&
            !source.url?.startsWith('blob:') &&
            !source.url?.startsWith('data:')
          ) {
            throw new Error('مدل باید مستقل باشد؛ بارگذاری منابع خارجی مجاز نیست.');
          }
        });
        const ready = () => {
          if (v.state.loaded) {
            clearTimeout(timeout);
            setLoaded(true);
            setError('');
            v.frameScene();
          }
        };
        v.events.on('loaded:changed', ready);
        v.app.assets.on('error', () => {
          if (disposed) return;
          clearTimeout(timeout);
          setError('مدل قابل بارگذاری نیست. یک Gaussian PLY یا SOG سالم انتخاب کنید.');
        });
        ready();
      } catch {
        if (!disposed)
          setError('مدل ناسازگار است یا WebGL2 در دسترس نیست. فایل و مرورگر را بررسی کنید.');
      }
    };
    void run();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      viewer?.destroy();
      handle.current = null;
      URL.revokeObjectURL(url);
    };
  }, [file, format, preferences.quality]);
  return (
    <div className="splat-wrapper">
      <div ref={host} className="splat-host" dir="ltr" />
      {!loaded && !error && <div className="splat-status">در حال خواندن و نمایش مدل…</div>}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <div className="splat-actions">
        <button
          className="button secondary small"
          disabled={!loaded}
          onClick={() => handle.current?.frameScene()}
        >
          نمای کامل
        </button>
        <button
          className="button secondary small"
          disabled={!loaded}
          onClick={() => handle.current?.resetCamera()}
        >
          بازنشانی دوربین
        </button>
        <label>
          زاویه دید{' '}
          <input
            aria-label="زاویه دید"
            type="range"
            min="30"
            max="100"
            defaultValue="60"
            disabled={!loaded}
            onChange={(e) => {
              const camera = handle.current?.app.root.findComponents('camera')[0];
              if (camera && handle.current) {
                camera.fov = Number(e.target.value);
                handle.current.app.renderNextFrame = true;
              }
            }}
          />
        </label>
        <button
          className="button secondary small"
          disabled={!loaded}
          onClick={() => {
            if (handle.current)
              handle.current.state.cameraMode =
                handle.current.state.cameraMode === 'fly' ? 'orbit' : 'fly';
          }}
        >
          تغییر حالت پرواز / چرخش
        </button>
        <button
          className="button secondary small"
          onClick={() =>
            handle.current?.requestFullscreen().catch(() => toast.error('تمام‌صفحه در دسترس نیست.'))
          }
        >
          تمام‌صفحه
        </button>
      </div>
      <p className="muted caption">
        ماوس: کشیدن برای چرخش، راست‌کلیک برای جابه‌جایی، اسکرول برای زوم. لمس: یک انگشت برای چرخش،
        دو انگشت برای جابه‌جایی و زوم. پرواز: WASD؛ راهنمای کامل داخل نمایشگر. داده برخورد فیزیکی در
        این مدل وجود ندارد.
      </p>
    </div>
  );
}
