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
    receiptType: "fee",
    payerName: "",
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
    if (formData.receiptType === "fee") {
      if (!selectedStudent) e.student = "Please select a student";
      if (!formData.feeMonth) e.feeMonth = "Fee month is required";
      if (!formData.feeYear.trim()) e.feeYear = "Year is required";
    } else {
      if (!formData.payerName.trim()) e.payerName = "Name is required";
    }

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
      const payload = {
        receiptNumber,
        receiptType: formData.receiptType,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        status: formData.status,
        portal: PORTAL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (formData.receiptType === "fee") {
        payload.studentName = selectedStudent.name;
        payload.studentDocId = selectedStudent.id;
        payload.studentRollNumber = selectedStudent.rollNumber || "";
        payload.studentClass = selectedStudent.class;
        payload.studentPhone = selectedStudent.phone || "";
        payload.feeMonth = formData.feeMonth;
        payload.feeYear = formData.feeYear;
      } else {
        payload.payerName = formData.payerName;
      }

      await addDoc(collection(db, COLLECTION), payload);
      toast.success("Receipt added successfully");
      router.push(`/${PORTAL}/receipts`);
    } catch (err) {
      console.error("Receipt add error:", err);
      toast.error("Failed to add receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <Link href={`/${PORTAL}/receipts`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand transition-colors mb-3">
          <ArrowLeft size={13} /> Back to Receipts
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900">Add New Receipt</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Record a fee payment for a student</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Type & Student/Payer Details */}
        <div className="bg-white border border-[#E8DFD4] rounded-lg p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand mb-3">Receipt Category</p>
          <Select value={formData.receiptType} onValueChange={(v) => handleSelect("receiptType", v)}>
            <SelectTrigger className="h-9 text-sm border-[#E8DFD4] mb-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="fee">Student Fee</SelectItem>
              <SelectItem value="donation">Donation</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>

          {formData.receiptType === "fee" ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand mb-3 mt-4 pt-4 border-t border-[#E8DFD4]">Select Student</p>

          <div className="relative">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudent(null); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className={`input pl-8 text-sm ${errors.student ? "input-error" : ""}`}
                placeholder={studentsLoading ? "Loading students…" : "Search by name, roll number or class…"}
                disabled={studentsLoading}
              />
            </div>
            {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}

            {showDropdown && filteredStudents.length > 0 && !selectedStudent && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#E8DFD4] rounded-lg shadow-lg overflow-hidden">
                {filteredStudents.map((s) => (
                  <button key={s.id} type="button" onClick={() => handleStudentSelect(s)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F5EFE8] transition-colors border-b border-[#F0E8E0] last:border-0">
                    <div className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0">
                      <User size={12} className="text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 leading-tight">{s.name}</p>
                      <p className="text-[11px] text-neutral-500">{s.rollNumber} · {s.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="mt-2.5 flex items-center gap-2.5 p-2.5 bg-[#F0FAF4] border border-[#C2E0CE] rounded-md">
              <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0">
                <User size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">{selectedStudent.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {selectedStudent.rollNumber && `${selectedStudent.rollNumber} · `}{selectedStudent.class}{selectedStudent.phone ? ` · ${selectedStudent.phone}` : ""}
                </p>
              </div>
              <button type="button" onClick={() => { setSelectedStudent(null); setStudentSearch(""); }}
                className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors shrink-0">Change</button>
            </div>
          )}
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand mb-3 mt-4 pt-4 border-t border-[#E8DFD4]">Payer Details</p>
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Name <span className="text-red-500">*</span></label>
                <input name="payerName" value={formData.payerName} onChange={handleChange}
                  className={`input h-9 text-sm ${errors.payerName ? "input-error" : ""}`} placeholder="Enter name" />
                {errors.payerName && <p className="text-xs text-red-500 mt-1">{errors.payerName}</p>}
              </div>
            </>
          )}
        </div>

        {/* Fee Details */}
        <div className="bg-white border border-[#E8DFD4] rounded-lg p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand mb-3">Fee Details</p>

          <div className="grid grid-cols-2 gap-3">
            {formData.receiptType === "fee" && (
              <>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Fee Month <span className="text-red-500">*</span></label>
                  <Select value={formData.feeMonth} onValueChange={(v) => handleSelect("feeMonth", v)}>
                    <SelectTrigger className={`h-9 text-sm ${errors.feeMonth ? "border-red-500" : "border-[#E8DFD4]"}`}>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.feeMonth && <p className="text-xs text-red-500 mt-1">{errors.feeMonth}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Year <span className="text-red-500">*</span></label>
                  <input name="feeYear" value={formData.feeYear} onChange={handleChange}
                    className={`input h-9 text-sm ${errors.feeYear ? "input-error" : ""}`} placeholder="2026" />
                  {errors.feeYear && <p className="text-xs text-red-500 mt-1">{errors.feeYear}</p>}
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-neutral-700 mb-1 block">Amount (Rs.) <span className="text-red-500">*</span></label>
              <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange}
                className={`input h-9 text-sm ${errors.amount ? "input-error" : ""}`} placeholder="0.00" />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Method <span className="text-red-500">*</span></label>
              <Select value={formData.paymentMethod} onValueChange={(v) => handleSelect("paymentMethod", v)}>
                <SelectTrigger className={`h-9 text-sm ${errors.paymentMethod ? "border-red-500" : "border-[#E8DFD4]"}`}>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-xs text-red-500 mt-1">{errors.paymentMethod}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Date <span className="text-red-500">*</span></label>
              <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange}
                className={`input h-9 text-sm ${errors.paymentDate ? "input-error" : ""}`} />
              {errors.paymentDate && <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 mb-1 block">Status</label>
              <Select value={formData.status} onValueChange={(v) => handleSelect("status", v)}>
                <SelectTrigger className="h-9 text-sm border-[#E8DFD4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-neutral-700 mb-1 block">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2}
                className="input text-sm h-auto py-2 resize-none" placeholder="Additional notes (optional)" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pb-2">
          <Link href={`/${PORTAL}/receipts`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-[#E8DFD4] rounded-md hover:bg-[#F5EFE8] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand/90 transition-colors disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Receipt</>}
          </button>
        </div>
      </form>
    </div>
  );
}
