import { useState, useEffect, useCallback } from "react";
import { db } from "@/src/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

export function useExpenses(portal = "boys") {
  const col = `${portal}_expenses`;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, col), orderBy("createdAt", "desc")),
      );
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [col]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addExpense = async (data) => {
    const ref = await addDoc(collection(db, col), {
      ...data,
      createdAt: new Date(),
    });
    await fetch();
    return ref.id;
  };

  const updateExpense = async (id, data) => {
    await updateDoc(doc(db, col, id), { ...data, updatedAt: new Date() });
    await fetch();
  };

  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, col, id));
    await fetch();
  };

  return {
    expenses,
    loading,
    error,
    refetch: fetch,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
