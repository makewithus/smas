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
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { FIREBASE_ERROR_MESSAGES, ROLES } from "@/src/lib/constants";

const AuthContext = createContext({});

const rolePortalMap = {
  [ROLES.SUPER_ADMIN]: ["boys", "girls"],
  [ROLES.BOYS_ADMIN]: ["boys"],
  [ROLES.GIRLS_ADMIN]: ["girls"],
};

function getAllowedPortals(role) {
  return rolePortalMap[role] || [];
}

async function createServerSession(firebaseUser, portal, rememberMe) {
  const token = await firebaseUser.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ portal, rememberMe }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Unable to create secure session");
  }
}

async function clearServerSession() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore. Cached profiles are never trusted for auth.
  const fetchUserProfile = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  // Listen for auth state changes and verify against server session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await fetch("/api/auth/session");
          if (!response.ok) {
            await clearServerSession();
            await firebaseSignOut(auth);
            setUser(null);
            setUserProfile(null);
            setPortal(null);
            localStorage.removeItem("portal");
          } else {
            const data = await response.json();
            if (data.authenticated && data.user.uid === firebaseUser.uid) {
              const resolvedProfile = await fetchUserProfile(firebaseUser.uid);
              if (resolvedProfile?.active === true) {
                setUser(firebaseUser);
                setUserProfile(resolvedProfile);
                setPortal(data.user.portal);
                localStorage.setItem("portal", data.user.portal);
              } else {
                await clearServerSession();
                await firebaseSignOut(auth);
                setUser(null);
                setUserProfile(null);
                setPortal(null);
                localStorage.removeItem("portal");
              }
            } else {
              await clearServerSession();
              await firebaseSignOut(auth);
              setUser(null);
              setUserProfile(null);
              setPortal(null);
              localStorage.removeItem("portal");
            }
          }
        } catch (error) {
          console.error("Auth state synchronization error:", error);
          await clearServerSession();
          await firebaseSignOut(auth);
          setUser(null);
          setUserProfile(null);
          setPortal(null);
          localStorage.removeItem("portal");
        }
      } else {
        if (typeof window !== "undefined" && localStorage.getItem("portal")) {
          await clearServerSession();
        }
        setUser(null);
        setUserProfile(null);
        setPortal(null);
        localStorage.removeItem("portal");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Sign in function
  const signIn = useCallback(
    async (email, password, selectedPortal, rememberSession = false) => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password;
        await setPersistence(
          auth,
          rememberSession ? browserLocalPersistence : browserSessionPersistence,
        );
        const result = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          normalizedPassword,
        );
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

        const allowedPortals = getAllowedPortals(profile.role);
        if (!allowedPortals.includes(selectedPortal)) {
          await firebaseSignOut(auth);
          throw new Error("Access denied for this portal");
        }

        await createServerSession(firebaseUser, selectedPortal, rememberSession);
        localStorage.setItem("portal", selectedPortal);
        setUser(firebaseUser);
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
      await clearServerSession();
      setUser(null);
      setUserProfile(null);
      setPortal(null);
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
