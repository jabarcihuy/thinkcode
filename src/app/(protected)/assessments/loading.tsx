
import { useText } from "@/i18n/use-text";
import { PageLoading } from "@/components/layout/page-loading";

export default function AssessmentsLoading() {
  const tx = useText();

  return <PageLoading label={tx("Menyiapkan assessment")} />;
}
