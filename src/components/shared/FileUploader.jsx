"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image } from "lucide-react";

export default function FileUploader({
  onFileSelect,
  accept = "image/*",
  maxSizeMB = 5,
  preview = true,
  label = "Upload File",
  currentUrl = null,
}) {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(currentUrl || null);
  }, [currentUrl]);

  const validate = (file) => {
    if (!file) return "No file selected";
    if (file.size > maxSizeMB * 1024 * 1024)
      return `File must be under ${maxSizeMB}MB`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (preview && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
    onFileSelect?.(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        className="rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative"
        style={{
          borderColor: dragging ? "#1B4332" : "#E8DFD4",
          background: dragging ? "#F5EFE8" : "#FAF6F1",
          minHeight: "120px",
          padding: "20px",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 rounded object-cover"
            />
            <button
              onClick={clear}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#3D3227" }}
            >
              <X size={11} color="white" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: "#F5EFE8" }}
            >
              <Upload size={18} style={{ color: "#1B4332" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#3D3227" }}>
              {label}
            </p>
            <p className="text-xs mt-1" style={{ color: "#8C7B6B" }}>
              Drag & drop or click to browse — max {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
