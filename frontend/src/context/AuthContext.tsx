import { createContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

export interface User {
  username?: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión guardada al montar el componente
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Limpiar en caso de datos corruptos
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/auth/login", {
        email,
        password,
      });

      // Soportar diferentes formatos de respuesta del backend (token o access_token)
      const jwtToken = response.data.access_token || response.data.token;
      const userData = response.data.user || {
        username: response.data.username || email.split("@")[0],
        email,
        role: response.data.role || "user",
      };

      if (!jwtToken) {
        throw new Error("No se recibió el token de autenticación del servidor.");
      }

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Error al iniciar sesión. Comprueba tus credenciales.";
      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post("http://127.0.0.1:5000/api/auth/register", {
        username,
        email,
        password,
      });
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Error al registrar la cuenta. Inténtalo de nuevo.";
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
