"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { deleteFromWaitlist } from "@/lib/db";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // Slow down brute-force attempts.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Wrong password" };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function removeSignup(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;
  await deleteFromWaitlist(id);
  revalidatePath("/admin");
}
