require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "boys_receipts"), where("receiptType", "==", "donation"), limit(3));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  
  const q2 = query(collection(db, "boys_receipts"), limit(10));
  const snap2 = await getDocs(q2);
  let emptyCount = 0;
  snap2.forEach(doc => {
    const data = doc.data();
    if (!data.studentName && !data.payerName) {
      console.log('No name found:', doc.id, data);
      emptyCount++;
    }
  });
  process.exit(0);
}
run().catch(console.error);
