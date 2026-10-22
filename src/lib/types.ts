import { z } from 'zod';
export const environments = {
  room: 'اتاق',
  home: 'خانه',
  shop: 'مغازه',
  office: 'دفتر کار',
  building: 'ساختمان',
  street: 'خیابان',
  other: 'سایر محیط‌ها',
} as const;
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.enum(['ply', 'sog', 'glb']).optional(),
});
export const projectSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, 'نام پروژه را وارد کنید').max(80),
  environment: z.enum(['room', 'home', 'shop', 'office', 'building', 'street', 'other']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'video-ready', 'model-ready', 'error']),
  video: fileSchema.optional(),
  model: fileSchema.optional(),
  thumbnail: z.string().optional(),
  error: z.string().optional(),
});
export type Project = z.infer<typeof projectSchema>;
export type FileInfo = z.infer<typeof fileSchema>;
export type Environment = Project['environment'];
export const statusLabels: Record<Project['status'], string> = {
  draft: 'پیش‌نویس',
  'video-ready': 'ویدیوی آماده',
  'model-ready': 'مدل سه‌بعدی آماده',
  error: 'خطا',
};
export const preferencesSchema = z.object({
  theme: z.enum(['dark', 'light']).default('dark'),
  reducedMotion: z.boolean().default(false),
  quality: z.enum(['balanced', 'performance']).default('balanced'),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const defaultPreferences: Preferences = {
  theme: 'dark',
  reducedMotion: false,
  quality: 'balanced',
};
export const LIMITS = {
  videoBytes: 500 * 1024 * 1024,
  videoSeconds: 300,
  modelBytes: 300 * 1024 * 1024,
};
export const bytes = (n: number) =>
  n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(1)} GB` : `${(n / 1024 ** 2).toFixed(1)} MB`;
export const errorMessage = (e: unknown) =>
  e instanceof DOMException && e.name === 'QuotaExceededError'
    ? 'فضای مرورگر کافی نیست. فایل کوچک‌تری انتخاب کنید یا داده‌های قبلی را پاک کنید.'
    : e instanceof Error
      ? e.message
      : 'عملیات انجام نشد. دوباره تلاش کنید.';
