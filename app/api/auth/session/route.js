import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
} from "@/src/lib/security/session";

export const runtime = "nodejs";

const FIREBASE_LOOKUP_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

function fieldValue(field) {
  if (!field) return undefined;
  if ("stringValue" in field) return field.stringValue;
  if ("booleanValue" in field) return field.booleanValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  return undefined;
}

function parseFirestoreDocument(document) {
  const fields = document?.fields || {};
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fieldValue(value)]),
  );
}

async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key is not configured");

  const response = await fetch(`${FIREBASE_LOOKUP_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();
  if (!response.ok || !data.users?.[0]) {
    throw new Error("Invalid Firebase ID token");
  }

  return data.users[0];
}

async function fetchUserProfile(uid, idToken) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Firebase project id is not configured");

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("User profile not found");
  return parseFirestoreDocument(await response.json());
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const idToken = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!idToken) {
      return Response.json({ error: "Authentication token is required" }, { status: 401 });
    }

    const { portal, rememberMe } = await request.json().catch(() => ({}));
    const firebaseUser = await verifyFirebaseIdToken(idToken);
    const profile = await fetchUserProfile(firebaseUser.localId, idToken);

    if (profile.active !== true) {
      return Response.json({ error: "Account is not active" }, { status: 403 });
    }

    const sessionToken = await createSessionToken({
      uid: firebaseUser.localId,
      email: firebaseUser.email,
      role: profile.role,
      portal,
      active: profile.active,
      name: profile.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions(rememberMe),
    );

    return Response.json({
      ok: true,
      user: {
        uid: firebaseUser.localId,
        email: firebaseUser.email,
        role: profile.role,
        portal,
        name: profile.name || "Admin",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Session creation failed" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return Response.json({ authenticated: false }, { status: 401 });
    }
    const session = await verifySessionToken(token);
    if (!session) {
      return Response.json({ authenticated: false }, { status: 401 });
    }
    return Response.json({ authenticated: true, user: session });
  } catch (error) {
    return Response.json(
      { authenticated: false, error: error?.message || "Session verification failed" },
      { status: 401 }
    );
  }
}
