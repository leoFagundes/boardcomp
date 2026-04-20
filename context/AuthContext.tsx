"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onAuthChange, loginUser, logoutUser, registerUser } from "@/lib/firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { User, AuthContextType, RegisterDTO } from "@/types";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubDocRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthChange((firebaseUser) => {
      if (unsubDocRef.current) {
        unsubDocRef.current();
        unsubDocRef.current = null;
      }
      if (firebaseUser) {
        unsubDocRef.current = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          setUser(snap.exists() ? (snap.data() as User) : null);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => {
      unsubAuth();
      if (unsubDocRef.current) unsubDocRef.current();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const signUp = async (dto: RegisterDTO) => {
    await registerUser(dto);
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {};

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
