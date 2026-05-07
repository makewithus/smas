"use client";

import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ACCOUNTS = [
  {
    email: "boys@smas.edu",
    password: "Boys@1234",
    name: "Boys Portal Admin",
    role: "boys_admin",
    portal: "boys",
  },
  {
    email: "girls@smas.edu",
    password: "Girls@1234",
    name: "Girls Portal Admin",
    role: "girls_admin",
    portal: "girls",
  },
];

// ── Mock data generators ──────────────────────────────────────────────────

const BOYS_NAMES = [
  "Ahmed Hassan",
  "Muhammad Ali",
  "Ibrahim Khan",
  "Yusuf Malik",
  "Omar Farooq",
  "Bilal Siddiqui",
  "Hamza Sheikh",
  "Usman Raza",
  "Tariq Javed",
  "Zaid Iqbal",
  "Faisal Chaudhry",
  "Adnan Butt",
  "Saad Mirza",
  "Waqas Nawaz",
  "Rizwan Ahmed",
];
const GIRLS_NAMES = [
  "Fatima Zahra",
  "Aisha Bibi",
  "Zainab Hussain",
  "Maryam Noor",
  "Sana Khan",
  "Hira Malik",
  "Nadia Iqbal",
  "Rabia Sheikh",
  "Sumera Raza",
  "Bushra Javed",
  "Amina Siddiqui",
  "Sara Mirza",
  "Iqra Chaudhry",
  "Mehwish Butt",
  "Alina Nawaz",
];
const CLASSES = [
  "6-A",
  "6-B",
  "7-A",
  "7-B",
  "8-A",
  "8-B",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
];
const FEE_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const PAY_METHODS = ["Cash", "Online Transfer", "Cheque", "Bank Deposit"];
const EXPENSE_CATS = [
  "Utilities",
  "Maintenance",
  "Stationery",
  "Salary",
  "Transport",
  "Miscellaneous",
  "Cleaning",
  "Food",
];
const VENDORS = [
  "City Electric Co.",
  "Al-Rashid Suppliers",
  "Metro Mart",
  "Tech Solutions",
  "Local Vendor",
  "Khan Brothers",
  "Pak Stationers",
  "City Gas Dept.",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
};
const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return Timestamp.fromDate(d);
};

function makeStudents(names, prefix) {
  return names.map((name, i) => ({
    name,
    rollNumber: `${prefix}${String(i + 1).padStart(3, "0")}`,
    class: rand(CLASSES),
    phone: `03${randInt(10, 49)}${randInt(1000000, 9999999)}`,
    parentName: `${name.split(" ")[1]} (Father)`,
    parentPhone: `03${randInt(50, 69)}${randInt(1000000, 9999999)}`,
    address: `House ${randInt(1, 500)}, Street ${randInt(1, 30)}, ${rand(["Gulberg", "DHA", "Model Town", "Johar Town", "Bahria Town"])}`,
    admissionDate: daysAgo(randInt(90, 730)),
    feeAmount: rand([3500, 4000, 4500, 5000]),
    status: Math.random() > 0.1 ? "active" : "inactive",
    createdAt: daysAgo(randInt(90, 730)),
  }));
}

function makeReceipts(students, prefix) {
  const receipts = [];
  students.forEach((s, si) => {
    const count = randInt(1, 3);
    for (let r = 0; r < count; r++) {
      const month = FEE_MONTHS[randInt(0, 11)];
      const year = rand([2024, 2025]);
      receipts.push({
        studentId: `STUDENT_${si}`,
        studentName: s.name,
        class: s.class,
        rollNumber: s.rollNumber,
        amount: s.feeAmount,
        paymentMethod: rand(PAY_METHODS),
        feeMonth: month,
        feeYear: year,
        receiptNumber: `${prefix}-${year}-${String(receipts.length + 1).padStart(4, "0")}`,
        status: Math.random() > 0.05 ? "paid" : "pending",
        remarks: Math.random() > 0.7 ? "Late payment" : "",
        createdAt: daysAgo(randInt(1, 180)),
        paidAt: daysAgo(randInt(1, 90)),
      });
    }
  });
  return receipts;
}

function makeExpenses(portal) {
  return Array.from({ length: 18 }, (_, i) => ({
    category: rand(EXPENSE_CATS),
    amount: randInt(500, 25000),
    description: `${rand(["Monthly", "Weekly", "Annual", "Emergency", "Routine"])} ${rand(["payment", "purchase", "repair", "maintenance", "service"])} for ${portal} section`,
    vendor: rand(VENDORS),
    expenseDate: daysAgo(randInt(1, 180)),
    paymentMethod: rand(PAY_METHODS),
    approvedBy: portal === "boys" ? "Boys Portal Admin" : "Girls Portal Admin",
    status: rand(["paid", "paid", "paid", "pending"]),
    receiptNumber: `EXP-${randInt(1000, 9999)}`,
    createdAt: daysAgo(randInt(1, 180)),
  }));
}

const BOYS_EVENTS = [
  {
    title: "Annual Sports Day",
    description:
      "Inter-class cricket, football and athletics competition. All students are required to participate.",
    venue: "School Ground",
    isPublic: true,
  },
  {
    title: "Science Exhibition",
    description:
      "Students will present science projects. Parents are invited to attend.",
    venue: "Main Hall",
    isPublic: true,
  },
  {
    title: "Prize Distribution Ceremony",
    description:
      "Annual prize distribution for academic achievements and extracurricular activities.",
    venue: "Auditorium",
    isPublic: true,
  },
  {
    title: "Parent-Teacher Meeting",
    description:
      "Discuss student progress and academic performance with parents.",
    venue: "Classrooms",
    isPublic: false,
  },
  {
    title: "Quran Competition",
    description:
      "Annual Quran recitation and memorisation competition for all students.",
    venue: "School Mosque",
    isPublic: true,
  },
  {
    title: "Independence Day Celebration",
    description:
      "National Day celebrations with speeches, nasheeds and flag hoisting ceremony.",
    venue: "Main Ground",
    isPublic: true,
  },
];
const GIRLS_EVENTS = [
  {
    title: "Annual Cultural Show",
    description:
      "Students showcase talent in drama, poetry and arts. Parents warmly invited.",
    venue: "Auditorium",
    isPublic: true,
  },
  {
    title: "Cooking Competition",
    description: "Cooking competition as part of Home Economics curriculum.",
    venue: "Home Ec Lab",
    isPublic: false,
  },
  {
    title: "Farewell Ceremony",
    description:
      "Farewell for graduating class 10 students. A memorable evening.",
    venue: "Main Hall",
    isPublic: true,
  },
  {
    title: "Health & Hygiene Workshop",
    description:
      "Educational workshop by medical professionals on health and hygiene.",
    venue: "Room 12",
    isPublic: false,
  },
  {
    title: "Calligraphy Exhibition",
    description:
      "Display of student Urdu and Arabic calligraphy work for parents.",
    venue: "Art Room",
    isPublic: true,
  },
  {
    title: "Annual Sports Gala",
    description: "Badminton, table tennis and athletics for all year groups.",
    venue: "Sports Court",
    isPublic: true,
  },
];

function makeEvents(eventList) {
  return eventList.map((e, i) => ({
    ...e,
    date: daysAgo(randInt(-30, 60)),
    endDate: daysAgo(randInt(-35, 55)),
    status: rand(["upcoming", "upcoming", "completed", "ongoing"]),
    createdAt: daysAgo(randInt(10, 60)),
  }));
}

const BOYS_NOTICES = [
  {
    title: "Fee Submission Deadline",
    content:
      "All students are reminded to submit their monthly fees by the 10th of each month. Late submissions will incur a fine of Rs. 200.",
    priority: "high",
  },
  {
    title: "Uniform Policy Reminder",
    content:
      "All students must wear the complete school uniform including proper shoes and belt. Violations will result in disciplinary action.",
    priority: "medium",
  },
  {
    title: "Examination Schedule Released",
    content:
      "The mid-term examination schedule has been released. Students can collect printed copies from the admin office.",
    priority: "high",
  },
  {
    title: "Holiday Notice — Eid",
    content:
      "School will remain closed from 29th of this month for Eid holidays. Classes will resume on the 5th of next month.",
    priority: "medium",
  },
  {
    title: "Library Book Return",
    content:
      "All students must return borrowed library books before the end of term. Fine of Rs. 10/day for overdue books.",
    priority: "low",
  },
  {
    title: "Morning Assembly Update",
    content:
      "Morning assembly will now start at 7:45 AM instead of 8:00 AM. Students arriving after assembly will be marked late.",
    priority: "medium",
  },
];
const GIRLS_NOTICES = [
  {
    title: "Fee Submission Reminder",
    content:
      "Parents are requested to ensure timely submission of school fees. The last date is the 15th of each month.",
    priority: "high",
  },
  {
    title: "Dress Code Advisory",
    content:
      "Students are reminded to wear proper hijab and complete uniform as per school policy at all times on campus.",
    priority: "medium",
  },
  {
    title: "Result Cards Available",
    content:
      "First term result cards are ready and can be collected from the admin office. Parent signature required on the card.",
    priority: "high",
  },
  {
    title: "School Timings Change",
    content:
      "School timings will be 8:00 AM to 1:30 PM during summers starting next week.",
    priority: "medium",
  },
  {
    title: "New Books for Session",
    content:
      "Book list for the new academic session is available at the reception. Purchase from approved vendors only.",
    priority: "low",
  },
  {
    title: "Photography Consent",
    content:
      "Parents wishing to have their daughters excluded from school photography events must submit a written request.",
    priority: "low",
  },
];

function makeNotices(noticeList, portal) {
  return noticeList.map((n) => ({
    ...n,
    isPublic: n.priority !== "low" ? true : Math.random() > 0.5,
    author: portal === "boys" ? "Boys Portal Admin" : "Girls Portal Admin",
    createdAt: daysAgo(randInt(1, 60)),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────

export default function SetupPage() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [seedRunning, setSeedRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const addLog = (msg, type = "info") => setLogs((l) => [...l, { msg, type }]);

  const getFirebaseInstances = () => {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    return { app, auth: getAuth(app), db: getFirestore(app) };
  };

  // ── Run admin account setup ──
  const run = async () => {
    setRunning(true);
    setLogs([]);
    const { auth, db } = getFirebaseInstances();

    for (const u of ACCOUNTS) {
      let uid;
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          u.email,
          u.password,
        );
        uid = cred.user.uid;
        addLog(`✓ Created Auth account: ${u.email}`, "success");
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          try {
            const cred = await signInWithEmailAndPassword(
              auth,
              u.email,
              u.password,
            );
            uid = cred.user.uid;
            addLog(`ℹ Auth account already exists: ${u.email}`, "warn");
          } catch (e2) {
            addLog(`✗ Failed to sign in ${u.email}: ${e2.message}`, "error");
            continue;
          }
        } else {
          addLog(`✗ ${u.email}: ${err.message}`, "error");
          continue;
        }
      }

      try {
        // Always force-write correct profile data (merge: false ensures all fields are correct)
        await setDoc(doc(db, "users", uid), {
          uid,
          email: u.email,
          name: u.name,
          role: u.role,
          portal: u.portal,
          active: true,
          createdAt: new Date(),
        });
        addLog(
          `✓ Firestore profile set for: ${u.email} (uid: ${uid.slice(0, 8)}…)`,
          "success",
        );
      } catch (err) {
        addLog(`✗ Firestore error for ${u.email}: ${err.message}`, "error");
      }
    }

    // Sign out so auth state is clean — user must log in fresh
    try {
      await signOut(auth);
    } catch (_) {}
    // Clear any cached userProfile from localStorage
    if (typeof window !== "undefined") localStorage.removeItem("userProfile");

    addLog(
      "✓ Signed out — auth state is clean. Log in fresh from /login.",
      "success",
    );
    setDone(true);
    setRunning(false);
  };

  // ── Seed mock data ──
  const seedData = async () => {
    setSeedRunning(true);
    setLogs([]);
    const { auth, db } = getFirebaseInstances();

    const seedCollections = async (colList) => {
      for (const col of colList) {
        try {
          const chunks = [];
          for (let i = 0; i < col.docs.length; i += 10)
            chunks.push(col.docs.slice(i, i + 10));
          for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach((d) => batch.set(doc(collection(db, col.name)), d));
            await batch.commit();
          }
          addLog(
            `✓ ${col.name}: ${col.docs.length} documents seeded`,
            "success",
          );
        } catch (err) {
          addLog(`✗ ${col.name}: ${err.message}`, "error");
        }
      }
    };

    // ── Boys portal collections (sign in as boys admin) ──
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        "boys@smas.edu",
        "Boys@1234",
      );
      // Force-refresh ID token so it's attached to Firestore before writing
      await cred.user.getIdToken(true);
      await new Promise((r) => setTimeout(r, 800));
      addLog("ℹ Signed in as boys admin…", "info");
    } catch (err) {
      addLog(
        `✗ Could not sign in as boys admin: ${err.message}. Run Setup first.`,
        "error",
      );
      setSeedRunning(false);
      return;
    }

    const boysStudents = makeStudents(BOYS_NAMES, "BS");
    await seedCollections([
      { name: "boys_students", docs: boysStudents },
      { name: "boys_receipts", docs: makeReceipts(boysStudents, "BR") },
      { name: "boys_expenses", docs: makeExpenses("boys") },
      { name: "boys_events", docs: makeEvents(BOYS_EVENTS) },
      { name: "boys_notices", docs: makeNotices(BOYS_NOTICES, "boys") },
    ]);

    try {
      await signOut(auth);
    } catch (_) {}

    // ── Girls portal collections (sign in as girls admin) ──
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        "girls@smas.edu",
        "Girls@1234",
      );
      await cred.user.getIdToken(true);
      await new Promise((r) => setTimeout(r, 800));
      addLog("ℹ Signed in as girls admin…", "info");
    } catch (err) {
      addLog(`✗ Could not sign in as girls admin: ${err.message}`, "error");
      setSeedRunning(false);
      return;
    }

    const girlsStudents = makeStudents(GIRLS_NAMES, "GS");
    await seedCollections([
      { name: "girls_students", docs: girlsStudents },
      { name: "girls_receipts", docs: makeReceipts(girlsStudents, "GR") },
      { name: "girls_expenses", docs: makeExpenses("girls") },
      { name: "girls_events", docs: makeEvents(GIRLS_EVENTS) },
      { name: "girls_notices", docs: makeNotices(GIRLS_NOTICES, "girls") },
    ]);

    try {
      await signOut(auth);
    } catch (_) {}
    if (typeof window !== "undefined") localStorage.removeItem("userProfile");
    addLog("✓ Seeding complete — signed out. Log in from /login.", "success");
    setSeedDone(true);
    setSeedRunning(false);
  };

  const color = {
    success: "#1B4332",
    warn: "#D39542",
    error: "#dc2626",
    info: "#8C7B6B",
  };
  const busy = running || seedRunning;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6F1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "white",
          border: "1px solid #E8DFD4",
          borderRadius: "8px",
          padding: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1B4332",
            marginBottom: "4px",
            fontFamily: "Georgia, serif",
          }}
        >
          SMAS — Setup & Seed
        </h1>
        <p style={{ fontSize: "13px", color: "#8C7B6B", marginBottom: "24px" }}>
          Run steps in order. Each step is safe to re-run.
        </p>

        {/* Credentials info box */}
        <div
          style={{
            background: "#F5EFE8",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "24px",
            fontSize: "13px",
            lineHeight: "1.8",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: "2px 8px",
              color: "#3D3227",
            }}
          >
            <strong>Boys Portal</strong>
            <span />
            <span style={{ color: "#8C7B6B" }}>Email</span>
            <span>boys@smas.edu</span>
            <span style={{ color: "#8C7B6B" }}>Password</span>
            <span>Boys@1234</span>
            <strong style={{ marginTop: "8px", display: "block" }}>
              Girls Portal
            </strong>
            <span />
            <span style={{ color: "#8C7B6B" }}>Email</span>
            <span>girls@smas.edu</span>
            <span style={{ color: "#8C7B6B" }}>Password</span>
            <span>Girls@1234</span>
          </div>
        </div>

        {/* Log output */}
        {logs.length > 0 && (
          <div
            style={{
              background: "#F5EFE8",
              border: "1px solid #E8DFD4",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "2",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {logs.map((l, i) => (
              <div key={i} style={{ color: color[l.type] }}>
                {l.msg}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Admin Accounts */}
        <div style={{ marginBottom: "12px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#8C7B6B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Step 1 — Admin Accounts
          </p>
          {done ? (
            <div
              style={{
                background: "#E8F5EE",
                border: "1px solid #1B4332",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "13px",
                color: "#1B4332",
              }}
            >
              ✅ Admin accounts created & profiles fixed
            </div>
          ) : (
            <button
              onClick={run}
              disabled={busy}
              style={{
                width: "100%",
                padding: "10px",
                background: busy ? "#8C7B6B" : "#1B4332",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {running ? "Setting up accounts…" : "Run Setup (Fix Profiles)"}
            </button>
          )}
        </div>

        {/* Step 2 — Seed Mock Data */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#8C7B6B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Step 2 — Seed Mock Data
          </p>
          {seedDone ? (
            <div
              style={{
                background: "#E8F5EE",
                border: "1px solid #1B4332",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "13px",
                color: "#1B4332",
              }}
            >
              ✅ Mock data seeded — students, receipts, expenses, events,
              notices
            </div>
          ) : (
            <button
              onClick={seedData}
              disabled={busy}
              style={{
                width: "100%",
                padding: "10px",
                background: busy ? "#8C7B6B" : "#2D6A4F",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {seedRunning
                ? "Seeding data…"
                : "Seed Mock Data (15 students · receipts · expenses · events · notices)"}
            </button>
          )}
          <p style={{ marginTop: "6px", fontSize: "11px", color: "#8C7B6B" }}>
            ⚠ Appends data — clicking multiple times will add duplicates.
          </p>
        </div>

        {(done || seedDone) && (
          <div style={{ textAlign: "center" }}>
            <a
              href="/login"
              style={{
                display: "inline-block",
                padding: "9px 24px",
                background: "#1B4332",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Go to Login →
            </a>
          </div>
        )}

        <p
          style={{
            marginTop: "20px",
            fontSize: "11px",
            color: "#8C7B6B",
            textAlign: "center",
          }}
        >
          ⚠ Ensure <strong>Email/Password</strong> sign-in is enabled in{" "}
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            style={{ color: "#1B4332" }}
          >
            Firebase Console
          </a>{" "}
          → Authentication → Sign-in method.
        </p>
      </div>
    </div>
  );
}
