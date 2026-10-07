import { expect, it } from "vitest";
import { guestHref } from "./links";
it.each([["/dashboard", "/guest"], ["/learn/database-fundamentals", "/guest?view=materials"], ["/learn/database-fundamentals/lessons/materi-1", "/guest/materials/materi-1"], ["/learn/database-fundamentals/lessons/materi-1/practice#lesson-practice", "/guest/lab/materi-1#lesson-practice"], ["/post-test", "/guest?view=post-test"], ["/admin", "/admin"]])("maps learner destination %s without granting admin access", (source, expected) => { expect(guestHref(source)).toBe(expected); });
