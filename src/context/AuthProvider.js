"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAdminProfile } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children, requireAuth = true }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProfile();
      setAdmin(res?.data || null);
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const iv = setInterval(() => {
      loadProfile();
    }, 1000 * 60 * 5); // refresh every 5 minutes
    return () => clearInterval(iv);
  }, [loadProfile]);

  useEffect(() => {
    if (!loading && requireAuth && !admin) {
      router.push("/admin/login");
    }
  }, [loading, admin, requireAuth, router]);

  return (
    <AuthContext.Provider value={{ admin, setAdmin, loading, reload: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
