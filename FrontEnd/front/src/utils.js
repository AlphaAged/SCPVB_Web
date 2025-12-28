export function digitsOnly(s) {
  return (s || "").replace(/\D/g, "");
}

// input 10 digits -> "000000000-0"
export function formatStudentId(input) {
  const d = digitsOnly(input);
  if (d.length <= 9) return d;
  return `${d.slice(0, 9)}-${d.slice(9, 10)}`;
}

export function isStudentIdValidFormatted(s) {
  return /^[0-9]{9}-[0-9]{1}$/.test(s);
}

export function makeInternalEmail(studentIdFormatted) {
  return `${studentIdFormatted}@scpvb.local`;
}

export function isKkuMail(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@kkumail.com");
}

export function isThaiPhone10Digits(input) {
  const d = digitsOnly(input);
  return /^[0-9]{10}$/.test(d);
}
