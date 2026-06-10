import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Trophy, LogOut, User as UserIcon, Shield, Mail } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative px-4 py-24 flex items-center justify-center overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid decorativo */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="glassmorphism max-w-xl w-full rounded-2xl p-8 border border-white/5 relative z-10 animate-fade-in text-center">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-500 via-cyan-500 to-amber-500" />
        
        <Trophy className="h-14 w-14 text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Panel del Mundial</h1>
        <p className="text-sm text-gray-400 mb-8">Estadísticas exclusivas y oráculo de predicciones IA</p>

        {/* Detalles del usuario */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-left space-y-4 mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
            Datos del Usuario
          </h2>

          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="block text-xs text-gray-500">Usuario</span>
              <span className="font-semibold text-sm text-white">{user?.username || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-cyan-400" />
            <div>
              <span className="block text-xs text-gray-500">Correo Electrónico</span>
              <span className="font-semibold text-sm text-white">{user?.email || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <span className="block text-xs text-gray-500">Rol asignado</span>
              <span className="font-semibold text-sm text-yellow-500 uppercase tracking-wider text-xs">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>

        {/* Botón Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer text-sm"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
