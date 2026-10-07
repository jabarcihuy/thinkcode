import { GUEST_LOCAL_PREFIX } from "../domain/local-progress";
export function resetGuestStorage(storage: Pick<Storage, "length" | "key" | "removeItem">): boolean {
 try {
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter((key): key is string => Boolean(key?.includes(GUEST_LOCAL_PREFIX)));
  keys.forEach((key) => storage.removeItem(key));
  return true;
 } catch { return false; }
}
