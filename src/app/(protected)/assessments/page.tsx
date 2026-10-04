import { redirect } from "next/navigation";
/** Preserve bookmarked assessment URLs while keeping one clear post-test entry. */
export default function AssessmentsPage() { redirect("/post-test"); }
