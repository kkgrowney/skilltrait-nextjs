import { auth } from "@/lib/firebase";

/** Adds the current Firebase ID token to a same-origin API request. */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Authentication required");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
