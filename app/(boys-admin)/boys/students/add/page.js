"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { db, storage } from "@/src/lib/firebase";
import {
  collection, addDoc, getDocs, query,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { CLASSES } from "@/src/lib/constants";
import { generateStudentId } from "@/src/lib/utils";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "boys";
const COLLECTION = "boys_students";

export default function AddStudentPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    class: "",
    phone: "",
    parentName: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "active",
  });
  const [studentId, setStudentId] = useState("Generating…");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, COLLECTION));
        setStudentId(generateStudentId(PORTAL, snap.size));
      } catch {
        setStudentId(generateStudentId(PORTAL, 0));
      }
    })();
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.length < 2) e.name = "Full name required (min 2 chars)";
    if (!formData.class) e.class = "Class is required";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) e.phone = "Enter valid 10-digit number";
    if (!formData.parentName.trim()) e.parentName = "Parent/Guardian name required";
    if (!formData.admissionDate) e.admissionDate = "Admission date required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let photoUrl = null;
      if (photoFile) {
        try {
          const sRef = ref(storage, `students/${PORTAL}/${Date.now()}_${photoFile.name}`);
          await uploadBytes(sRef, photoFile);
          photoUrl = await getDownloadURL(sRef);
        } catch {
          // Photo upload optional — continue without it
        }
      }
      await addDoc(collection(db, COLLECTION), {
        ...formData,
        studentId,
        photoUrl,
        portal: PORTAL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Student added successfully");
      router.push(`/${PORTAL}/students`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${PORTAL}/students`} className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} /> Students
        </Link>
        <h1 className="text-xl font-medium text-neutral-900">Add New Student</h1>
        <p className="text-sm text-neutral-600 mt-0.5">Fill in the student information below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3 bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="section-header">Personal Information</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label label-required">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  className={`input ${errors.name ? "input-error" : ""}`} placeholder="Enter student full name" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label label-required">Class</label>
                <Select value={formData.class} onValueChange={(v) => handleSelect("class", v)}>
                  <SelectTrigger className={`w-full h-9.5 ${errors.class ? "border-red-500" : "border-[#E8DFD4]"}`}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.class && <p className="text-sm text-red-500 mt-1">{errors.class}</p>}
              </div>

              <div>
                <label className="label label-required">Phone Number</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  className={`input ${errors.phone ? "input-error" : ""}`} placeholder="10-digit phone number" />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="label label-required">Parent / Guardian Name</label>
                <input name="parentName" value={formData.parentName} onChange={handleChange}
                  className={`input ${errors.parentName ? "input-error" : ""}`} placeholder="Enter parent/guardian name" />
                {errors.parentName && <p className="text-sm text-red-500 mt-1">{errors.parentName}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange}
                  rows={3} className="input h-auto py-2.5 resize-none" placeholder="Enter address (optional)" />
              </div>
            </div>

            <div className="section-header mt-6">Enrollment Details</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Student ID</label>
                <input value={studentId} readOnly className="input bg-surface text-neutral-600 font-mono cursor-default" />
              </div>

              <div>
                <label className="label label-required">Admission Date</label>
                <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange}
                  className={`input ${errors.admissionDate ? "input-error" : ""}`} />
                {errors.admissionDate && <p className="text-sm text-red-500 mt-1">{errors.admissionDate}</p>}
              </div>

              <div>
                <label className="label label-required">Status</label>
                <Select value={formData.status} onValueChange={(v) => handleSelect("status", v)}>
                  <SelectTrigger className="w-full h-9.5 border-[#E8DFD4]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E8DFD4]">
              <Link href={`/${PORTAL}/students`} className="btn-ghost">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Student</>}
              </button>
            </div>
          </div>

          {/* Photo Card */}
          <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-6 h-fit">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">Profile Photo</h3>
            {photoPreview ? (
              <div className="text-center">
                <div className="w-30 h-30 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#E8DFD4]">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-neutral-600 mb-1">{photoFile?.name}</p>
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-[#E8DFD4] rounded-md p-8 text-center hover:border-brand hover:bg-brand/5 transition-colors">
                  <Upload size={32} className="mx-auto text-neutral-400 mb-3" />
                  <p className="text-sm font-medium text-neutral-900 mb-1">Click to upload</p>
                  <p className="text-xs text-neutral-600">JPG, PNG up to 2MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
