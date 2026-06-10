import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Trophy, 
  Shield, 
  User as UserIcon, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Home, 
  Loader2, 
  AlertTriangle,
  UserCheck
} from "lucide-react";

interface Edicion {
  id: number;
  anio: number;
  pais_anfitrion: string;
  campeon: string;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"ediciones" | "equipos" | "jugadores" >("ediciones");
  const [ediciones, setEdiciones] = useState<Edicion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ediciones desde el Backend Flask
  useEffect(() => {
    if (activeTab !== "ediciones") return;

    const fetchEdiciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/ediciones", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = Array.isArray(response.data) ? response.data : (response.data.ediciones || []);
        setEdiciones(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Error al conectar con la base de datos de Flask.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEdiciones();
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Datos Mock para Equipos
  const mockEquipos = [
    { id: 1, pais: "Argentina", pj: 7, goles_f: 15, goles_c: 8, posesion: "56.8%" },
    { id: 2, pais: "Francia", pj: 7, goles_f: 16, goles_c: 8, posesion: "52.4%" },
    { id: 3, pais: "Croacia", pj: 7, goles_f: 8, goles_c: 7, posesion: "54.3%" },
    { id: 4, pais: "Marruecos", pj: 7, goles_f: 6, goles_c: 5, posesion: "39.0%" }
  ];

  // Datos Mock para Jugadores
  const mockJugadores = [
    { id: 1, nombre: "Lionel Messi", pj: 7, goles: 7, asistencias: 3 },
    { id: 2, nombre: "Kylian Mbappé", pj: 7, goles: 8, asistencias: 2 },
    { id: 3, nombre: "Olivier Giroud", pj: 6, goles: 4, asistencias: 0 },
    { id: 4, nombre: "Julián Álvarez", pj: 7, goles: 4, asistencias: 0 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-slate-900/40 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between z-10 shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              MUNDIAL<span className="text-white font-medium text-xs ml-1 tracking-normal">Stats</span>
            </span>
          </div>

          {/* Información del usuario */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs text-gray-500 font-medium">Conectado como</span>
              <span className="block font-bold text-xs text-white truncate">{user?.username || user?.email.split("@")[0]}</span>
              <span className="inline-block text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold px-1.5 py-0.5 rounded-md mt-1 uppercase tracking-widest">
                {user?.role || "User"}
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("ediciones")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "ediciones" 
                  ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Ediciones
            </button>

            <button
              onClick={() => setActiveTab("equipos")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "equipos" 
                  ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Shield className="h-4 w-4" />
              Equipos
            </button>

            <button
              onClick={() => setActiveTab("jugadores")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "jugadores" 
                  ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Jugadores
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-white/5 space-y-2 mt-6 md:mt-0">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 p-6 md:p-10 z-10 overflow-y-auto max-w-full">
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize">{activeTab}</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Administración de {activeTab} registradas en el sistema.
            </p>
          </div>
          <button
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Agregar {activeTab === "ediciones" ? "Edición" : activeTab === "equipos" ? "Equipo" : "Jugador"}
          </button>
        </div>

        {/* Tablas CRUD */}
        <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden">
          {activeTab === "ediciones" && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
                  <span className="text-xs text-gray-400 font-medium">Consultando API de Flask...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto gap-3">
                  <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Error de Conexión</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
                </div>
              ) : ediciones.length === 0 ? (
                <div className="text-center py-16">
                  <span className="block text-sm text-gray-500">No se encontraron ediciones registradas.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Año</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Organizador</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Campeón</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ediciones.map((ed) => (
                        <tr key={ed.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                          <td className="py-4 px-6 text-sm font-semibold text-gray-500">#{ed.id}</td>
                          <td className="py-4 px-6 text-sm font-bold text-white">{ed.anio}</td>
                          <td className="py-4 px-6 text-sm text-gray-300 font-light">{ed.pais_anfitrion}</td>
                          <td className="py-4 px-6 text-sm text-yellow-500 font-semibold">{ed.campeon}</td>
                          <td className="py-4 px-6 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === "equipos" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">País / Equipo</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Partidos</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goles F/C</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Posesión</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockEquipos.map((eq) => (
                    <tr key={eq.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-4 px-6 text-sm font-semibold text-gray-500">#{eq.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-white">{eq.pais}</td>
                      <td className="py-4 px-6 text-sm text-gray-300">{eq.pj}</td>
                      <td className="py-4 px-6 text-sm text-gray-300 font-light font-mono">
                        {eq.goles_f} F / {eq.goles_c} C
                      </td>
                      <td className="py-4 px-6 text-sm text-cyan-400 font-semibold">{eq.posesion}</td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "jugadores" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Partidos</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goles</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asistencias</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockJugadores.map((jg) => (
                    <tr key={jg.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-4 px-6 text-sm font-semibold text-gray-500">#{jg.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-white">{jg.nombre}</td>
                      <td className="py-4 px-6 text-sm text-gray-300">{jg.pj}</td>
                      <td className="py-4 px-6 text-sm text-yellow-500 font-semibold">{jg.goles}</td>
                      <td className="py-4 px-6 text-sm text-cyan-400 font-semibold">{jg.asistencias}</td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
