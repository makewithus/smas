import crypto from "crypto";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/src/lib/security/session";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await verifySessionToken(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== "string" || publicId.length > 255) {
      return Response.json({ error: "Cloudinary public id is required" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json(
        { error: "Cloudinary delete configuration is missing" },
        { status: 500 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok || data.result === "error") {
      return Response.json(
        { error: data.error?.message || "Cloudinary image delete failed" },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, result: data.result });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Cloudinary image delete failed" },
      { status: 500 },
    );
  }
}
