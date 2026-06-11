import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Trophy } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, loading } = useAuth();

  // Mostrar un cargador premium mientras se restaura la sesión del localStorage
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white select-none">
        <div className="flex flex-col items-center max-w-xs w-full px-4">
          <Trophy className="h-12 w-12 text-yellow-500 animate-pulse mb-6" />
          <h2 className="text-lg font-bold tracking-widest text-gray-200 uppercase mb-2">Verificando Sesión</h2>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 h-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Redirección al login si no hay token activo
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirección si el usuario no tiene los roles permitidos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
