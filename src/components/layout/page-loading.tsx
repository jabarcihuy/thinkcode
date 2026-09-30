export function PageLoading({ label = "Memuat halaman" }: { label?: string }) {
  return (
    <main id="main-content" className="page-loading" role="status" aria-live="polite" aria-atomic="true">
      <div className="page-loading__content">
        <span className="page-loading__track" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </main>
  );
}
