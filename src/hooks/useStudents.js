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
  where,
} from "firebase/firestore";

export function useStudents(portal = "boys") {
  const col = `${portal}_students`;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        let q = query(collection(db, col), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (filters.classFilter)
          data = data.filter((s) => s.class === filters.classFilter);
        if (filters.status)
          data = data.filter((s) => s.status === filters.status);
        setStudents(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [col],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addStudent = async (data) => {
    const ref = await addDoc(collection(db, col), {
      ...data,
      createdAt: new Date(),
    });
    await fetch();
    return ref.id;
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, col, id), { ...data, updatedAt: new Date() });
    await fetch();
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, col, id));
    await fetch();
  };

  return {
    students,
    loading,
    error,
    refetch: fetch,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
