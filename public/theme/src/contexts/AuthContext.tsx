import { createContext, useContext, useState, ReactNode } from "react";

type Role = "admin" | "teacher";

interface User {
  name: string;
  role: Role;
  teacherId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, _password: string): boolean => {
    // Mock login
    if (username === "admin" || username === "مدير") {
      setUser({ name: "مدير المدرسة", role: "admin" });
      return true;
    }
    if (username === "teacher" || username === "معلم") {
      setUser({ name: "أحمد محمد الخالدي", role: "teacher", teacherId: "t1" });
      return true;
    }
    // Default: allow any login as teacher
    setUser({ name: username || "معلم", role: "teacher", teacherId: "t1" });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
