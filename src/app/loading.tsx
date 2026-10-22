export default function Loading() {
  return (
    <div className="container page" aria-label="در حال بارگذاری">
      <div className="skeleton" style={{ height: 70, width: '55%' }} />
      <div className="grid three">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton" style={{ height: 320 }} />
        ))}
      </div>
    </div>
  );
}
