import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, LogIn, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative px-4 overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid decorativo */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Tarjeta de Formulario */}
      <div className="glassmorphism max-w-md w-full rounded-2xl p-8 border border-white/5 relative z-10 animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <Trophy className="h-7 w-7 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              MUNDIAL<span className="text-white font-medium text-sm ml-1 tracking-normal">Data</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h2>
          <p className="text-sm text-gray-400 mt-1">Ingresa tus credenciales para acceder a las estadísticas</p>
        </div>

        {/* Alerta de Error */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                disabled={submitting}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contraseña
              </label>
              <a href="#" className="text-xs text-yellow-500 hover:text-yellow-400 hover:underline">
                ¿La olvidaste?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Footer de Tarjeta */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="inline-flex items-center gap-0.5 text-yellow-500 font-semibold hover:text-yellow-400 hover:underline">
              Regístrate aquí <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
