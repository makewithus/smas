if (typeof window !== "undefined") {
  throw new Error("This module can only be executed on the server side");
}

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-smas_session"
    : "smas_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const ALLOWED_PORTALS = new Set(["boys", "girls"]);
const ROLE_PORTALS = {
  super_admin: ["boys", "girls"],
  boys_admin: ["boys"],
  girls_admin: ["girls"],
};

function base64UrlEncode(input) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 64) {
    throw new Error("AUTH_SESSION_SECRET must be a cryptographically strong key of at least 64 characters (512-bit)");
  }
  return secret;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(unsignedToken) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    new TextEncoder().encode(unsignedToken),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

function normalizePortal(portal) {
  return ALLOWED_PORTALS.has(portal) ? portal : null;
}

function canAccessPortal(role, portal) {
  return Boolean(normalizePortal(portal) && ROLE_PORTALS[role]?.includes(portal));
}

function sanitizeSessionPayload(payload) {
  const portal = normalizePortal(payload?.portal);
  if (!payload?.uid || !payload?.role || !portal) return null;
  if (!canAccessPortal(payload.role, portal)) return null;
  if (payload.active !== true) return null;
  return {
    uid: payload.uid,
    email: payload.email || "",
    role: payload.role,
    portal,
    active: true,
    name: payload.name || "Admin",
  };
}

async function createSessionToken(payload) {
  const safePayload = sanitizeSessionPayload(payload);
  if (!safePayload) throw new Error("Invalid session payload");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...safePayload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(body),
  )}`;
  return `${unsignedToken}.${await signPayload(unsignedToken)}`;
}

async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expected = await signPayload(unsignedToken);
  if (
    !timingSafeEqual(
      base64UrlDecode(signature),
      base64UrlDecode(expected),
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload)),
    );
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return sanitizeSessionPayload(payload);
  } catch {
    return null;
  }
}

function getSessionCookieOptions(rememberMe = false) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };
  if (rememberMe) {
    options.maxAge = SESSION_TTL_SECONDS;
  }
  return options;
}

export {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  canAccessPortal,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
};
