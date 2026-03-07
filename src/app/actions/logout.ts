"use server";

import baseUrl from "@/routes/index";

export async function logoutAction() {
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to log out");
  }
}
