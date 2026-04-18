import DOMPurify from "dompurify";
import validator from "validator";

export const sanitizeText = (input) => {
  if (input == null) return "";
  const str = String(input);
  const stripped = DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return stripped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
};

export const sanitizeFields = (obj, keys) => {
  const out = { ...obj };
  for (const k of keys) {
    if (k in out) out[k] = sanitizeText(out[k]);
  }
  return out;
};

export const isValidEmail = (s) => validator.isEmail(String(s ?? ""));

export const isValidURL = (s) =>
  validator.isURL(String(s ?? ""), { require_protocol: false });
