/** Digits only for comparison (ignores +, spaces, dashes). */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normalize to E.164-like `+...`.
 * UA helpers: `0XXXXXXXXX` / `380XXXXXXXXX` → `+380XXXXXXXXX`.
 */
export function normalizePhone(raw: string): string {
  let digits = phoneDigits(raw.trim());

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Local UA: 0501234567 → 380501234567
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `38${digits}`;
  }

  return `+${digits}`;
}

export function isValidPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  const local = uaLocalDigits(trimmed);
  // Full UA mobile: 0 + 9 digits
  if (local.length === 10 && local.startsWith("0")) {
    return true;
  }

  let digits = phoneDigits(
    trimmed.startsWith("00") ? trimmed.slice(2) : trimmed,
  );
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `38${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) return false;
  if (digits.startsWith("380") && digits.length !== 12) return false;

  return true;
}

export function parsePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Вкажіть номер телефону");
  }
  if (!isValidPhone(trimmed)) {
    throw new Error(PHONE_INVALID_MESSAGE);
  }
  return normalizePhone(trimmed);
}

/** Zod refine helper message */
export const PHONE_INVALID_MESSAGE =
  "Некоректний номер. Формат: +38 (0XX) XXX-XX-XX";

/** Duplicate phone for contact/client create */
export const CONTACT_PHONE_EXISTS_MESSAGE =
  "Даний контакт уже присутній у системі";

/** Locked UA prefix: country + opening paren + leading 0 */
export const UA_PHONE_MASK_PREFIX = "+38 (0";

/**
 * Local UA digits inside parentheses and after (max 10: 0XXXXXXXXX).
 * Parsed from after `(` so country `38` is never confused with local `0`.
 */
export function uaLocalDigits(raw: string): string {
  const paren = raw.indexOf("(");
  if (paren >= 0) {
    return phoneDigits(raw.slice(paren + 1)).slice(0, 10);
  }

  let digits = phoneDigits(raw);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("380")) return digits.slice(3, 13);
  if (digits.startsWith("38")) return digits.slice(2, 12);
  return digits.slice(0, 10);
}

/** Display mask: +38 (0XX) XXX-XX-XX — leading 0 always present */
export function formatUaPhoneMask(raw: string): string {
  let d = uaLocalDigits(raw);

  if (d.length === 0) {
    d = "0";
  } else if (!d.startsWith("0")) {
    d = `0${d}`;
  }
  d = d.slice(0, 10);

  let out = "+38 (";
  out += d.slice(0, 3);
  if (d.length <= 3) return out;

  out += `) ${d.slice(3, 6)}`;
  if (d.length <= 6) return out;

  out += `-${d.slice(6, 8)}`;
  if (d.length <= 8) return out;

  out += `-${d.slice(8, 10)}`;
  return out;
}
