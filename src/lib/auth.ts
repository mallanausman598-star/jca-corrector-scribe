// Simple client-side role helper. Admin = Frederick Usman (passcode-gated).
// Not cryptographically secure — explicit tradeoff per product decision.

const ROLE_KEY = "jca:role";
const ADMIN_PASSCODE = "JCA-ADMIN-2026";

export type Role = "admin" | "student";

export function getRole(): Role {
  if (typeof window === "undefined") return "student";
  try {
    return localStorage.getItem(ROLE_KEY) === "admin" ? "admin" : "student";
  } catch {
    return "student";
  }
}

export function unlockAdmin(passcode: string): boolean {
  if (passcode.trim() !== ADMIN_PASSCODE) return false;
  localStorage.setItem(ROLE_KEY, "admin");
  return true;
}

export function logoutAdmin() {
  localStorage.removeItem(ROLE_KEY);
}
