"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, User, Phone, Home, CreditCard, Calendar } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import { CLASS_OPTIONS, FEE_TYPES, PAYMENT_STATUS, ROOMS } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function EditGirlStudentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth()

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    class: "",
    college: "",
    roomNumber: "",
    bedNumber: "",
    feeType: "monthly",
    monthlyFee: "",
    securityDeposit: "",
    admissionFee: "",
    joinDate: "",
    paymentStatus: "pending",
    aadharNumber: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyContactName: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const studentDoc = await getDoc(doc(db, "girls_students", id));
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setFormData({
          name: data.name || "",
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          phone: data.phone || "",
          alternatePhone: data.alternatePhone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          class: data.class || "",
          college: data.college || "",
          roomNumber: data.roomNumber || "",
          bedNumber: data.bedNumber || "",
          feeType: data.feeType || "monthly",
          monthlyFee: data.monthlyFee?.toString() || "",
          securityDeposit: data.securityDeposit?.toString() || "",
          admissionFee: data.admissionFee?.toString() || "",
          joinDate: data.joinDate || "",
          paymentStatus: data.paymentStatus || "pending",
          aadharNumber: data.aadharNumber || "",
          bloodGroup: data.bloodGroup || "",
          emergencyContact: data.emergencyContact || "",
          emergencyContactName: data.emergencyContactName || "",
          notes: data.notes || "",
        });
      } else {
        toast.error("Student not found");
        router.push("/girls/students");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Failed to fetch student details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (!formData.class) newErrors.class = "Class is required";
    if (!formData.monthlyFee) newErrors.monthlyFee = "Monthly fee is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "girls_students", id), {
        ...formData,
        monthlyFee: parseFloat(formData.monthlyFee) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        admissionFee: parseFloat(formData.admissionFee) || 0,
        updatedAt: serverTimestamp(),
      });
      toast.success("Student updated successfully");
      router.push(`/girls/students/${id}`);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = (error) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
      error ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  if (loading) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Student"
        description="Update student information"
        actions={
          <Link
            href={`/girls/students/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <User className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClasses(errors.name)}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className={inputClasses(errors.fatherName)}
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fatherName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother&apos;s Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className={inputClasses()}
                  maxLength={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Phone className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses(errors.phone)}
                  maxLength={10}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className={inputClasses()}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className={inputClasses()}
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Home className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={inputClasses()}
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Room Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Academic & Room Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className={inputClasses(errors.class)}
                >
                  <option value="">Select class</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
                {errors.class && <p className="mt-1 text-sm text-red-500">{errors.class}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College/School
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <select
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  <option value="">Select room</option>
                  {ROOMS.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                <input
                  type="text"
                  name="bedNumber"
                  value={formData.bedNumber}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className={inputClasses(errors.joinDate)}
                />
                {errors.joinDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.joinDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Fee Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                <select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  {FEE_TYPES.map((fee) => (
                    <option key={fee.value} value={fee.value}>
                      {fee.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Fee <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleChange}
                  className={inputClasses(errors.monthlyFee)}
                />
                {errors.monthlyFee && (
                  <p className="mt-1 text-sm text-red-500">{errors.monthlyFee}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Fee
                </label>
                <input
                  type="number"
                  name="admissionFee"
                  value={formData.admissionFee}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  {PAYMENT_STATUS.map((ps) => (
                    <option key={ps.value} value={ps.value}>
                      {ps.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
          </div>
          <div className="p-6">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className={inputClasses()}
              placeholder="Enter any additional notes about the student..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/girls/students/${id}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
