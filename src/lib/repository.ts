import { openDB, type DBSchema } from 'idb';
import {
  defaultPreferences,
  preferencesSchema,
  projectSchema,
  type Environment,
  type FileInfo,
  type Preferences,
  type Project,
} from './types';
interface VistaDB extends DBSchema {
  projects: { key: string; value: Project };
  videos: { key: string; value: Blob };
  models: { key: string; value: Blob };
  preferences: { key: string; value: Preferences };
}
const db = () =>
  openDB<VistaDB>('vista3d', 1, {
    upgrade(d) {
      d.createObjectStore('projects', { keyPath: 'id' });
      d.createObjectStore('videos');
      d.createObjectStore('models');
      d.createObjectStore('preferences');
    },
    blocked() {
      throw new Error('برای به‌روزرسانی پایگاه داده، تب‌های دیگر برنامه را ببندید.');
    },
  });
export const repository = {
  async list() {
    const d = await db();
    return (await d.getAll('projects')).map((p) => projectSchema.parse(p));
  },
  async get(id: string) {
    const p = await (await db()).get('projects', id);
    return p ? projectSchema.parse(p) : undefined;
  },
  async create(name: string, environment: Environment) {
    const now = new Date().toISOString();
    const p = projectSchema.parse({
      id: crypto.randomUUID(),
      name,
      environment,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
    });
    await (await db()).put('projects', p);
    return p;
  },
  async rename(id: string, name: string) {
    const d = await db();
    const tx = d.transaction('projects', 'readwrite');
    const p = await tx.store.get(id);
    if (!p) throw new Error('پروژه پیدا نشد.');
    await tx.store.put(projectSchema.parse({ ...p, name, updatedAt: new Date().toISOString() }));
    await tx.done;
  },
  async saveFile(
    id: string,
    kind: 'video' | 'model',
    blob: Blob,
    info: FileInfo,
    thumbnail?: string,
  ) {
    const d = await db();
    const tx = d.transaction(['projects', kind === 'video' ? 'videos' : 'models'], 'readwrite');
    const p = await tx.objectStore('projects').get(id);
    if (!p) throw new Error('پروژه پیدا نشد.');
    const updated = projectSchema.parse({
      ...p,
      [kind]: info,
      ...(thumbnail ? { thumbnail } : {}),
      status: kind === 'model' || p.model ? 'model-ready' : 'video-ready',
      error: undefined,
      updatedAt: new Date().toISOString(),
    });
    await tx.objectStore(kind === 'video' ? 'videos' : 'models').put(blob, id);
    await tx.objectStore('projects').put(updated);
    await tx.done;
    return updated;
  },
  async file(id: string, kind: 'video' | 'model') {
    return (await db()).get(kind === 'video' ? 'videos' : 'models', id);
  },
  async removeFile(id: string, kind: 'video' | 'model') {
    const d = await db();
    const tx = d.transaction(['projects', kind === 'video' ? 'videos' : 'models'], 'readwrite');
    const p = await tx.objectStore('projects').get(id);
    if (!p) throw new Error('پروژه پیدا نشد.');
    delete p[kind];
    if (kind === 'video') delete p.thumbnail;
    p.status = p.model ? 'model-ready' : p.video ? 'video-ready' : 'draft';
    p.updatedAt = new Date().toISOString();
    await tx.objectStore(kind === 'video' ? 'videos' : 'models').delete(id);
    await tx.objectStore('projects').put(p);
    await tx.done;
  },
  async delete(id: string) {
    const d = await db();
    const tx = d.transaction(['projects', 'videos', 'models'], 'readwrite');
    await Promise.all([
      tx.objectStore('projects').delete(id),
      tx.objectStore('videos').delete(id),
      tx.objectStore('models').delete(id),
    ]);
    await tx.done;
  },
  async clear() {
    const d = await db();
    const tx = d.transaction(['projects', 'videos', 'models', 'preferences'], 'readwrite');
    await Promise.all([
      tx.objectStore('projects').clear(),
      tx.objectStore('videos').clear(),
      tx.objectStore('models').clear(),
      tx.objectStore('preferences').clear(),
    ]);
    await tx.done;
  },
  async preferences() {
    return preferencesSchema.parse(
      (await (await db()).get('preferences', 'user')) ?? defaultPreferences,
    );
  },
  async setPreferences(p: Preferences) {
    await (await db()).put('preferences', preferencesSchema.parse(p), 'user');
  },
};
export async function checkStorage(size: number) {
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    if (quota && size > quota - usage) throw new Error('فضای ذخیره‌سازی مرورگر کافی نیست.');
  }
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
