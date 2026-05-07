"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Search, User } from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection, addDoc, getDocs, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import { PAYMENT_METHODS, MONTHS } from "@/src/lib/constants";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/src/context/AuthContext";

const COLLECTION = "girls_receipts";
const STUDENTS_COLLECTION = "girls_students";
const PORTAL = "girls";

export default function AddReceiptPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    feeMonth: "",
    feeYear: String(new Date().getFullYear()),
    amount: "",
    paymentMethod: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "paid",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, STUDENTS_COLLECTION), orderBy("name"))
        );
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load students");
      } finally {
        setStudentsLoading(false);
      }
    })();
  }, [userProfile]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    if (!q) return students.slice(0, 8);
    return students
      .filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.class?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [students, studentSearch]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    setShowDropdown(false);
    if (errors.student) setErrors((prev) => ({ ...prev, student: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!selectedStudent) e.student = "Please select a student";
    if (!formData.feeMonth) e.feeMonth = "Fee month is required";
    if (!formData.feeYear.trim()) e.feeYear = "Year is required";
    if (!formData.amount) e.amount = "Amount is required";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (!formData.paymentMethod) e.paymentMethod = "Payment method is required";
    if (!formData.paymentDate) e.paymentDate = "Payment date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const receiptNumber = `RCP-G-${Date.now()}`;
      await addDoc(collection(db, COLLECTION), {
        receiptNumber,
        studentName: selectedStudent.name,
        studentDocId: selectedStudent.id,
        studentRollNumber: selectedStudent.rollNumber || "",
        studentClass: selectedStudent.class,
        studentPhone: selectedStudent.phone || "",
        feeMonth: formData.feeMonth,
        feeYear: formData.feeYear,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        status: formData.status,
        portal: PORTAL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Receipt added successfully");
      router.push(`/${PORTAL}/receipts`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${PORTAL}/receipts`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} /> Receipts
        </Link>
        <h1 className="text-xl font-medium text-neutral-900">Add New Receipt</h1>
        <p className="text-sm text-neutral-600 mt-0.5">Record a fee payment receipt</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl space-y-5">
          {/* Student Selection */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="section-header">Select Student</div>
            <div className="relative">
              <label className="label label-required">Student</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudent(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={`input pl-9 ${errors.student ? "input-error" : ""}`}
                  placeholder={studentsLoading ? "Loading students…" : "Search by name, roll number or class"}
                  disabled={studentsLoading}
                />
              </div>
              {errors.student && <p className="text-sm text-red-500 mt-1">{errors.student}</p>}

              {showDropdown && filteredStudents.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-[#E8DFD4] rounded-md shadow-md overflow-hidden">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStudentSelect(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F5EFE8] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                        <User size={14} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{s.name}</p>
                        <p className="text-xs text-neutral-500">{s.rollNumber} · {s.class}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="mt-3 p-3 bg-[#F5EFE8] rounded border border-[#E8DFD4]">
                <p className="text-sm font-medium text-neutral-900">{selectedStudent.name}</p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {selectedStudent.rollNumber && `${selectedStudent.rollNumber} · `}
                  {selectedStudent.class}
                  {selectedStudent.phone && ` · ${selectedStudent.phone}`}
                </p>
              </div>
            )}
          </div>

          {/* Fee Details */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="section-header">Fee Details</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label label-required">Fee Month</label>
                <Select value={formData.feeMonth} onValueChange={(v) => handleSelect("feeMonth", v)}>
                  <SelectTrigger className={`w-full h-9.5 ${errors.feeMonth ? "border-red-500" : "border-[#E8DFD4]"}`}>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.feeMonth && <p className="text-sm text-red-500 mt-1">{errors.feeMonth}</p>}
              </div>

              <div>
                <label className="label label-required">Year</label>
                <input name="feeYear" value={formData.feeYear} onChange={handleChange}
                  className={`input ${errors.feeYear ? "input-error" : ""}`} placeholder="2026" />
                {errors.feeYear && <p className="text-sm text-red-500 mt-1">{errors.feeYear}</p>}
              </div>

              <div>
                <label className="label label-required">Amount (Rs.)</label>
                <input name="amount" type="number" min="0" step="0.01" value={formData.amount}
                  onChange={handleChange}
                  className={`input ${errors.amount ? "input-error" : ""}`} placeholder="0.00" />
                {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="label label-required">Payment Method</label>
                <Select value={formData.paymentMethod} onValueChange={(v) => handleSelect("paymentMethod", v)}>
                  <SelectTrigger className={`w-full h-9.5 ${errors.paymentMethod ? "border-red-500" : "border-[#E8DFD4]"}`}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>}
              </div>

              <div>
                <label className="label label-required">Payment Date</label>
                <input type="date" name="paymentDate" value={formData.paymentDate}
                  onChange={handleChange}
                  className={`input ${errors.paymentDate ? "input-error" : ""}`} />
                {errors.paymentDate && <p className="text-sm text-red-500 mt-1">{errors.paymentDate}</p>}
              </div>

              <div>
                <label className="label">Status</label>
                <Select value={formData.status} onValueChange={(v) => handleSelect("status", v)}>
                  <SelectTrigger className="w-full h-9.5 border-[#E8DFD4]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange}
                  rows={3} className="input h-auto py-2.5 resize-none" placeholder="Additional notes (optional)" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E8DFD4]">
              <Link href={`/${PORTAL}/receipts`} className="btn-ghost">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Receipt</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
