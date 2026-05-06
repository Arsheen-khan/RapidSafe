// Auth context: manages user/captain token + profile in localStorage
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "user" | "captain"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      } catch {
        // ignore parse failure
      }
    }
    setLoading(false);
  }, []);

  const persist = (token, u, r) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("role", r);
    setUser(u);
    setRole(r);
  };

  const loginUser = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    persist(data.token, data.user, "user");
    return data;
  };

 const registerUser = async (fullname, email, password) => {
  const [first, ...rest] = fullname.split(" ");
  const lastname = rest.join(" ") || "User"; // fallback

  const { data } = await api.post("/users/register", {
    fullname: {
      firstname: first,
      lastname: lastname
    },
    email,
    password
  });

  persist(data.token, data.user, "user");
  return data;
};

  const loginCaptain = async (email, password) => {
    const { data } = await api.post("/captains/login", { email, password });
    persist(data.token, data.user || data.captain, "captain");
    return data;
  };

  const registerCaptain = async (payload) => {
    const { data } = await api.post("/captains/register", payload);
    persist(data.token, data.user || data.captain, "captain");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginUser,
        registerUser,
        loginCaptain,
        registerCaptain,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
