import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

export type Role = "admin" | "manager" | "user" | null;

interface User {
  id: string;
  name: string;
  role: Role;
  employeeId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithOtp: (userData: any, role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("auth_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const loginWithOtp = (userData: any, role: Role) => {
    const u: User = { 
      id: userData._id || userData.employee_id || userData.manager_id || (typeof userData === 'string' ? userData : 'demo'), 
      name: userData.name || (role === 'admin' ? 'Administrator' : 'Demo User'), 
      role: role, 
      employeeId: userData.employee_id || userData.manager_id || (role === 'manager' ? '1066' : (role === 'user' ? '0001' : undefined))
    };
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
    // Small delay to ensure state update before redirect
    setTimeout(() => {
      setLocation("/");
      // Force reload to refresh UI state if needed
      window.location.href = "/";
    }, 100);
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    // Hardcoded demo authentication
    if (username === "admin" && password === "admin") {
      const u: User = { id: "admin", name: "Administrator", role: "admin" };
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
      setLocation("/");
      setIsLoading(false);
      return true;
    } else if (username === "manager" && password === "manager") {
      const u: User = { id: "manager", name: "Project Manager", role: "manager", employeeId: "1066" };
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
      setLocation("/");
      setIsLoading(false);
      return true;
    } else if (username === "user" && password === "user") {
      const u: User = { id: "user", name: "Standard User", role: "user", employeeId: "0001" };
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
      setLocation("/");
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithOtp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
