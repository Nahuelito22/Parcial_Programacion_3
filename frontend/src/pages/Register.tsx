import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, User, UserPlus, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const countriesData = {
  Argentina: {
    name: "Argentina",
    imageUrl: "/assets/register/bg-argentina.webp",
    stats: [
      { label: "Títulos Mundiales", value: "3" },
      { label: "Goles Totales", value: "152" },
      { label: "Participaciones", value: "18" }
    ]
  },
  Francia: {
    name: "Francia",
    imageUrl: "/assets/register/bg-francia.webp",
    stats: [
      { label: "Títulos Mundiales", value: "2" },
      { label: "Goles Totales", value: "136" },
      { label: "Participaciones", value: "16" }
    ]
  },
  Brasil: {
    name: "Brasil",
    imageUrl: "/assets/register/bg-brasil.webp",
    stats: [
      { label: "Títulos Mundiales", value: "5" },
      { label: "Goles Totales", value: "237" },
      { label: "Participaciones", value: "22" }
    ]
  },
  Alemania: {
    name: "Alemania",
    imageUrl: "/assets/register/bg-alemania.webp",
    stats: [
      { label: "Títulos Mundiales", value: "4" },
      { label: "Goles Totales", value: "232" },
      { label: "Participaciones", value: "20" }
    ]
  }
};

type CountryKey = keyof typeof countriesData;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>("Argentina");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validación en cliente
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      await register(username, email, password);
      setSuccessMsg("¡Registro exitoso! Redirigiendo al inicio de sesión...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex pt-16 bg-slate-950 text-white relative select-none">
      
      {/* Panel Izquierdo: Visual Dinámico */}
      {/* AJUSTAR ESTE PADDING (pb-X) PARA BAJAR O SUBIR LAS CARDS */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-end p-12 pb-4 relative bg-cover bg-center transition-all duration-500 ease-in-out overflow-hidden"
        style={{ backgroundImage: `url(${countriesData[selectedCountry].imageUrl})` }}
      >
        {/* Overlay con degradado premium */}
        {/* AJUSTAR ESTOS VALORES PARA CAMBIAR LA ALTURA DEL DEGRADADO */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent from-10% via-40% transition-all duration-500" />

        {/* Contenido Dinámico del País (Abajo sobre degradado) */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-500/80">Estadísticas Históricas</span>
            <h1 className="text-5xl font-black tracking-tight text-white capitalize font-title transition-all duration-500">
              {countriesData[selectedCountry].name}
            </h1>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            {countriesData[selectedCountry].stats.map((stat, i) => (
              <div 
                key={i}
                className="glassmorphism rounded-2xl p-4 border border-white/5 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.08]"
              >
                <span className="text-xs text-gray-400 font-medium block truncate">{stat.label}</span>
                <span className="text-2xl font-black text-white font-mono mt-1">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="w-full md:w-1/2 h-full bg-[#0b0f19] flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
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
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-title">Crea tu cuenta gratis</h2>
            <p className="text-sm text-gray-400 mt-1">Únete para explorar estadísticas y acceder a predicciones IA</p>
          </div>

          {/* Alertas */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-4 animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl text-xs mb-4 animate-fade-in">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre de usuario */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="juan_perez"
                  disabled={submitting || !!successMsg}
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

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
                  disabled={submitting || !!successMsg}
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Selector de País */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                País de Preferencia
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as CountryKey)}
                  disabled={submitting || !!successMsg}
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50 cursor-pointer appearance-none"
                >
                  {Object.keys(countriesData).map((country) => (
                    <option key={country} value={country} className="bg-slate-900 text-white">
                      {countriesData[country as CountryKey].name}
                    </option>
                  ))}
                </select>
                {/* Flecha personalizada de select */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
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
                  placeholder="Mínimo 8 caracteres"
                  disabled={submitting || !!successMsg}
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting || !!successMsg}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  disabled={submitting || !!successMsg}
                  className="w-full bg-[#1a2030] border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e5b842] focus:ring-1 focus:ring-[#e5b842] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={submitting || !!successMsg}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón Registrarse */}
            <button
              type="submit"
              disabled={submitting || !!successMsg}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-[#e5b842] text-black hover:bg-[#cca232] shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          {/* Footer de Tarjeta */}
          <div className="mt-6 pt-4 text-center">
            <p className="text-xs text-gray-400">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="inline-flex items-center gap-0.5 text-[#e5b842] font-semibold hover:text-[#cca232] hover:underline">
                Inicia sesión aquí <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
