import Image from "next/image";

/** Decorative diagrams; the adjacent heading supplies the accessible meaning. */
export function FeatureArtwork({
  name,
  className = "",
}: {
  name: "learning-map" | "ai-schema" | "query-conversation";
  className?: string;
}) {
  return (
    <Image
      src={`/assets/quethink/${name}.svg`}
      width={240}
      height={144}
      alt=""
      aria-hidden="true"
      unoptimized
      className={`h-auto shrink-0 ${className}`}
    />
  );
}
