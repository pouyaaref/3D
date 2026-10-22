import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { repository } from '../../src/lib/repository';
import { validateModel, validateVideoFile } from '../../src/lib/files';
import { processingProvider } from '../../src/lib/processing';
import { gaussianPly, triangleGlb } from '../fixtures/models';
afterEach(async () => {
  await repository.clear();
});
describe('transactional local repository', () => {
  it('persists video/model, preserves strongest status, renames, and cascades deletion', async () => {
    const p = await repository.create('استودیو', 'room');
    expect((await repository.get(p.id))?.status).toBe('draft');
    await repository.saveFile(p.id, 'model', new Blob(['model']), {
      name: 'm.ply',
      type: '',
      size: 5,
      format: 'ply',
    });
    await repository.saveFile(p.id, 'video', new Blob(['video']), {
      name: 'v.webm',
      type: 'video/webm',
      size: 5,
      duration: 2,
    });
    expect((await repository.get(p.id))?.status).toBe('model-ready');
    expect(await (await repository.file(p.id, 'video'))?.text()).toBe('video');
    await repository.rename(p.id, 'نام تازه');
    expect((await repository.list())[0].name).toBe('نام تازه');
    await repository.removeFile(p.id, 'model');
    expect((await repository.get(p.id))?.status).toBe('video-ready');
    await repository.delete(p.id);
    expect(await repository.get(p.id)).toBeUndefined();
    expect(await repository.file(p.id, 'video')).toBeUndefined();
    expect(await repository.file(p.id, 'model')).toBeUndefined();
  });
  it('rejects bad input without creating records', async () => {
    await expect(repository.create('   ', 'room')).rejects.toThrow();
    expect(await repository.list()).toHaveLength(0);
  });
  it('stores preferences and clears all data', async () => {
    await repository.create('خانه', 'home');
    await repository.setPreferences({
      theme: 'light',
      quality: 'performance',
      reducedMotion: true,
    });
    expect((await repository.preferences()).theme).toBe('light');
    await repository.clear();
    expect(await repository.list()).toHaveLength(0);
    expect((await repository.preferences()).theme).toBe('dark');
  });
});
describe('file validation', () => {
  it('accepts genuine Gaussian PLY and rejects ordinary point clouds', async () => {
    expect((await validateModel(new File([gaussianPly()], 'sphere.ply'))).format).toBe('ply');
    await expect(
      validateModel(
        new File(
          ['ply\nformat ascii 1.0\nelement vertex 1\nproperty float x\nend_header\n0'],
          'point.ply',
        ),
      ),
    ).rejects.toThrow('Gaussian');
  });
  it('accepts GLB2 and rejects a truncated header or length mismatch', async () => {
    expect((await validateModel(new File([triangleGlb()], 'test.glb'))).format).toBe('glb');
    await expect(validateModel(new File(['glTF'], 'broken.glb'))).rejects.toThrow();
    const b = triangleGlb();
    await expect(validateModel(new File([b.slice(0, -4)], 'broken.glb'))).rejects.toThrow();
  });
  it('rejects malformed SOG, unsupported formats, zero files and oversized video', async () => {
    await expect(validateModel(new File(['not zip'], 'bad.sog'))).rejects.toThrow('SOG');
    await expect(validateModel(new File(['x'], 'mesh.obj'))).rejects.toThrow('فرمت');
    expect(() => validateVideoFile(new File(['bad'], 'x.txt', { type: 'text/plain' }))).toThrow();
    expect(() => validateVideoFile(new File([], 'x.mp4'))).toThrow();
    const f = new File(['x'], 'x.mp4', { type: 'video/mp4' });
    Object.defineProperty(f, 'size', { value: 501 * 1024 * 1024 });
    expect(() => validateVideoFile(f)).toThrow();
  });
});
it('never fabricates processing jobs while disconnected', async () => {
  expect(processingProvider.connected).toBe(false);
  await expect(
    processingProvider.createJob({ projectId: 'x', videoObjectKey: 'x', idempotencyKey: 'x' }),
  ).rejects.toThrow('متصل نیست');
});
