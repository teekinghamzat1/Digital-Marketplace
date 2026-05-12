// @ts-ignore
import sanitizeHtml from "sanitize-html";

export function sanitizeInput<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeHtml(data, {
      allowedTags: [], // Strict: No HTML allowed for security
      allowedAttributes: {},
    }) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item)) as unknown as T;
  }

  if (data !== null && typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return data;
}
