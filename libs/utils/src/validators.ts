const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidCard(digits: string): boolean {
  const cleaned = digits.replace(/\D/g, "");
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = cleaned.length - 1; i >= 0; i -= 1) {
    let n = parseInt(cleaned[i], 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isValidPhone(value: string): boolean {
  const d = value.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 15;
}
