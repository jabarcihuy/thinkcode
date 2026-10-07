import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, resolveLocale } from "./config";
export default getRequestConfig(async () => ({
  locale: resolveLocale((await cookies()).get(localeCookie)?.value),
  timeZone: "Asia/Jakarta",
  messages: {},
}));
