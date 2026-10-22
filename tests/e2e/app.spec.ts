import { test, expect } from '@playwright/test';
import { gaussianPly, triangleGlb } from '../fixtures/models';
test('local project lifecycle, video preview, refresh, real splat + GLB rendering and deletion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('بُعد تازه');
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('پروژه‌های من');
  await page.getByRole('link', { name: 'ساخت پروژه', exact: true }).click();
  await page.getByLabel('۲. یک نام برای پروژه انتخاب کنید').fill('استودیوی تست');
  await page.getByRole('button', { name: 'ساخت پروژه و افزودن فایل' }).click();
  await expect(page).toHaveURL(/\/projects\//);
  const projectUrl = page.url();
  await page
    .getByTestId('video-input')
    .setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
  await expect(page.locator('.notice[role="alert"]')).toContainText('ویدیویی');
  // Generate a real one-second browser-encoded video; no external files or server upload.
  const video = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 180;
    const ctx = c.getContext('2d')!;
    const stream = c.captureStream(15);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      recorder.start();
      let n = 0;
      const interval = setInterval(() => {
        ctx.fillStyle = `hsl(${n++ * 10},50%,45%)`;
        ctx.fillRect(0, 0, 320, 180);
        ctx.fillStyle = 'white';
        ctx.fillRect(n * 3, 40, 50, 50);
      }, 60);
      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      }, 1300);
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await page
    .getByTestId('video-input')
    .setInputFiles({ name: 'valid.webm', mimeType: 'video/webm', buffer: Buffer.from(video) });
  await expect(page.getByLabel('پیش‌نمایش ویدیوی انتخاب‌شده')).toBeVisible();
  await page.getByRole('button', { name: 'ذخیره ویدیو در پروژه' }).click();
  await expect(page.getByLabel('ویدیوی ذخیره‌شده')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('ویدیوی ذخیره‌شده')).toBeVisible();
  await expect(page.getByText('ویدیوی آماده', { exact: true })).toBeVisible();
  const invalidGlb = triangleGlb();
  invalidGlb[20] = 33;
  await page.getByTestId('model-input').setInputFiles({
    name: 'corrupt.glb',
    mimeType: 'model/gltf-binary',
    buffer: Buffer.from(invalidGlb),
  });
  await expect(page.locator('.viewer-message.error')).toContainText('خواندن مدل ممکن نشد');
  await page.getByTestId('model-input').setInputFiles({
    name: 'sphere.ply',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from(gaussianPly()),
  });
  await expect(page.locator('.splat-host canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'نمای کامل', exact: true })).toBeEnabled({
    timeout: 60000,
  });
  await page.getByRole('button', { name: 'نمای کامل', exact: true }).click();
  await page.screenshot({ path: 'test-results/splat-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'تغییر حالت پرواز / چرخش' }).click();
  await page.getByRole('button', { name: 'تغییر حالت پرواز / چرخش' }).click();
  const splat = page.locator('.splat-host canvas');
  const b = await splat.boundingBox();
  if (b) {
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.6, b.y + b.height * 0.6, { steps: 8 });
    await page.mouse.up();
    await page.mouse.wheel(0, 120);
  }
  await page.getByTestId('model-input').setInputFiles({
    name: 'triangle.glb',
    mimeType: 'model/gltf-binary',
    buffer: Buffer.from(triangleGlb()),
  });
  await expect(page.getByTestId('three-viewer').locator('canvas')).toBeVisible();
  await expect(page.locator('.viewer-message')).toHaveCount(0);
  await page.getByRole('button', { name: 'بازنشانی دوربین', exact: true }).click();
  await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click();
  await page.setViewportSize({ width: 850, height: 700 });
  await expect(page.locator('.canvas-host canvas')).toBeVisible();
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'تغییر نام استودیوی تست', exact: true }).click();
  await page.getByLabel('نام جدید').fill('استودیوی تازه');
  await page.getByRole('button', { name: 'ذخیره نام', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'استودیوی تازه' })).toBeVisible();
  await page.getByLabel('جست‌وجوی پروژه‌ها').fill('غیرموجود');
  await expect(page.getByText('فضایی با این مشخصات پیدا نشد.')).toBeVisible();
  await page.getByLabel('جست‌وجوی پروژه‌ها').fill('');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'استودیوی تازه' })).toBeVisible();
  await page.getByRole('button', { name: 'حذف استودیوی تازه', exact: true }).click();
  await page.getByRole('button', { name: 'حذف دائمی', exact: true }).click();
  await expect(page.getByText('اولین فضای شما از اینجا شروع می‌شود.')).toBeVisible();
  await page.goto(projectUrl);
  await expect(page.getByRole('alert').filter({ hasText: 'پیدا نشد' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('mobile RTL layout, demo interactions, privacy, settings persistence and invalid file errors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect
    .poll(
      async () =>
        (await page.getByRole('navigation', { name: 'ناوبری اصلی' }).boundingBox())?.y ?? 0,
    )
    .toBeGreaterThan(700);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.goto('/demo');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click();
  await page.getByRole('button', { name: 'بازنشانی دوربین', exact: true }).click();
  await page.goto('/guide');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('داده‌های شما');
  await page.goto('/settings');
  await page.getByLabel('پوسته برنامه').selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: 'test-results/settings-mobile-light.png', fullPage: true });
  await page.getByLabel('پوسته برنامه').selectOption('dark');
  await page.goto('/new');
  await page.getByLabel('۲. یک نام برای پروژه انتخاب کنید').fill('فایل نامعتبر');
  await page.getByRole('button', { name: 'ساخت پروژه و افزودن فایل' }).click();
  await expect(page).toHaveURL(/\/projects\//);
  await page.getByTestId('video-input').setInputFiles({
    name: 'broken.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('this is not a video'),
  });
  await expect(page.locator('.notice[role="alert"]')).toContainText('خراب');
  await page.getByTestId('model-input').setInputFiles({
    name: 'plain.ply',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('ply\nformat ascii 1.0\nelement vertex 1\nproperty float x\nend_header\n0'),
  });
  await expect(page.getByText('این PLY یک Gaussian Splat نیست.', { exact: false })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: 'test-results/project-mobile.png', fullPage: true });
  await page.goto('/a-missing-page');
  await expect(page.getByRole('heading', { name: 'این فضا پیدا نشد.' })).toBeVisible();
});
