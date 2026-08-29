export const ADMIN_SESSION_COOKIE = "event_admin_session";
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const getAdminPassword = () => process.env.ADMIN_PASSWORD || "";

const toBase64Url = (value: Uint8Array) => {
  const binary = Array.from(value)
    .map((byte) => String.fromCharCode(byte))
    .join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return bytes;
};

const signSessionValue = async (value: string) => {
  const secret = getAdminPassword() || "local-admin-dev-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export function isAdminPasswordConfigured() {
  return getAdminPassword().length > 0;
}

export function isValidAdminPassword(candidate: string) {
  return getAdminPassword() !== "" && candidate === getAdminPassword();
}

export async function createAdminSessionToken() {
  const payload = JSON.stringify({
    authenticated: true,
    issuedAt: Date.now(),
  });

  const encoded = toBase64Url(new TextEncoder().encode(payload));
  const signature = await signSessionValue(encoded);

  return `${encoded}.${signature}`;
}

export async function verifyAdminSessionToken(cookieValue?: string | null) {
  if (!cookieValue || !isAdminPasswordConfigured()) {
    return false;
  }

  const parts = cookieValue.split(".");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  const [payloadBase64, signature] = parts;
  const expectedSignature = await signSessionValue(payloadBase64);

  if (expectedSignature !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadBase64))) as {
      authenticated?: boolean;
      issuedAt?: number;
    };

    if (!payload.authenticated || typeof payload.issuedAt !== "number") {
      return false;
    }

    return Date.now() - payload.issuedAt < ADMIN_SESSION_TTL_MS;
  } catch {
    return false;
  }
}
