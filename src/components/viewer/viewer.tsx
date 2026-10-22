'use client';
import dynamic from 'next/dynamic';
const Three = dynamic(() => import('./three-viewer'), {
  ssr: false,
  loading: () => <div className="viewer skeleton" />,
});
const Splat = dynamic(() => import('./splat-viewer'), {
  ssr: false,
  loading: () => <div className="viewer skeleton" />,
});
export default function Viewer({
  file,
  format,
  hero,
}: {
  file?: Blob;
  format?: string;
  hero?: boolean;
}) {
  return file && format !== 'glb' ? (
    <Splat file={file} format={format ?? 'ply'} />
  ) : (
    <Three file={file} hero={hero} />
  );
}
