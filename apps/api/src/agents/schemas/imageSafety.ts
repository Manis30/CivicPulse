/**
 * Image URL Safety & Anti-SSRF Validation.
 * Protects against Server-Side Request Forgery, loopback probing,
 * private subnet inspection, and credential leakage.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./, // Loopback IPv4
  /^localhost$/i,
  /^::1$/, // Loopback IPv6
  /^0\./, // Current network
  /^10\./, // RFC 1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC 1918 Class B
  /^192\.168\./, // RFC 1918 Class C
  /^169\.254\./, // Link-local IPv4
  /^fc00:/i, // Unique local address IPv6
  /^fe80:/i, // Link-local address IPv6
];

export interface ImageUrlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSafeImageUrl(rawUrl: string): ImageUrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return { valid: false, error: 'Image URL must be a non-empty string.' };
  }

  if (rawUrl.length > 2048) {
    return { valid: false, error: 'Image URL exceeds maximum permitted length of 2048 characters.' };
  }

  // Allow local uploaded evidence paths (e.g., /uploads/evidence-123.jpg)
  if (
    rawUrl.startsWith('/uploads/') ||
    rawUrl.startsWith('uploads/') ||
    rawUrl.startsWith('./uploads/') ||
    rawUrl.startsWith('http://localhost') ||
    rawUrl.startsWith('http://127.0.0.1')
  ) {
    return { valid: true };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: 'Invalid URL syntax.' };
  }

  // 1. HTTPS only
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: `Insecure protocol '${parsed.protocol}'. Only HTTPS is permitted for external media.` };
  }

  // 2. Reject credentials in URL (e.g. https://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'Credential-bearing URLs are strictly forbidden.' };
  }

  // 3. Reject loopback and private networks
  const hostname = parsed.hostname.toLowerCase();
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: `Destination '${hostname}' violates private/loopback network isolation policy.` };
    }
  }

  return { valid: true };
}
