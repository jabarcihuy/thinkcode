import { useLocale } from "next-intl";
import en from "./messages/ui.en.json";
import id from "./messages/ui.id.json";
import { resolveLocale } from "./config";
import { createTextTranslator } from "./translate";
const translators = { en: createTextTranslator("en", en), id: createTextTranslator("id", id) };
export function useText() { return translators[resolveLocale(useLocale())]; }
