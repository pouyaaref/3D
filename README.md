# 3D — Vista3D

وب‌اپلیکیشن فارسی و RTL برای ثبت محلی ویدیوی محیط، مدیریت پروژه‌ها و نمایش تعاملی مدل‌های سه‌بعدی. ساخته‌شده با Next.js App Router، React، TypeScript strict، Tailwind CSS، Motion، PlayCanvas SuperSplat Viewer و Three.js.

**وضعیت واقعی:** موتور بازسازی AI متصل نیست. برنامه هیچ ویدیویی را به مدل تبدیل نمی‌کند و هیچ رسانه‌ای را به سرور ارسال نمی‌کند. واردکردن مدل آماده و دموی واقعی Three.js فعال است.

## اجرای محلی

Node.js 22.15 یا جدیدتر و pnpm 10 پیشنهاد می‌شود.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

آدرس پیش‌فرض: http://localhost:3000 . اگر این پورت اشغال است:

```bash
pnpm dev --port 3100
```

هیچ متغیر محیطی، API Key، پایگاه داده سروری یا حساب کاربری لازم نیست. فایل `.env.example` همین موضوع را مستند کرده است. فونت Vazirmatn و موتورهای نمایش از فایل‌های همراه برنامه بارگذاری می‌شوند.

## استقرار روی Vercel

1. مخزن `pouyaaref/3D` را در Vercel Import کنید.
2. Framework Preset را **Next.js** و Root Directory را ریشه مخزن (`./`) انتخاب کنید.
3. Install Command: `pnpm install --frozen-lockfile`، Build Command: `pnpm build`.
4. Output Directory را روی پیش‌فرض Next.js بگذارید؛ Node.js 22.x یا جدیدتر را انتخاب کنید.
5. Environment Variable لازم نیست. Deploy کنید.

پردازش GPU، API آپلود ویدیو و وابستگی به دیسک دائمی سرور وجود ندارد. مسیرهای داینامیک پروژه تنها پوسته صفحه را ارائه می‌کنند؛ داده پروژه در کلاینت خوانده می‌شود. اشتراک عمومی پروژه محلی یا ورود جعلی وجود ندارد. دوربین به HTTPS یا localhost نیاز دارد.

**استقرار از این محیط انجام نشده است؛ مدیریت Vercel با مالک مخزن است.**

## قابلیت‌ها و صفحات

- `/`: معرفی محصول، Hero سه‌بعدی تعاملی، کاربردها و سؤال‌های متداول.
- `/dashboard`: ساخت، جست‌وجو، فیلتر محیط، مرتب‌سازی، تغییر نام، حذف با تأیید و نمایش وضعیت واقعی پروژه.
- `/new`: انتخاب نوع محیط و نام پروژه.
- `/projects/[id]`: ضبط دوربین در مرورگر سازگار، آپلود، اعتبارسنجی کدک/مدت/اندازه، پیش‌نمایش، ذخیره و دانلود ویدیو، واردکردن و دانلود مدل و خروجی JSON مشخصات.
- `/projects/[id]/viewer`: نمایشگر مستقل مدل ذخیره‌شده.
- `/demo`: اتاق قابل گردش با هندسه واقعی Three.js؛ این صحنه طراحی شده و خروجی بازسازی AI نیست.
- `/guide`: راهنمای تصویری ضبط محیط.
- `/settings`: پوسته روشن/تاریک، کاهش حرکت، کیفیت نمایشگر، سهمیه ذخیره‌سازی، درخواست persistent storage، خروجی اطلاعات و پاک‌سازی با تأیید.
- `/privacy`: سیاست داده محلی و راهنمای پشتیبان‌گیری.
- حالت‌های loading، skeleton، empty، خطا، 404، toast و Web App Manifest.

Manifest برای افزودن به صفحه اصلی موجود است؛ service worker و اجرای آفلاین کامل در این نسخه پیاده‌سازی نشده‌اند. نصب‌پذیری به مرورگر بستگی دارد.

## فرمت‌ها و محدودیت‌ها

- Gaussian PLY معمولی و compressed PLY: تشخیص ویژگی‌های Gaussian در سربرگ؛ PLY معمولی مش/ابرنقاط رد می‌شود.
- SOG تک‌فایلی: نمایش با SuperSplat Viewer. فایل‌های جانبی `.meta.json` یا LOD از ورودی این نسخه پذیرفته نمی‌شوند.
- GLB نسخه ۲ مستقل با Three.js: فایل‌های خارجی بارگذاری نمی‌شوند. Draco/KTX2 decoder در این نسخه تنظیم نشده؛ مدل نیازمند decoder می‌تواند با خطای بارگذاری مواجه شود.
- محدودیت قابل تنظیم در `src/lib/types.ts`: ویدیو ۵۰۰ MiB و ۳۰۰ ثانیه؛ مدل ۳۰۰ MiB. مرورگر ممکن است محدودیت عملی کمتری به‌خاطر RAM/GPU داشته باشد. روی گوشی مدل کوچک انتخاب کنید.
- پشتیبانی MOV/HEVC و ضبط مستقیم به کدک و مرورگر وابسته است. نبود دوربین، آپلود فایل را غیرفعال نمی‌کند. صدایی ضبط نمی‌شود و trackهای دوربین در توقف یا خروج آزاد می‌شوند.
- کنترل دوربین: چرخش، pan، zoom، reset، fullscreen در مرورگر سازگار، لمس، کلیدهای جهت/WASD. SuperSplat حالت fly دارد؛ برخورد فیزیکی یا پیمایش مبتنی بر collision بدون داده برخورد ادعا نمی‌شود.

## معماری

```text
src/app/                    App Router pages and global theme
src/components/             Product UI, capture, project management
src/components/viewer/      Lazy browser-only SuperSplat and Three.js viewers
src/lib/types.ts            Zod schemas and configurable limits
src/lib/repository.ts       IndexedDB repository and atomic file/project writes
src/lib/files.ts            Media validation and video metadata extraction
src/lib/processing.ts       Future processing provider contract
tests/unit/                 Repository, validation and disconnected-provider tests
tests/e2e/                  Real browser lifecycle and responsive tests
tests/fixtures/             Original synthetic Gaussian PLY and GLB generators
```

IndexedDB `vista3d` دارای storeهای `projects`، `videos`، `models` و `preferences` است. متادیتا در رکورد پروژه و فایل‌ها به‌شکل Blob ذخیره می‌شوند. حذف پروژه با تراکنش، فایل‌های وابسته را هم پاک می‌کند. فقط thumbnail کوچک JPEG در متادیتا قرار می‌گیرد؛ ویدیو و مدل به Base64 در localStorage تبدیل نمی‌شوند.

پاک‌کردن اطلاعات مرورگر یا کمبود فضا ممکن است داده‌ها را حذف کند؛ ذخیره پایدار تضمین پشتیبان نیست. داده‌ها بین دستگاه‌ها یا دامنه‌ها همگام نمی‌شوند. خروجی JSON فقط اطلاعات پروژه است، شامل رسانه نیست و import پشتیبان JSON در نسخه اول وجود ندارد. فایل‌های اصلی را جداگانه نگه دارید.

## بررسی و تست

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Playwright سرور production را روی پورت 3100 اجرا می‌کند. تنظیم فعلی از Edge نصب‌شده (`channel: msedge`) استفاده می‌کند. روی CI لینوکسی Edge نصب کنید یا `channel` را حذف و `pnpm exec playwright install --with-deps chromium` اجرا کنید. قبل از E2E، build لازم است. سرور دیگری با محتوای متفاوت روی پورت 3100 اجرا نکنید.

تست مرورگری با ویدیوی واقعی تولیدشده توسط Canvas + MediaRecorder و مدل‌های باینری معتبر Gaussian PLY و GLB اجرا می‌شود. مسیر ساخت پروژه، رد فایل نامعتبر، پیش‌نمایش، ذخیره، Refresh، نمایشگرها، کنترل دوربین، تغییر اندازه، تغییر نام، جست‌وجو و حذف را می‌پوشاند. سناریوی دوم نمایش موبایل، RTL، صفحه راهنما/حریم خصوصی، پوسته ماندگار، خطاهای ویدیو و PLY و 404 را بررسی می‌کند.

مدل SOG واقعی و دستگاه فیزیکی iOS/Android هنوز به‌صورت E2E آزمایش نشده‌اند. تست دوربین فیزیکی و رد مجوز به بررسی روی دستگاه واقعی نیاز دارد. نتایج و تصاویر اجرای محلی در `test-results/` تولید می‌شوند و وارد Git نمی‌شوند.

## اتصال موتور AI آینده

قرارداد `ProcessingProvider` در `src/lib/processing.ts` مستقل از UI و repository است:

1. سرویس احرازشده یک URL امضاشده برای ارسال مستقیم به object storage برگرداند.
2. پس از رضایت روشن کاربر، کلاینت ویدیو را مستقیم به storage ارسال کند؛ فایل حجیم را از Vercel Functions عبور ندهید.
3. `createJob` با object key و idempotency key وظیفه‌ای واقعی ایجاد کند.
4. Worker جداگانه Python چرخه Video → Frame Extraction → COLMAP Camera Poses → Nerfstudio Training → PLY/SOG Export را اجرا کند.
5. `getJob` وضعیت، خطای قابل retry و پیشرفت واقعی را برگرداند. هیچ درصدی از تایمر محلی تولید نشود.
6. خروجی از URL مجاز دریافت و در Viewer باز شود. لغو و retry مطابق قابلیت واقعی provider فعال شوند.

نیازهای سرویس آینده: احراز هویت و مالکیت job، اعتبارسنجی سمت سرور، محدودیت حجم/هزینه، صف وظایف، GPU workers، سیاست retention، URLهای موقت و CORS دقیق. هیچ کلید محرمانه‌ای نباید به کلاینت ارسال شود. provider فعلی disconnected است و تمام عملیات پردازش را با پیام صریح رد می‌کند.

## منابع و مجوزها

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [SuperSplat Viewer embedding](https://developer.playcanvas.com/user-manual/supersplat/viewer/embedding/)
- [SuperSplat Viewer API](https://github.com/playcanvas/supersplat-viewer/blob/main/docs/api.md) — MIT؛ از API رسمی `createViewer` و `destroy` استفاده می‌شود.
- [Three.js](https://threejs.org/docs/) — MIT.
- [Motion](https://motion.dev/docs/react)، [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
- فونت [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — SIL Open Font License.
- اتاق دمو و fixtureهای مصنوعی توسط این پروژه ساخته شده‌اند. فایل بازسازی‌شده شخص ثالثی به مخزن اضافه نشده است؛ مجوز روشن برای محیط نمونه دانلودی تأیید نشده بود. Gaussian fixture یک مدل فنی واقعی و مصنوعی است، نه محیط بازسازی‌شده.

نسخه‌های دقیق نصب‌شده در `pnpm-lock.yaml` ثبت شده‌اند.
