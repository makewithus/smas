"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Upload, X, Info } from "lucide-react";
import { toast } from "sonner";
import { CLASSES } from "@/src/lib/constants";
import { generateStudentId } from "@/src/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PORTAL = "boys";

export default function AddStudentPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    class: "",
    phone: "",
    parentName: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "active",
  });

  const [studentId, setStudentId] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Generate student ID on mount
  useEffect(() => {
    // In production, fetch from API
    const mockCount = 156;
    setStudentId(generateStudentId(PORTAL, mockCount));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = "Full name is required (min 2 characters)";
    }

    if (!formData.class) {
      newErrors.class = "Class is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent/Guardian name is required";
    }

    if (!formData.admissionDate) {
      newErrors.admissionDate = "Admission date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Student added successfully");
      router.push(`/${PORTAL}/students`);
    } catch (error) {
      toast.error("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${PORTAL}/students`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        >
          <ArrowLeft size={16} />
          Students
        </Link>
        <h1 className="text-xl font-medium text-neutral-900">
          Add New Student
        </h1>
        <p className="text-sm text-neutral-600 mt-0.5">
          Fill in the student information below
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form Card */}
          <div className="lg:col-span-3 bg-white border border-[#E8DFD4] rounded-md p-6">
            {/* Personal Information Section */}
            <div className="section-header">Personal Information</div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="label label-required">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input ${errors.fullName ? "input-error" : ""}`}
                  placeholder="Enter student full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="label label-required">Class</label>
                <Select
                  value={formData.class}
                  onValueChange={(value) => handleSelectChange("class", value)}
                >
                  <SelectTrigger
                    className={`w-full h-9.5 ${errors.class ? "border-red-500" : "border-[#E8DFD4]"}`}
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class && (
                  <p className="text-sm text-red-500 mt-1">{errors.class}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label label-required">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input ${errors.phone ? "input-error" : ""}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Parent Name */}
              <div>
                <label className="label label-required">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className={`input ${errors.parentName ? "input-error" : ""}`}
                  placeholder="Enter parent/guardian name"
                />
                {errors.parentName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.parentName}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="input h-auto py-2.5 resize-none"
                  placeholder="Enter address (optional)"
                />
              </div>
            </div>

            {/* Enrollment Details Section */}
            <div className="section-header mt-6">Enrollment Details</div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Student ID */}
              <div>
                <label className="label">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  readOnly
                  className="input bg-surface text-neutral-600 font-mono cursor-default"
                />
              </div>

              {/* Admission Date */}
              <div>
                <label className="label label-required">Admission Date</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className={`input ${errors.admissionDate ? "input-error" : ""}`}
                />
                {errors.admissionDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.admissionDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="label label-required">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="w-full h-9.5 border-[#E8DFD4]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E8DFD4]">
              <Link href={`/${PORTAL}/students`} className="btn-ghost">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Student
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Photo Card */}
          <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-6 h-fit">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">
              Profile Photo
            </h3>

            {photoPreview ? (
              <div className="text-center">
                <div className="w-30 h-30 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#E8DFD4]">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-neutral-600 mb-1">
                  {photoFile?.name}
                </p>
                <p className="text-xs text-neutral-500 mb-3">
                  {(photoFile?.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <X size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-[#E8DFD4] rounded-md p-8 text-center hover:border-brand hover:bg-brand/5 transition-colors">
                  <Upload size={32} className="mx-auto text-neutral-400 mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-neutral-600">or drag and drop</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    JPG, PNG up to 2MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Photo Guidelines */}
            <div className="mt-4 p-3 bg-surface border border-[#E8DFD4] rounded-md">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-xs text-neutral-600">
                  Upload a clear, front-facing photo of the student. The photo
                  should be well-lit and recent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
