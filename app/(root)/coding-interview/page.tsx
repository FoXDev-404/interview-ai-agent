import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

// Keep creation unified through the existing interview setup flow.
export default async function CodingInterviewEntryPage() {
  await requireAuth();
  redirect("/interview?type=Coding");
}
