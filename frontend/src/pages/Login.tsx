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
    <div className="h-screen overflow-hidden flex pt-16 bg-slate-950 text-white relative select-none">
      
      {/* Panel Izquierdo: Visual Estático */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-end p-12 pb-8 relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/assets/register/bg-argentina.webp')" }}
      >
        {/* Overlay con degradado premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent" />

        {/* Contenido Estático (Abajo sobre degradado) */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-500/80">Estadísticas Oficiales</span>
            <h1 className="text-5xl font-black tracking-tight text-white capitalize font-title">
              Copa del Mundo
            </h1>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glassmorphism rounded-2xl p-4 border border-white/5 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.08]">
              <span className="text-xs text-gray-400 font-medium block truncate">Torneo</span>
              <span className="text-2xl font-black text-white font-mono mt-1">32 Selecciones</span>
            </div>
            <div className="glassmorphism rounded-2xl p-4 border border-white/5 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.08]">
              <span className="text-xs text-gray-400 font-medium block truncate">Calendario</span>
              <span className="text-2xl font-black text-white font-mono mt-1">64 Partidos</span>
            </div>
            <div className="glassmorphism rounded-2xl p-4 border border-white/5 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.08]">
              <span className="text-xs text-gray-400 font-medium block truncate">Actualizaciones</span>
              <span className="text-2xl font-black text-white font-mono mt-1">Tiempo Real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="w-full md:w-1/2 h-full bg-[#0b0f19] flex items-center justify-center p-4 sm:p-8 relative z-10 overflow-y-auto">
        {/* Luces de fondo decorativas */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Contenedor del Formulario (Suelto sobre fondo oscuro) */}
        <div className="max-w-md w-full relative z-10 animate-fade-in">
          
          {/* Logo en móvil */}
          <div className="text-center md:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <Trophy className="h-6 w-6 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                MUNDIAL<span className="text-white font-medium text-xs ml-1 tracking-normal">Data</span>
              </span>
            </Link>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-title">Bienvenido de nuevo</h2>
            <p className="text-xs text-gray-400 mt-1">Ingresa tus credenciales para acceder a las estadísticas</p>
          </div>

          {/* Alerta de Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-4 animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
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
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-[#e5b842] text-black hover:bg-[#cca232] shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogIn className="h-4 w-4" />
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Footer / Enlaces inferiores */}
          <div className="mt-6 space-y-2.5 text-center">
            <p className="text-xs text-gray-400">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="inline-flex items-center gap-0.5 text-[#e5b842] font-semibold hover:text-[#cca232] hover:underline">
                Regístrate aquí <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
            <p className="text-xs">
              <a href="#" className="text-gray-500 hover:text-[#e5b842] hover:underline transition-colors duration-200">
                ¿Olvidaste tu contraseña?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
