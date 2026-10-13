import { describe, it, expect, vi, beforeEach } from "vitest";
import { bearerToken, MobileError } from "./auth";
import { publicMobileExercise } from "./projection";
import type { PublicExercise } from "@/features/practice/types";
const dependencies = vi.hoisted(() => ({ overview: vi.fn() }));
vi.mock("@/features/learning/data/learning-repository", () => ({ loadLearningOverviewWithClient: dependencies.overview }));
import { requireMobileMaterial, activeMobileAssessment } from "./access";
import type { MobileActor } from "./auth";
const id = "10000000-0000-4000-8000-000000000001";
const rpc = vi.fn();
const actor = { userId: "verified-owner", db: { rpc }, role: "USER", displayName: null } as unknown as MobileActor;
beforeEach(() => { vi.resetAllMocks(); rpc.mockResolvedValue({ data: false, error: null }); dependencies.overview.mockResolvedValue({ lessons: [{ id, state: "AVAILABLE", readAt: "2026-10-13" }] }); });
describe("mobile bearer identity", () => {
  it("does not accept web cookies as authentication", () => expect(() => bearerToken(new Request("https://example.test", { headers: { cookie: "session=forged" } }))).toThrow(MobileError));
  it("requires a single bounded bearer token", () => { expect(bearerToken(new Request("https://example.test", { headers: { authorization: `Bearer ${"x".repeat(40)}` } }))).toBe("x".repeat(40)); for (const value of ["Basic x", "Bearer short", `Bearer ${"x".repeat(8200)}`, `Bearer ${"x".repeat(40)}, another`]) expect(() => bearerToken(new Request("https://example.test", { headers: { authorization: value } }))).toThrow(); });
});
describe("mobile server gates", () => {
  it("permits unlocked reading and core after reading", async () => { expect((await requireMobileMaterial(actor,id,true)).lesson.id).toBe(id); expect(dependencies.overview.mock.calls[0]?.[2]).toBe("verified-owner"); });
  it("denies direct locked URLs", async () => { dependencies.overview.mockResolvedValue({ lessons: [{ id, state: "LOCKED" }] }); await expect(requireMobileMaterial(actor,id)).rejects.toMatchObject({ status:403, code:"locked" }); });
  it("requires reading before Lab", async () => { dependencies.overview.mockResolvedValue({ lessons: [{ id, state:"AVAILABLE" }] }); await expect(requireMobileMaterial(actor,id,true)).rejects.toMatchObject({ code:"reading_required" }); });
  it("blocks Lab during an active assessment but allows reading review", async () => { rpc.mockResolvedValue({ data:true,error:null }); await expect(requireMobileMaterial(actor,id,true)).rejects.toMatchObject({ code:"assessment_active" }); expect((await requireMobileMaterial(actor,id)).active).toBe(true); });
  it("fails closed if assessment status is unavailable", async () => { rpc.mockResolvedValue({ data:null,error:{ message:"private failure" } }); await expect(activeMobileAssessment(actor)).rejects.toMatchObject({ status:503 }); });
  it("rejects missing and malformed material IDs", async () => { await expect(requireMobileMaterial(actor,"x")).rejects.toMatchObject({status:404}); await expect(requireMobileMaterial(actor,"20000000-0000-4000-8000-000000000002")).rejects.toMatchObject({status:404}); });
});
describe("public mobile projection", () => {
  it("allowlists public exercise data without answer keys or private test feedback", () => {
    const exercise: PublicExercise = { id,lessonId:id,type:"PSEUDOCODE",title:"Question",prompt:"Choose",starterCode:null,publicConfig:{ mode:"choice",options:[{id:"a",text:"A",secret:"never"}],answer:{choiceId:"a"},hiddenTests:[{input:"private"}],grading:{expected:"private"}},position:1,isRequired:true,passed:false,visibleTests:[] };
    const dto=publicMobileExercise(exercise,value=>value),serialized=JSON.stringify(dto);
    expect(dto.options).toEqual([{id:"a",text:"A"}]); for(const field of ["answer","hiddenTests","grading","private","secret"]) expect(serialized).not.toContain(field);
  });
});
