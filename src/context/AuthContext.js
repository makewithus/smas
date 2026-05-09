"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { FIREBASE_ERROR_MESSAGES, ROLES } from "@/src/lib/constants";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore with offline fallback
  const fetchUserProfile = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      if (
        error?.code === "unavailable" ||
        error?.message?.includes("offline") ||
        error?.message?.includes("client is offline")
      ) {
        try {
          const cached = localStorage.getItem("userProfile");
          if (cached) return JSON.parse(cached);
        } catch (_) {}
        return null;
      }
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load cached profile immediately to avoid blank flash
        let resolvedProfile = null;
        try {
          const cached = localStorage.getItem("userProfile");
          if (cached) resolvedProfile = JSON.parse(cached);
        } catch (_) {}

        // Fetch fresh from Firestore
        const fresh = await fetchUserProfile(firebaseUser.uid);
        if (fresh) resolvedProfile = fresh;

        if (resolvedProfile) {
          localStorage.setItem("userProfile", JSON.stringify(resolvedProfile));
          const p = resolvedProfile.portal || "boys";
          localStorage.setItem("portal", p);
          // Batch all state updates together — single render
          setUser(firebaseUser);
          setUserProfile(resolvedProfile);
          setPortal(p);
        } else {
          // Profile not found in Firestore — preserve any existing cached state
          setUser(firebaseUser);
          setUserProfile((prev) => {
            if (prev) return prev;
            // Last-resort: try localStorage (may have been set by signIn already)
            try {
              const cached = localStorage.getItem("userProfile");
              if (cached) return JSON.parse(cached);
            } catch (_) {}
            return null;
          });
          setPortal((prev) => {
            if (prev) return prev;
            return localStorage.getItem("portal") || null;
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setPortal(null);
        localStorage.removeItem("userProfile");
        localStorage.removeItem("portal");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Sign in function
  const signIn = useCallback(
    async (email, password, selectedPortal) => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = result.user;

        const profile = await fetchUserProfile(firebaseUser.uid);

        if (!profile) {
          await firebaseSignOut(auth);
          throw new Error(
            "User profile not found. Please contact administrator.",
          );
        }

        if (profile.active === false) {
          await firebaseSignOut(auth);
          throw new Error(
            "Your account has been deactivated. Please contact administrator.",
          );
        }

        const rolePortalMap = {
          [ROLES.SUPER_ADMIN]: ["boys", "girls", "super"],
          [ROLES.BOYS_ADMIN]: ["boys"],
          [ROLES.GIRLS_ADMIN]: ["girls"],
        };

        const allowedPortals = rolePortalMap[profile.role] || [];
        if (!allowedPortals.includes(selectedPortal)) {
          await firebaseSignOut(auth);
          throw new Error("Access denied for this portal");
        }

        localStorage.setItem("userProfile", JSON.stringify(profile));
        localStorage.setItem("portal", selectedPortal);
        setUserProfile(profile);
        setPortal(selectedPortal);

        return { user: firebaseUser, profile, portal: selectedPortal };
      } catch (error) {
        const message =
          FIREBASE_ERROR_MESSAGES[error.code] ||
          error.message ||
          "Sign in failed. Please try again";
        throw new Error(message);
      }
    },
    [fetchUserProfile],
  );

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setPortal(null);
      localStorage.removeItem("userProfile");
      localStorage.removeItem("portal");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  // Stable context value — only changes when actual data changes
  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user,
      isAdmin: userProfile?.role === ROLES.SUPER_ADMIN,
      portal,
    }),
    [user, userProfile, loading, portal, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
