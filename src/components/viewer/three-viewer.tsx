'use client';
import { useEffect, useRef, useState } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Maximize, RotateCcw, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { makeRoom } from './room';
import { usePreferences } from '../providers';
export default function ThreeViewer({ file, hero = false }: { file?: Blob; hero?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<{ reset: () => void; zoom: (n: number) => void }>({
    reset: () => {},
    zoom: () => {},
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { preferences } = usePreferences();
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let renderer: T.WebGLRenderer;
    let controls: OrbitControls;
    let observer: ResizeObserver;
    let cleanup = () => {};
    const scene = new T.Scene();
    const disposeObject = (root: T.Object3D) =>
      root.traverse((o) => {
        if (o instanceof T.Mesh || o instanceof T.LineSegments) {
          o.geometry.dispose();
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            for (const value of Object.values(m)) if (value instanceof T.Texture) value.dispose();
            m.dispose();
          }
        }
      });
    try {
      renderer = new T.WebGLRenderer({
        antialias: preferences.quality !== 'performance',
        alpha: true,
      });
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, preferences.quality === 'performance' ? 1 : 1.7),
      );
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-label', file ? 'مدل GLB تعاملی' : 'دموی سه‌بعدی اتاق');
      renderer.domElement.tabIndex = 0;
      const camera = new T.PerspectiveCamera(42, 1, 0.01, 1000);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 0.3;
      controls.maxDistance = 40;
      controls.maxPolarAngle = Math.PI * 0.89;
      controls.target.set(0, 0.7, 0);
      camera.position.set(9, 7, 10);
      controls.update();
      const reset = () => {
        camera.position.set(9, 7, 10);
        controls.target.set(0, 0.7, 0);
        camera.fov = 42;
        camera.updateProjectionMatrix();
        controls.update();
      };
      actions.current = {
        reset,
        zoom: (n) => {
          camera.position.sub(controls.target).multiplyScalar(n).add(controls.target);
          controls.update();
        },
      };
      scene.add(new T.HemisphereLight('#d9f6ff', '#73644e', 3));
      const sun = new T.DirectionalLight('#ffe7c4', 4);
      sun.position.set(-3, 8, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -8;
      sun.shadow.camera.right = 8;
      sun.shadow.camera.top = 8;
      sun.shadow.camera.bottom = -8;
      sun.shadow.normalBias = 0.04;
      scene.add(sun);
      scene.add(new T.AmbientLight('#ffffff', 0.25));
      const key = (e: KeyboardEvent) => {
        if (
          !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)
        )
          return;
        e.preventDefault();
        const delta = new T.Vector3();
        camera.getWorldDirection(delta);
        delta.y = 0;
        delta.normalize().multiplyScalar(0.2);
        if (['ArrowDown', 's'].includes(e.key)) delta.negate();
        if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) {
          delta.cross(camera.up);
          if (['ArrowLeft', 'a'].includes(e.key)) delta.negate();
        }
        controls.target.add(delta);
        camera.position.add(delta);
      };
      renderer.domElement.addEventListener('keydown', key);
      if (file) {
        const loader = new GLTFLoader();
        const manager = loader.manager;
        manager.setURLModifier((url) => {
          if (!url.startsWith('data:') && !url.startsWith('blob:'))
            throw new Error(
              'GLB باید مستقل باشد؛ منابع خارجی برای حفظ حریم خصوصی بارگذاری نمی‌شوند.',
            );
          return url;
        });
        file
          .arrayBuffer()
          .then((data) => {
            if (disposed) return;
            loader.parse(
              data,
              '',
              (gltf) => {
                if (disposed) {
                  disposeObject(gltf.scene);
                  return;
                }
                const b = new T.Box3().setFromObject(gltf.scene);
                if (b.isEmpty()) {
                  setError('مدل هندسه قابل نمایش ندارد.');
                  disposeObject(gltf.scene);
                  return;
                }
                const c = b.getCenter(new T.Vector3());
                const size = b.getSize(new T.Vector3()).length();
                gltf.scene.position.sub(c);
                scene.add(gltf.scene);
                const fit = () => {
                  camera.position.set(size * 0.9, size * 0.6, size * 0.9);
                  controls.target.set(0, 0, 0);
                  camera.near = Math.max(size / 10000, 0.001);
                  camera.far = Math.max(size * 100, 100);
                  camera.updateProjectionMatrix();
                  controls.maxDistance = size * 10;
                  controls.minDistance = size / 1000;
                  controls.update();
                };
                fit();
                actions.current.reset = fit;
                setLoading(false);
              },
              () => {
                if (!disposed) {
                  setError('بارگذاری GLB ناموفق بود. فایل سالم و مستقل نسخه ۲ انتخاب کنید.');
                  setLoading(false);
                }
              },
            );
          })
          .catch(() => {
            if (!disposed) {
              setError('خواندن مدل ممکن نشد.');
              setLoading(false);
            }
          });
      } else {
        makeRoom(scene);
        setLoading(false);
      }
      const resize = () => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      observer = new ResizeObserver(resize);
      observer.observe(el);
      resize();
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
      const contextLost = (e: Event) => {
        e.preventDefault();
        setError('ارتباط با پردازنده گرافیکی قطع شد؛ صفحه را دوباره باز کنید.');
      };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      cleanup = () => {
        observer.disconnect();
        renderer.setAnimationLoop(null);
        renderer.domElement.removeEventListener('keydown', key);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        controls.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    } catch {
      setError('WebGL در این مرورگر در دسترس نیست. مرورگر و شتاب گرافیکی را بررسی کنید.');
      setLoading(false);
    }
    return () => {
      disposed = true;
      cleanup();
      disposeObject(scene);
    };
  }, [file, preferences.quality]);
  return (
    <div className={`viewer ${hero ? 'hero-viewer' : ''}`} data-testid="three-viewer">
      <div className="canvas-host" ref={host} dir="ltr" />
      {loading && !error && <div className="viewer-message">در حال بارگذاری صحنه…</div>}
      {error && (
        <div role="alert" className="viewer-message error">
          {error}
        </div>
      )}
      <div className="viewer-label">
        <span className="pulse" />
        {file ? 'GLB · نمایشگر محلی' : 'دموی سه‌بعدی · استودیوی آرام'}
      </div>
      <div className="viewer-tools">
        <button
          aria-label="بازنشانی دوربین"
          title="بازنشانی دوربین"
          onClick={() => actions.current.reset()}
        >
          <RotateCcw size={17} />
        </button>
        <button aria-label="بزرگ‌نمایی" onClick={() => actions.current.zoom(0.85)}>
          <ZoomIn size={17} />
        </button>
        <button aria-label="کوچک‌نمایی" onClick={() => actions.current.zoom(1.15)}>
          <ZoomOut size={17} />
        </button>
        <button
          aria-label="تمام‌صفحه"
          onClick={() => {
            const target = host.current?.parentElement;
            if (document.fullscreenElement)
              document.exitFullscreen().catch(() => toast.error('خروج از تمام‌صفحه ممکن نشد.'));
            else if (target?.requestFullscreen)
              target.requestFullscreen().catch(() => toast.error('تمام‌صفحه در دسترس نیست.'));
            else toast.error('مرورگر از تمام‌صفحه پشتیبانی نمی‌کند.');
          }}
        >
          <Maximize size={17} />
        </button>
      </div>
      <div className="viewer-hint">
        <Scan size={15} /> بکشید و فضا را کشف کنید <span>SCROLL TO ZOOM</span>
      </div>
    </div>
  );
}
