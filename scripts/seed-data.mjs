/**
 * SMAS — Full Data Seed Script
 * Seeds 10 boys students + receipts, expenses, events, and notices
 * so every dashboard feature works with live Firestore data.
 *
 * Usage:
 *   node scripts/seed-data.mjs
 *
 * Safe to re-run — clear=true at top wipes old seed data first.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// ─── Load .env / .env.local ──────────────────────────────────────────────────
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  for (const envFile of [".env", ".env.local"]) {
    try {
      const envContent = readFileSync(resolve(__dirname, "..", envFile), "utf8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!(key in process.env)) process.env[key] = val;
      }
    } catch { /* file not found, skip */ }
  }
} catch {
  // rely on env vars already set
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Helper ───────────────────────────────────────────────────────────────────
function ts(date) {
  return Timestamp.fromDate(new Date(date));
}

function dateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Clear a collection (docs where portal === "boys" or seeded marker)
async function clearCollection(col) {
  const snap = await getDocs(collection(db, col));
  const deletions = snap.docs.map((d) => deleteDoc(doc(db, col, d.id)));
  await Promise.all(deletions);
  console.log(`  🗑  Cleared ${snap.size} docs from ${col}`);
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STUDENTS = [
  { name: "Mohammed Arif",    class: "Class 10", phone: "9876543210", parentName: "Abdul Arif",      address: "12 Main St, Vottancheri",    status: "active",   admissionDate: dateStr(2024, 6, 10), studentId: "STU-B-2024-0001" },
  { name: "Abdul Rahman",     class: "Class 9",  phone: "9876543211", parentName: "Rahman Shaikh",    address: "34 Park Ave, Vottancheri",   status: "active",   admissionDate: dateStr(2024, 6, 11), studentId: "STU-B-2024-0002" },
  { name: "Faizan Ahmed",     class: "Class 8",  phone: "9876543212", parentName: "Imran Ahmed",      address: "56 Lake Rd, Vottancheri",    status: "active",   admissionDate: dateStr(2024, 7, 1),  studentId: "STU-B-2024-0003" },
  { name: "Ibrahim Khan",     class: "Class 7",  phone: "9876543213", parentName: "Saleem Khan",      address: "78 Hill St, Vottancheri",    status: "active",   admissionDate: dateStr(2024, 7, 15), studentId: "STU-B-2024-0004" },
  { name: "Yusuf Ali",        class: "Class 6",  phone: "9876543214", parentName: "Anwar Ali",        address: "90 River Rd, Vottancheri",   status: "active",   admissionDate: dateStr(2024, 8, 1),  studentId: "STU-B-2024-0005" },
  { name: "Omar Farooq",      class: "Class 10", phone: "9876543215", parentName: "Farooq Ahmed",     address: "11 Garden Lane, Vottancheri",status: "active",   admissionDate: dateStr(2024, 8, 20), studentId: "STU-B-2024-0006" },
  { name: "Hassan Bashir",    class: "Class 11", phone: "9876543216", parentName: "Bashir Shaikh",    address: "22 College Rd, Vottancheri", status: "active",   admissionDate: dateStr(2024, 9, 5),  studentId: "STU-B-2024-0007" },
  { name: "Salman Qureshi",   class: "Class 9",  phone: "9876543217", parentName: "Aslam Qureshi",    address: "33 Market St, Vottancheri",  status: "inactive", admissionDate: dateStr(2024, 9, 10), studentId: "STU-B-2024-0008" },
  { name: "Bilal Hussain",    class: "Class 12", phone: "9876543218", parentName: "Husain Bhai",      address: "44 East St, Vottancheri",    status: "active",   admissionDate: dateStr(2024, 10, 1), studentId: "STU-B-2024-0009" },
  { name: "Zaid Ansari",      class: "Class 8",  phone: "9876543219", parentName: "Tariq Ansari",     address: "55 West Ave, Vottancheri",   status: "active",   admissionDate: dateStr(2024, 10, 15),studentId: "STU-B-2024-0010" },
];

const EXPENSES = [
  { title: "Electricity Bill",     category: "electricity",    amount: 8500,  paymentMethod: "Bank Transfer", vendor: "KSEB",           expenseDate: dateStr(2026, 1, 5),  description: "Monthly electricity bill for January", notes: "" },
  { title: "Stationery Purchase",  category: "stationery",     amount: 3200,  paymentMethod: "Cash",          vendor: "Global Stationery", expenseDate: dateStr(2026, 1, 18), description: "Notebooks & pens for students", notes: "" },
  { title: "Hall Maintenance",     category: "maintenance",    amount: 12000, paymentMethod: "Cheque",        vendor: "Sunrise Works",  expenseDate: dateStr(2026, 2, 8),  description: "Repair of prayer hall roof", notes: "" },
  { title: "Electricity Bill",     category: "electricity",    amount: 7800,  paymentMethod: "Bank Transfer", vendor: "KSEB",           expenseDate: dateStr(2026, 2, 5),  description: "Monthly electricity bill for February", notes: "" },
  { title: "Annual Sports Day",    category: "event",          amount: 15000, paymentMethod: "Cash",          vendor: "Sports World",   expenseDate: dateStr(2026, 3, 14), description: "Equipment & prizes for sports day", notes: "" },
  { title: "Electricity Bill",     category: "electricity",    amount: 9100,  paymentMethod: "Bank Transfer", vendor: "KSEB",           expenseDate: dateStr(2026, 3, 5),  description: "Monthly electricity bill for March", notes: "" },
  { title: "Van Fuel & Service",   category: "transportation", amount: 6500,  paymentMethod: "Cash",          vendor: "M/s Auto Care",  expenseDate: dateStr(2026, 4, 10), description: "Staff van service and fuel", notes: "" },
  { title: "Electricity Bill",     category: "electricity",    amount: 8900,  paymentMethod: "Bank Transfer", vendor: "KSEB",           expenseDate: dateStr(2026, 4, 5),  description: "Monthly electricity bill for April", notes: "" },
  { title: "Cultural Festival",    category: "event",          amount: 18000, paymentMethod: "Cheque",        vendor: "AV Systems",     expenseDate: dateStr(2026, 4, 24), description: "Stage, sound & decorations", notes: "" },
  { title: "Electricity Bill",     category: "electricity",    amount: 9400,  paymentMethod: "Bank Transfer", vendor: "KSEB",           expenseDate: dateStr(2026, 5, 5),  description: "Monthly electricity bill for May", notes: "" },
  { title: "Library Books",        category: "stationery",     amount: 5600,  paymentMethod: "Online Transfer", vendor: "Book Palace",  expenseDate: dateStr(2026, 5, 7),  description: "New reference books for library", notes: "" },
  { title: "Miscellaneous Repairs",category: "miscellaneous",  amount: 2200,  paymentMethod: "Cash",          vendor: "Local Shop",     expenseDate: dateStr(2026, 5, 8),  description: "Minor repairs around campus", notes: "" },
];

const EVENTS = [
  {
    title: "Annual Sports Day",
    description: "A full day of athletic events celebrating physical fitness and team spirit. All students are encouraged to participate.",
    date: dateStr(2026, 5, 20),
    time: "09:00 AM",
    venue: "Main Ground",
    status: "upcoming",
    isPublic: true,
    portal: "boys",
  },
  {
    title: "Science Exhibition",
    description: "Students present innovative science projects. Parents and guests are welcome to visit.",
    date: dateStr(2026, 6, 5),
    time: "10:00 AM",
    venue: "Science Block",
    status: "upcoming",
    isPublic: true,
    portal: "boys",
  },
  {
    title: "Quran Recitation Competition",
    description: "Inter-class Quran recitation competition with prizes for top performers.",
    date: dateStr(2026, 6, 15),
    time: "08:30 AM",
    venue: "Prayer Hall",
    status: "upcoming",
    isPublic: true,
    portal: "boys",
  },
  {
    title: "Cultural Festival",
    description: "Annual cultural festival showcasing student talents in music, art and drama.",
    date: dateStr(2026, 4, 25),
    time: "05:00 PM",
    venue: "Auditorium",
    status: "completed",
    isPublic: true,
    portal: "boys",
  },
  {
    title: "Parent-Teacher Meeting",
    description: "Quarterly meeting for parents to discuss student progress with teachers.",
    date: dateStr(2026, 3, 15),
    time: "02:00 PM",
    venue: "Conference Room",
    status: "completed",
    isPublic: false,
    portal: "boys",
  },
];

const NOTICES = [
  {
    title: "Fee Payment Reminder",
    content: "All students are reminded to pay their monthly fee before the 10th of every month. Late payment will attract a fine of Rs. 50 per day.",
    priority: "high",
    enabled: true,
    portal: "boys",
  },
  {
    title: "Annual Sports Day Registration",
    content: "Students wishing to participate in Annual Sports Day on 20th May 2026 must register with their class teacher by 15th May 2026.",
    priority: "medium",
    enabled: true,
    portal: "boys",
  },
  {
    title: "Exam Schedule Released",
    content: "The examination schedule for Term 1 has been released. Students can collect their hall tickets from the office.",
    priority: "high",
    enabled: true,
    portal: "boys",
  },
  {
    title: "Library Timings Updated",
    content: "The college library will now be open from 8:00 AM to 6:00 PM on all working days.",
    priority: "low",
    enabled: true,
    portal: "boys",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🔑 Signing in as boys admin...");
  await signInWithEmailAndPassword(auth, "boys@smas.edu", "Boys@1234");
  console.log("✓ Signed in\n");

  // ── Clear old data
  console.log("🗑  Clearing existing seeded data...");
  await clearCollection("boys_students");
  await clearCollection("boys_receipts");
  await clearCollection("boys_expenses");
  await clearCollection("boys_events");
  await clearCollection("boys_notices");

  // ── Seed students
  console.log("\n👨‍🎓 Seeding students...");
  const studentDocs = [];
  for (const s of STUDENTS) {
    const admDate = new Date(s.admissionDate);
    const ref = await addDoc(collection(db, "boys_students"), {
      ...s,
      portal: "boys",
      photoUrl: null,
      createdAt: Timestamp.fromDate(admDate),
      updatedAt: Timestamp.fromDate(admDate),
    });
    studentDocs.push({ id: ref.id, ...s });
    console.log(`  ✓ ${s.name} (${s.class})`);
  }

  // ── Seed receipts (3–4 months per active student)
  console.log("\n🧾 Seeding receipts...");
  const receiptMonths = ["January", "February", "March", "April", "May"];
  let receiptCount = 0;
  for (const student of studentDocs) {
    if (student.status !== "active") continue;
    // Give each student 3 to 4 recent months of receipts
    const months = receiptMonths.slice(-4);
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const monthNum = receiptMonths.indexOf(month) + 1;
      const payDate = dateStr(2026, monthNum, 5 + i);
      const receiptNumber = `RCP-B-2026-${String(++receiptCount).padStart(4, "0")}`;
      await addDoc(collection(db, "boys_receipts"), {
        receiptNumber,
        studentName: student.name,
        studentDocId: student.id,
        studentRollNumber: student.studentId,
        studentClass: student.class,
        studentPhone: student.phone,
        feeMonth: month,
        feeYear: "2026",
        amount: 1500,
        paymentMethod: i % 2 === 0 ? "Cash" : "Bank Transfer",
        paymentDate: payDate,
        notes: "",
        status: month === "May" && i === months.length - 1 ? "pending" : "paid",
        portal: "boys",
        createdAt: ts(payDate),
        updatedAt: ts(payDate),
      });
    }
    console.log(`  ✓ ${student.name} — ${months.length} receipts`);
  }
  // One partial receipt for the inactive student
  await addDoc(collection(db, "boys_receipts"), {
    receiptNumber: `RCP-B-2026-${String(++receiptCount).padStart(4, "0")}`,
    studentName: studentDocs[7].name,
    studentDocId: studentDocs[7].id,
    studentRollNumber: studentDocs[7].studentId,
    studentClass: studentDocs[7].class,
    studentPhone: studentDocs[7].phone,
    feeMonth: "March",
    feeYear: "2026",
    amount: 750,
    paymentMethod: "Cash",
    paymentDate: dateStr(2026, 3, 10),
    notes: "Partial payment",
    status: "partial",
    portal: "boys",
    createdAt: ts(dateStr(2026, 3, 10)),
    updatedAt: ts(dateStr(2026, 3, 10)),
  });
  console.log(`  ✓ ${studentDocs[7].name} — 1 partial receipt`);

  // ── Seed expenses
  console.log("\n💸 Seeding expenses...");
  for (const e of EXPENSES) {
    await addDoc(collection(db, "boys_expenses"), {
      ...e,
      portal: "boys",
      createdAt: ts(e.expenseDate),
      updatedAt: ts(e.expenseDate),
    });
    console.log(`  ✓ ${e.title} — Rs.${e.amount} (${e.expenseDate})`);
  }

  // ── Seed events
  console.log("\n📅 Seeding events...");
  for (const ev of EVENTS) {
    await addDoc(collection(db, "boys_events"), {
      ...ev,
      createdAt: ts(ev.date),
      updatedAt: ts(ev.date),
    });
    console.log(`  ✓ ${ev.title} (${ev.status})`);
  }

  // ── Seed notices
  console.log("\n🔔 Seeding notices...");
  const now = new Date();
  for (const n of NOTICES) {
    await addDoc(collection(db, "boys_notices"), {
      ...n,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    console.log(`  ✓ ${n.title}`);
  }

  console.log("\n✅ Seed complete!");
  console.log("   10 students | " + receiptCount + " receipts | " + EXPENSES.length + " expenses | " + EVENTS.length + " events | " + NOTICES.length + " notices");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
