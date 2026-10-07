import Image from "next/image";

export function QuethinkLogo() {
  return <span className="inline-flex items-center gap-2">
    <Image src="/assets/quethink/quethink-mark.svg" width={28} height={28} alt="" aria-hidden="true" className="shrink-0" unoptimized />
    <span>Que<span className="text-primary">think</span></span>
  </span>;
}
