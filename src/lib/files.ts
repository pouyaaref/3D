import { LIMITS, type FileInfo } from './types';
export async function validateModel(file: File): Promise<FileInfo> {
  if (!file.size || file.size > LIMITS.modelBytes)
    throw new Error('مدل باید غیرخالی و کوچک‌تر از ۳۰۰ مگابایت باشد.');
  const format = file.name.split('.').pop()?.toLowerCase();
  const head = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
  if (format === 'glb') {
    const v = new DataView(head.buffer);
    if (
      head.length < 20 ||
      v.getUint32(0, true) !== 0x46546c67 ||
      v.getUint32(4, true) !== 2 ||
      v.getUint32(8, true) !== file.size
    )
      throw new Error('فایل GLB نسخه ۲ معتبر نیست.');
  } else if (format === 'ply') {
    const text = new TextDecoder().decode(head);
    const end = text.indexOf('end_header');
    if (!text.startsWith('ply\n') && !text.startsWith('ply\r\n'))
      throw new Error('سربرگ PLY معتبر نیست.');
    if (end < 0) throw new Error('سربرگ PLY ناقص یا بیش از حد بزرگ است.');
    const h = text.slice(0, end);
    const gaussian = [
      'x',
      'y',
      'z',
      'opacity',
      'f_dc_0',
      'f_dc_1',
      'f_dc_2',
      'scale_0',
      'scale_1',
      'scale_2',
      'rot_0',
      'rot_1',
      'rot_2',
      'rot_3',
    ].every((p) => new RegExp(`property \\w+ ${p}\\r?$`, 'm').test(h));
    const compressed =
      ['packed_position', 'packed_rotation', 'packed_scale', 'packed_color'].every((p) =>
        h.includes(` ${p}`),
      ) && h.includes('element chunk');
    if (!gaussian && !compressed)
      throw new Error(
        'این PLY یک Gaussian Splat نیست. فایل مش یا ابرنقاط معمولی پشتیبانی نمی‌شود.',
      );
    if (!/element vertex [1-9]\d*/.test(h)) throw new Error('مدل Gaussian فاقد نقاط معتبر است.');
  } else if (format === 'sog') {
    if (head[0] !== 0x50 || head[1] !== 0x4b)
      throw new Error('فایل SOG باید بسته‌بندی تک‌فایلی معتبر باشد.');
  } else throw new Error('فرمت مجاز: Gaussian PLY، SOG تک‌فایلی یا GLB.');
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    format: format as 'ply' | 'sog' | 'glb',
  };
}
export function validateVideoFile(file: File) {
  if (!file.size || file.size > LIMITS.videoBytes)
    throw new Error('ویدیو باید غیرخالی و کوچک‌تر از ۵۰۰ مگابایت باشد.');
  if (
    !/\.(mp4|mov|webm|m4v|ogv)$/i.test(file.name) ||
    (file.type && !file.type.startsWith('video/'))
  )
    throw new Error('یک فایل ویدیویی MP4، MOV یا WebM معتبر انتخاب کنید.');
}
export async function inspectVideo(file: File): Promise<{ info: FileInfo; thumbnail?: string }> {
  validateVideoFile(file);
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    const url = URL.createObjectURL(file);
    let done = false;
    const cleanup = () => {
      clearTimeout(timer);
      v.onloadeddata = null;
      v.onloadedmetadata = null;
      v.onseeked = null;
      v.ontimeupdate = null;
      v.onerror = null;
      v.removeAttribute('src');
      v.load();
      URL.revokeObjectURL(url);
    };
    const fail = (message: string) => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(message));
    };
    const timer = setTimeout(
      () => fail('خواندن ویدیو ممکن نشد. فایل یا کدک دیگری امتحان کنید.'),
      20000,
    );
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.onerror = () => fail('ویدیو خراب است یا کدک آن در این مرورگر پشتیبانی نمی‌شود.');
    const finish = () => {
      if (done) return;
      if (!Number.isFinite(v.duration) || v.duration <= 0 || !v.videoWidth)
        return fail('اطلاعات ویدیو معتبر نیست.');
      if (v.duration > LIMITS.videoSeconds) return fail('مدت ویدیو نباید بیشتر از ۵ دقیقه باشد.');
      let thumbnail: string | undefined;
      try {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = Math.round((480 * v.videoHeight) / v.videoWidth);
        c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
        thumbnail = c.toDataURL('image/jpeg', 0.65);
      } catch {}
      const info = {
        name: file.name,
        size: file.size,
        type: file.type,
        duration: v.duration,
        width: v.videoWidth,
        height: v.videoHeight,
      };
      done = true;
      cleanup();
      resolve({ info, thumbnail });
    };
    // MediaRecorder WebM often omits duration. Seeking to its end lets the browser
    // discover the actual duration, then return to the first frame for a thumbnail.
    let measuring = false;
    const measureDuration = () => {
      if (done || measuring) return;
      if (!Number.isFinite(v.duration)) {
        measuring = true;
        v.ontimeupdate = () => {
          if (!Number.isFinite(v.duration)) return;
          v.ontimeupdate = null;
          v.onseeked = () => {
            v.onseeked = null;
            finish();
          };
          v.currentTime = 0;
        };
        v.currentTime = 1e10;
      } else finish();
    };
    v.onloadeddata = measureDuration;
    v.src = url;
  });
}
