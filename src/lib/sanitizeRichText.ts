import DOMPurify from "dompurify";

let hooksInstalled = false;

const allowedStyleProps = new Set([
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-decoration",
  "color",
]);

function installHooksOnce() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "style") return;

    // Keep only a very small allowlist of inline CSS properties.
    const sanitized = String(data.attrValue)
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((decl) => {
        const [rawProp, ...rest] = decl.split(":");
        const prop = (rawProp || "").trim().toLowerCase();
        const value = rest.join(":").trim();
        if (!prop || !value) return null;
        if (!allowedStyleProps.has(prop)) return null;
        return `${prop}: ${value}`;
      })
      .filter(Boolean)
      .join("; ");

    data.attrValue = sanitized;
    if (!sanitized) {
      data.keepAttr = false;
    }
  });
}

const DEFAULT_ALLOWED_TAGS = [
  "p",
  "br",
  "div",
  "span",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
];

const DEFAULT_ALLOWED_ATTR = ["style"];

const DEFAULT_FORBID_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
];

/**
 * Sanitizes rich text HTML to prevent XSS while keeping basic formatting.
 */
export function sanitizeRichText(html: string): string {
  installHooksOnce();

  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    FORBID_TAGS: DEFAULT_FORBID_TAGS,
  }) as string;
}
