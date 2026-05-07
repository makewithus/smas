/**
 * SMAS — One-time seed script
 * Creates Boys Admin and Girls Admin accounts in Firebase Auth + Firestore.
 *
 * Usage:
 *   node scripts/seed-users.mjs
 *
 * Run ONCE. Safe to re-run — it skips accounts that already exist.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Load .env.local so Firebase vars are available via process.env
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on environment variables already set
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

const USERS = [
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

async function seedUser({ email, password, name, role, portal }) {
  let uid;

  // Try to create; if already exists, sign in to get UID
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log(`✓ Created Auth account: ${email}`);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`ℹ Auth account already exists: ${email}`);
    } else {
      throw err;
    }
  }

  // Write Firestore profile if missing
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      name,
      role,
      portal,
      active: true,
      createdAt: new Date(),
    });
    console.log(`✓ Created Firestore profile for: ${email}`);
  } else {
    console.log(`ℹ Firestore profile already exists for: ${email}`);
  }
}

console.log("\n🌱  Seeding SMAS admin users...\n");

for (const user of USERS) {
  await seedUser(user);
}

console.log("\n✅  Done!\n");
console.log("┌─────────────────────────────────────────────────┐");
console.log("│  Boys Portal                                    │");
console.log("│  Email:    boys@smas.edu                        │");
console.log("│  Password: Boys@1234                            │");
console.log('│  URL:      /login  →  select "Boys Portal"      │');
console.log("├─────────────────────────────────────────────────┤");
console.log("│  Girls Portal                                   │");
console.log("│  Email:    girls@smas.edu                       │");
console.log("│  Password: Girls@1234                           │");
console.log('│  URL:      /login  →  select "Girls Portal"     │');
console.log("└─────────────────────────────────────────────────┘\n");

process.exit(0);
