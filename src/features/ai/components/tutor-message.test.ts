import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TutorMessageContent } from "./tutor-message";

describe("tutor response rendering", () => {
  it("renders readable prose and SQL without enabling provider HTML or external embeds", () => {
    const html = renderToStaticMarkup(createElement(TutorMessageContent, { content: '**Check the table**\n\n```sql\nSELECT name FROM students;\n```\n\n<script>alert(1)</script>\n\n![image](https://example.invalid/track)\n\n[link](javascript:alert(1))' }));
    expect(html).toContain("<strong>Check the table</strong>");
    expect(html).toContain("SELECT name FROM students;");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("href=");
  });
});
