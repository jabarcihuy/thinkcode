import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/features/learning/server/material-access", () => ({ getAccessibleMaterial: vi.fn() }));
vi.mock("@/features/learning/server/material-pdf", () => ({ createMaterialPdf: vi.fn() }));
import { getAccessibleMaterial } from "@/features/learning/server/material-access";
import { createMaterialPdf } from "@/features/learning/server/material-pdf";
import { GET } from "./route";
const params = Promise.resolve({ pathSlug: "database-fundamentals", lessonSlug: "membaca-bentuk-data" });
describe("PDF access boundary", () => {
  beforeEach(() => vi.resetAllMocks());
  it("does not generate a document without material access", async () => {
    vi.mocked(getAccessibleMaterial).mockResolvedValue(null);
    expect((await GET(new Request("http://localhost/pdf"), { params })).status).toBe(404);
    expect(createMaterialPdf).not.toHaveBeenCalled();
  });
  it("returns a safe unavailable message when dependencies fail", async () => {
    vi.mocked(getAccessibleMaterial).mockRejectedValue(new Error("private database information"));
    const response = await GET(new Request("http://localhost/pdf"), { params });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private database");
  });
});
