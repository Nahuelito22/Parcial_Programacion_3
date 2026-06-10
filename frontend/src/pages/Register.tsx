import { Link } from "react-router-dom";
import { Trophy, Mail, Lock, User, UserPlus, ArrowRight } from "lucide-react";

export default function Register() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Registro mock exitoso. Redirigiendo a Login...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative px-4 py-12 overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

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
              MUNDIAL<span className="text-white font-medium text-sm ml-1 tracking-normal">Stats</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Crea tu cuenta gratis</h2>
          <p className="text-sm text-gray-400 mt-1">Únete para explorar estadísticas y acceder a predicciones IA</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de usuario */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Nombre de Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="juan_perez"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200"
              />
            </div>
          </div>

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
                placeholder="ejemplo@correo.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Repite tu contraseña"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Botón Registrarse */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 mt-6 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Crear Cuenta
          </button>
        </form>

        {/* Footer de Tarjeta */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="inline-flex items-center gap-0.5 text-yellow-500 font-semibold hover:text-yellow-400 hover:underline">
              Inicia sesión aquí <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
