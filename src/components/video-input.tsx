'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, Video, Circle, Square, X, Film } from 'lucide-react';
import { toast } from 'sonner';
import { inspectVideo } from '@/lib/files';
import { checkStorage } from '@/lib/repository';
import { bytes, errorMessage, LIMITS, type FileInfo } from '@/lib/types';
export default function VideoInput({
  onSave,
}: {
  onSave: (file: File, info: FileInfo, thumbnail?: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [camera, setCamera] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState<{
    file: File;
    info: FileInfo;
    url: string;
    thumbnail?: string;
  } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const live = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const mounted = useRef(true);
  const previewUrl = useRef<string | null>(null);
  const recordedBytes = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const release = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      release();
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);
  useEffect(() => {
    if (camera && live.current) live.current.srcObject = stream.current;
  }, [camera]);
  const inspect = async (file: File) => {
    setError('');
    setBusy(true);
    try {
      await checkStorage(file.size);
      const data = await inspectVideo(file);
      if (!mounted.current) return;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(file);
      previewUrl.current = url;
      setPreview({ file, url, ...data });
    } catch (e) {
      if (mounted.current) setError(errorMessage(e));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const stop = () => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    release();
    setCamera(false);
    setRecording(false);
  };
  const startCamera = async () => {
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error('ضبط مستقیم در این مرورگر پشتیبانی نمی‌شود؛ از آپلود فایل استفاده کنید.');
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      if (!mounted.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      setCamera(true);
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'دسترسی دوربین داده نشد. می‌توانید فایل ویدیو انتخاب کنید.'
          : errorMessage(e),
      );
      release();
    }
  };
  const record = () => {
    try {
      const mime = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/mp4',
        'video/webm',
      ].find((m) => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(stream.current!, mime ? { mimeType: mime } : undefined);
      recorder.current = r;
      chunks.current = [];
      recordedBytes.current = 0;
      r.ondataavailable = (e) => {
        if (e.data.size) {
          chunks.current.push(e.data);
          recordedBytes.current += e.data.size;
          if (recordedBytes.current >= LIMITS.videoBytes && r.state === 'recording') stop();
        }
      };
      r.onerror = () => {
        setError('ضبط ویدیو متوقف شد. دوباره تلاش کنید یا فایل انتخاب کنید.');
        stop();
      };
      r.onstop = () => {
        const type = r.mimeType || mime || 'video/webm';
        const file = new File(
          chunks.current,
          [`capture-${Date.now()}.${type.includes('mp4') ? 'mp4' : 'webm'}`].join(''),
          { type },
        );
        chunks.current = [];
        release();
        if (mounted.current) {
          setRecording(false);
          setCamera(false);
          void inspect(file);
        }
      };
      r.start(1000);
      setRecording(true);
      setSeconds(0);
      const started = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        if (elapsed >= LIMITS.videoSeconds) stop();
      }, 500);
    } catch (e) {
      setError(errorMessage(e));
      release();
      setCamera(false);
    }
  };
  const discard = () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
    if (input.current) input.current.value = '';
  };
  return (
    <div>
      <input
        ref={input}
        data-testid="video-input"
        hidden
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,.m4v"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void inspect(f);
          e.target.value = '';
        }}
      />
      {!camera && !preview && (
        <div
          className="upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f && !busy) void inspect(f);
          }}
        >
          <span className="upload-icon">
            <Upload size={30} />
          </span>
          <h3>فضای شما، از همین فایل شروع می‌شود</h3>
          <p>ویدیو را اینجا رها کنید یا از دستگاه انتخاب کنید.</p>
          <div className="actions">
            <button className="button" disabled={busy} onClick={() => input.current?.click()}>
              <Upload size={17} />
              انتخاب ویدیو
            </button>
            <button className="button secondary" disabled={busy} onClick={startCamera}>
              <Video size={17} /> استفاده از دوربین
            </button>
          </div>
          <span className="caption muted">MP4, MOV, WebM · حداکثر ۵۰۰ مگابایت و ۵ دقیقه</span>
        </div>
      )}
      {camera && (
        <div className="camera-panel">
          <video ref={live} autoPlay muted playsInline />
          <div className="actions">
            {recording ? (
              <>
                <span className="recording-dot" />
                {seconds.toLocaleString('fa')} ثانیه
                <button className="button danger" onClick={stop}>
                  <Square size={17} />
                  توقف ضبط
                </button>
              </>
            ) : (
              <button className="button" onClick={record}>
                <Circle size={17} />
                شروع ضبط
              </button>
            )}
            <button
              className="button secondary"
              onClick={() => {
                if (recording) stop();
                else {
                  release();
                  setCamera(false);
                }
              }}
            >
              بستن دوربین
            </button>
          </div>
        </div>
      )}
      {busy && !preview && (
        <p role="status" className="notice">
          در حال بررسی فایل و اطلاعات ویدیو…
        </p>
      )}
      {preview && (
        <div className="preview-panel">
          <video
            src={preview.url}
            controls
            playsInline
            preload="metadata"
            aria-label="پیش‌نمایش ویدیوی انتخاب‌شده"
          />
          <div className="file-info">
            <Film size={20} />
            <div>
              <strong dir="auto">{preview.file.name}</strong>
              <span>
                {bytes(preview.info.size)} ·{' '}
                {Math.round(preview.info.duration ?? 0).toLocaleString('fa')} ثانیه ·{' '}
                <bdi>
                  {preview.info.width} × {preview.info.height}
                </bdi>
              </span>
            </div>
          </div>
          <div className="actions">
            <button
              disabled={busy}
              className="button"
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await checkStorage(preview.file.size);
                  await onSave(preview.file, preview.info, preview.thumbnail);
                  if (mounted.current) {
                    discard();
                    toast.success('ویدیو در مرورگر ذخیره شد.');
                  }
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  if (mounted.current) setBusy(false);
                }
              }}
            >
              {busy ? 'در حال ذخیره…' : 'ذخیره ویدیو در پروژه'}
            </button>
            <button className="button secondary" disabled={busy} onClick={discard}>
              <X size={16} />
              حذف انتخاب
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
