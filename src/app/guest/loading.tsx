export default function GuestLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-12">
      <p
        role="status"
        className="animate-pulse text-sm text-muted-foreground motion-reduce:animate-none"
      >
        Menyiapkan percobaan…
      </p>
    </main>
  );
}
