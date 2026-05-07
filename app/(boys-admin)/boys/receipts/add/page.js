"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Receipt, Search, X } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import { PAYMENT_METHODS, MONTHS } from "@/src/lib/constants";
import { generateReceiptNumber, formatCurrency } from "@/src/lib/utils";
import { useAuth } from '@/src/context/AuthContext'

export default function AddBoysReceiptPage() {
  const router = useRouter();
  const { userProfile } = useAuth()

  const searchParams = useSearchParams();
  const preSelectedStudentId = searchParams.get("studentId");

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    feeMonth: "",
    feeYear: new Date().getFullYear().toString(),
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    transactionId: "",
    notes: "",
    status: "paid",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userProfile) return
   fetchStudents();
  }, [userProfile?.uid]);

  useEffect(() => {
    if (preSelectedStudentId && students.length > 0) {
      const student = students.find((s) => s.id === preSelectedStudentId);
      if (student) {
        setSelectedStudent(student);
        setFormData((prev) => ({ ...prev, amount: student.monthlyFee?.toString() || "" }));
      }
    }
  }, [preSelectedStudentId, students]);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "boys_students");
      const q = query(studentsRef, orderBy("name"));
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone?.includes(searchQuery)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData((prev) => ({ ...prev, amount: student.monthlyFee?.toString() || "" }));
    setShowStudentSearch(false);
    setSearchQuery("");
    if (errors.student) {
      setErrors((prev) => ({ ...prev, student: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedStudent) newErrors.student = "Please select a student";
    if (!formData.feeMonth) newErrors.feeMonth = "Fee month is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.paymentDate) newErrors.paymentDate = "Payment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const receiptNumber = generateReceiptNumber("B");
      await addDoc(collection(db, "boys_receipts"), {
        receiptNumber,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentRollNumber: selectedStudent.rollNumber,
        studentClass: selectedStudent.class,
        studentPhone: selectedStudent.phone,
        feeMonth: `${formData.feeMonth} ${formData.feeYear}`,
        amount: parseFloat(formData.amount) || 0,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        transactionId: formData.transactionId,
        notes: formData.notes,
        status: formData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Receipt created successfully");
      router.push("/boys/receipts");
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast.error("Failed to create receipt");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (error) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      error ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Receipt"
        description="Generate a new fee receipt"
        actions={
          <Link
            href="/boys/receipts"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Select Student</h2>
            </div>
          </div>
          <div className="p-6">
            {selectedStudent ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {selectedStudent.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                    <p className="text-sm text-gray-600">
                      Roll: {selectedStudent.rollNumber} | Class: {selectedStudent.class}
                    </p>
                    <p className="text-sm text-gray-600">
                      Monthly Fee: {formatCurrency(selectedStudent.monthlyFee || 0)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search student by name, roll number, or phone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowStudentSearch(true);
                    }}
                    onFocus={() => setShowStudentSearch(true)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.student ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.student && (
                  <p className="mt-1 text-sm text-red-500">{errors.student}</p>
                )}

                {/* Student Search Results */}
                {showStudentSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="p-4 text-gray-500 text-center">No students found</p>
                    ) : (
                      filteredStudents.slice(0, 10).map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold">
                              {student.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              Roll: {student.rollNumber} | {student.class}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Receipt Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Month <span className="text-red-500">*</span>
                </label>
                <select
                  name="feeMonth"
                  value={formData.feeMonth}
                  onChange={handleChange}
                  className={inputClasses(errors.feeMonth)}
                >
                  <option value="">Select month</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                {errors.feeMonth && (
                  <p className="mt-1 text-sm text-red-500">{errors.feeMonth}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Year
                </label>
                <select
                  name="feeYear"
                  value={formData.feeYear}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={inputClasses(errors.amount)}
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={inputClasses(errors.paymentDate)}
                />
                {errors.paymentDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClasses()}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID / Reference
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className={inputClasses()}
                  placeholder="Enter transaction ID or reference number"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={inputClasses()}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/boys/receipts"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Receipt
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
