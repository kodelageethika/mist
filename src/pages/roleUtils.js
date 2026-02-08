// roleUtils.js (optional)
export function getRoleFromEmail(email) {
  if (!email || typeof email !== "string") return "unknown";
  const firstChar = email.trim()[0];
  return /\d/.test(firstChar) ? "student" : "teacher"; // number → student
}
