import Link from "next/link";
import { ArrowUpRight, BookOpen, FlaskConical, MessagesSquare, MessageCircle } from "lucide-react";
import { FeatureArtwork } from "@/components/layout/feature-artwork";
import { useText } from "@/i18n/use-text";
import { guestHref } from "@/features/guest/domain/links";
import styles from "./mobile-lms.module.css";

export function LearningHomeTools({ materialsHref, total, guest }: {
  materialsHref: string;
  total: number;
  guest: boolean;
}) {
  const tx = useText();
  const href = (path: string) => guest ? guestHref(path) : path;
  return (
    <nav aria-label={tx("Jelajahi pembelajaran")} className={styles.tools}>
      <h2 className="text-xl font-semibold tracking-tight">{tx("Jelajahi pembelajaran")}</h2>
      <div className={styles.quickLinks}>
        <Link href={href(materialsHref)} className={styles.quickLink}>
          <BookOpen size={24} strokeWidth={1.7} aria-hidden="true" />
          <span className="font-semibold">{tx("Materi")}</span>
          <span className="text-sm text-muted-foreground">{total} · PDF</span>
          <ArrowUpRight size={18} aria-hidden="true" className={styles.cornerArrow} />
        </Link>
        <Link href={href("/lab")} className={`${styles.quickLink} ${styles.labLink}`}>
          <FlaskConical size={24} strokeWidth={1.7} aria-hidden="true" />
          <span className="font-semibold">{tx("Lab Materi")}</span>
          <span className="text-sm text-muted-foreground">{tx("Latihan inti")}</span>
          <ArrowUpRight size={18} aria-hidden="true" className={styles.cornerArrow} />
        </Link>
      </div>
      <Link href={href("/playground")} className={styles.sqlabLink}>
        <span className="min-w-0 flex-1"><span className="block text-xl font-semibold">SQLab</span><span className="mt-2 block text-sm leading-6">{tx("Dari ide menjadi database")}</span></span>
        <FeatureArtwork name="ai-schema" className="w-28" />
        <ArrowUpRight size={18} aria-hidden="true" className="shrink-0" />
      </Link>
      <div className={styles.supportLinks}>
        <Link href={href("/chatbot")}><MessagesSquare size={20} aria-hidden="true" />{tx("Chatbot")}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link href={href("/forum")}><MessageCircle size={20} aria-hidden="true" />{tx("Forum")}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </nav>
  );
}
