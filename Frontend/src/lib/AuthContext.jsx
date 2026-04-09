import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import API from "./api";

const AuthContext = createContext(null);

const normalizeAuthResponse = (data) => {
  if (data?.user) {
    return {
      ...data.user,
      token: data.token || data.user.token,
    };
  }

  return {
    ...data,
    token: data?.token,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (error) {
        console.error("Invalid userInfo in localStorage:", error);
        localStorage.removeItem("userInfo");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const normalizedUser = normalizeAuthResponse(res.data);

    localStorage.setItem("userInfo", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    const normalizedUser = normalizeAuthResponse(res.data);

    localStorage.setItem("userInfo", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}