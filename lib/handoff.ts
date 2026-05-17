/**
 * Session Handoff — cross-subdomain auth for local development.
 *
 * Problem: Browsers don't reliably share cookies across localhost ↔ *.localhost,
 * so the session cookie set on localhost:3000 isn't sent to myotic.localhost:3000.
 *
 * Solution: After login on localhost:3000, we:
 *   1. Call GET /api/auth/handoff → get a signed, 30-second handoff token
 *   2. Navigate to myotic.localhost:3000/dashboard?__handoff=<token>
 *   3. The proxy reads __handoff, verifies it, sets the session cookie on the
 *      tenant subdomain, and redirects to the clean URL.
 *
 * Security: The token is HMAC-SHA256 signed with BETTER_AUTH_SECRET and expires
 * in 30 seconds. It is single-use via the redirect (browser discards the URL).
 */

const EXPIRY_MS = 30_000; // 30 seconds

function getSecret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "fallback-secret-change-me";
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "==".slice((padded.length + 3) % 4 || 4);
  return Uint8Array.from(atob(padded + pad), (c) => c.charCodeAt(0));
}

/**
 * Create a signed handoff token containing the session token.
 * Format: base64url(sessionToken).expiry.base64url(hmac_signature)
 */
export async function createHandoffToken(sessionToken: string): Promise<string> {
  const exp = Date.now() + EXPIRY_MS;
  const key = await getHmacKey();
  const message = `${sessionToken}:${exp}`;
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  const encodedToken = toBase64Url(new TextEncoder().encode(sessionToken).buffer as ArrayBuffer);
  return `${encodedToken}.${exp}.${toBase64Url(sig)}`;
}

/**
 * Verify a handoff token and return the embedded session token, or null if invalid/expired.
 */
export async function verifyHandoffToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedToken, expStr, sigStr] = parts;
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || Date.now() > exp) return null; // expired

    const sessionToken = new TextDecoder().decode(fromBase64Url(encodedToken));
    const message = `${sessionToken}:${exp}`;
    const sigBytes = fromBase64Url(sigStr);
    const sig = sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer;
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      new TextEncoder().encode(message)
    );

    return valid ? sessionToken : null;
  } catch {
    return null;
  }
}
