export const uploadToCloudinary = async (file) => {
  if (!file) return null;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing in environment variables (.env.local)");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
};

export const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const uploadIndex = parsed.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const afterUpload = parsed.pathname.slice(uploadIndex + "/upload/".length);
    const withoutTransforms = afterUpload.replace(
      /^(?:c_|e_|f_|g_|h_|q_|r_|t_|w_|x_|y_|z_|a_|b_|bo_|co_|d_|dl_|dn_|fl_|l_|o_|p_|pg_|u_)[^/]+\//,
      "",
    );
    const withoutVersion = withoutTransforms.replace(/^v\d+\//, "");
    return decodeURIComponent(withoutVersion).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

export const deleteFromCloudinary = async (urlOrPublicId) => {
  const publicId = extractCloudinaryPublicId(urlOrPublicId) || urlOrPublicId;
  if (!publicId) return;

  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete image from Cloudinary");
  }
};
