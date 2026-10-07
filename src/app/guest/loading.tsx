
import { useText } from "@/i18n/use-text";
export default function GuestLoading() {
  const tx = useText();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-12">
      <p
        role="status"
        className="animate-pulse text-sm text-muted-foreground motion-reduce:animate-none"
      >
        {tx("Menyiapkan percobaan…")}</p>
    </main>
  );
}
