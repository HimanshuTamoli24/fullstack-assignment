"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "~/trpc/server";
import { toast } from "sonner";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
}

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  jobTitle?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoUsers: DemoUser[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role: "ADMIN" | "MEMBER";
    jobTitle?: string;
    department?: string;
  }) => Promise<boolean>;
  quickDemoLogin: (userId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Fetch demo users for easy test switching
  const fetchDemoUsers = async () => {
    try {
      const users = await api.auth.getDemoUsers.query();
      setDemoUsers(users);
    } catch (err) {
      console.warn("Could not fetch demo users", err);
    }
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem("taskflow_token");
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const current = await api.auth.getMe.query();
      if (current) {
        setUser({
          id: (current as any)._id?.toString() || (current as any).id,
          fullName: current.fullName,
          email: current.email,
          role: current.role,
          avatarUrl: current.avatarUrl,
          jobTitle: current.jobTitle,
          department: current.department,
        });
        setToken(savedToken);
      } else {
        localStorage.removeItem("taskflow_token");
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem("taskflow_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers();
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login.mutate({ email, password });
      localStorage.setItem("taskflow_token", res.token);
      setToken(res.token);
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.fullName}!`);
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Login failed. Please check your credentials.");
      return false;
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    role: "ADMIN" | "MEMBER";
    jobTitle?: string;
    department?: string;
  }) => {
    try {
      const res = await api.auth.register.mutate(data);
      localStorage.setItem("taskflow_token", res.token);
      setToken(res.token);
      setUser(res.user);
      toast.success(`Account created! Welcome, ${res.user.fullName}!`);
      await fetchDemoUsers();
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Registration failed.");
      return false;
    }
  };

  const quickDemoLogin = async (userId: string) => {
    try {
      const res = await api.auth.quickDemoLogin.mutate({ userId });
      localStorage.setItem("taskflow_token", res.token);
      setToken(res.token);
      setUser(res.user);
      toast.success(`Switched account to ${res.user.fullName} (${res.user.role})`);
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Demo login failed.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout.mutate();
    } catch {}
    localStorage.removeItem("taskflow_token");
    setUser(null);
    setToken(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        login,
        register,
        quickDemoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
