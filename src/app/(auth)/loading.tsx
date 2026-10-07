
import { useText } from "@/i18n/use-text";
import { PageLoading } from "@/components/layout/page-loading";

export default function AuthLoading() {
  const tx = useText();

  return <PageLoading label={tx("Membuka halaman akun")} />;
}
