import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import RankingFilterBar from "../components/ui/RankingFilterBar";
import RankingTable, { type RankingColumn } from "../components/ui/RankingTable";
import { 
  Trophy, 
  Shield, 
  User as UserIcon, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  Swords,
  TrendingUp,
  Sparkles,
  Award,
  Brain
} from "lucide-react";

interface Edition {
  id: number;
  anio: number;
  pais_anfitrion: string;
  campeon: string;
}

export default function RankingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"goleadores" | "participaciones" | "ataque">("goleadores");
  const [editionId, setEditionId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);

  // 1. Obtener la lista de ediciones para los filtros
  const editionsQuery = useQuery({
    queryKey: ["rankings", "editions"],
    queryFn: async () => {
      const response = await axios.get<Edition[]>(`${API_BASE_URL}/h2h/ediciones`);
      return Array.isArray(response.data) ? response.data : (response.data as any).ediciones || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Query para el ranking activo
  const rankingsQuery = useQuery({
    queryKey: ["rankings", activeTab, editionId, limit],
    queryFn: async () => {
      let endpoint = "";
      if (activeTab === "goleadores") endpoint = "top-goleadores";
      else if (activeTab === "participaciones") endpoint = "participaciones";
      else if (activeTab === "ataque") endpoint = "mejor-ataque";

      const params: Record<string, any> = { limit };
      if (editionId !== null) {
        params.edicion_id = editionId;
      }

      const response = await axios.get(`${API_BASE_URL}/rankings/${endpoint}`, { params });
      return response.data;
    },
  });

  // Configuración de columnas según la categoría
  const goleadoresColumns: RankingColumn[] = [
    { key: "nombre", label: "Jugador", className: "font-semibold text-white" },
    { key: "partidos_jugados", label: "Partidos", align: "center", className: "font-mono text-gray-300" },
    { key: "asistencias", label: "Asistencias", align: "center", className: "font-mono text-cyan-400 font-semibold" },
    { key: "goles", label: "Goles", align: "center", className: "font-mono text-yellow-500 font-bold" },
    { key: "ediciones", label: "Mundiales", align: "center", className: "font-mono text-gray-400" },
  ];

  const participacionesColumns: RankingColumn[] = [
    { key: "nombre", label: "Selección", className: "font-semibold text-white" },
    { key: "partidos_jugados", label: "Partidos Jugados", align: "center", className: "font-mono text-gray-300" },
    { key: "participaciones", label: "Participaciones", align: "center", className: "font-mono text-yellow-500 font-bold" },
  ];

  const ataqueColumns: RankingColumn[] = [
    { key: "nombre", label: "Selección", className: "font-semibold text-white" },
    { key: "goles", label: "Goles Totales", align: "center", className: "font-mono text-gray-300" },
    { key: "partidos_jugados", label: "Partidos Jugados", align: "center", className: "font-mono text-gray-300" },
    { key: "promedio", label: "Promedio Goles/Partido", align: "center", className: "font-mono text-cyan-400 font-bold", render: (val) => val.toFixed(2) },
  ];

  const navigateToDashboard = (tab: "ediciones" | "equipos" | "jugadores" | "ingesta") => {
    navigate("/dashboard", { state: { activeTab: tab } });
  };

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Lateral */}
      <aside className={`h-[calc(100vh-4rem)] sticky top-16 ${isSidebarCollapsed ? "w-20" : "w-64"} bg-slate-900/40 backdrop-blur-md border-r border-white/5 ${isSidebarCollapsed ? "p-4 md:px-3" : "p-6"} flex flex-col justify-between z-10 shrink-0 transition-all duration-300`}>
        <div className="space-y-8">

          {/* Menú de Navegación */}
          <nav className="space-y-4">
            {isAdmin && (
              <div>
                {!isSidebarCollapsed && (
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-2">
                    GESTIÓN MANUAL
                  </div>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => navigateToDashboard("ediciones")}
                    title="Ediciones"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  >
                    <Trophy className="h-4 w-4 shrink-0" />
                    <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Ediciones</span>
                  </button>

                  <button
                    onClick={() => navigateToDashboard("equipos")}
                    title="Equipos"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Equipos</span>
                  </button>

                  <button
                    onClick={() => navigateToDashboard("jugadores")}
                    title="Jugadores"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  >
                    <UserIcon className="h-4 w-4 shrink-0" />
                    <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Jugadores</span>
                  </button>
                </div>
              </div>
            )}

            <hr className="border-white/5 my-4" />

            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-2">
                  ANÁLISIS
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => navigate("/dashboard/h2h")}
                  title="Head-to-Head"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                >
                  <Swords className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Head-to-Head</span>
                </button>

                <button
                  title="Rankings"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Rankings</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/oracle")}
                  title="Oráculo IA"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                >
                  <Brain className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Oráculo IA</span>
                </button>
              </div>
            </div>

            {isAdmin && (
              <>
                <hr className="border-white/5 my-4" />
                <div>
                  {!isSidebarCollapsed && (
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-2">
                      INGESTA DE DATOS
                    </div>
                  )}
                  <div className="space-y-1">
                    <button
                      onClick={() => navigateToDashboard("ingesta")}
                      title="Panel de Control"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    >
                      <Database className="h-4 w-4 shrink-0" />
                      <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Panel de Control</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-4 border-t border-white/5 mt-auto">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer`}
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
            {!isSidebarCollapsed && <span>Colapsar menú</span>}
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 min-w-0 px-6 pt-24 pb-6 md:px-10 md:pb-10 z-10 overflow-y-auto max-w-full">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold mb-2 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Estadísticas Globales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tablas de Clasificación Históricas
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Visualiza los récords y líderes históricos de la Copa Mundial de la FIFA en goles, asistencias y participaciones.
          </p>
        </div>

        {/* Pestañas de Rankings */}
        <div className="flex bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 self-start w-fit mb-6">
          <button
            onClick={() => setActiveTab("goleadores")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "goleadores"
                ? "bg-slate-950 text-white shadow-lg shadow-black/40 border border-white/5"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Award className="h-4 w-4 shrink-0" />
            <span>Top Goleadores</span>
          </button>
          <button
            onClick={() => setActiveTab("participaciones")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "participaciones"
                ? "bg-slate-950 text-white shadow-lg shadow-black/40 border border-white/5"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Trophy className="h-4 w-4 shrink-0" />
            <span>Más Participaciones</span>
          </button>
          <button
            onClick={() => setActiveTab("ataque")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "ataque"
                ? "bg-slate-950 text-white shadow-lg shadow-black/40 border border-white/5"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>Mejor Ataque</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="mb-6">
          <RankingFilterBar
            editions={editionsQuery.data || []}
            selectedEditionId={editionId}
            onEditionChange={setEditionId}
            limit={limit}
            onLimitChange={setLimit}
          />
        </div>

        {/* Tabla de Resultados */}
        <div className="w-full">
          <RankingTable
            data={rankingsQuery.data || []}
            columns={
              activeTab === "goleadores"
                ? goleadoresColumns
                : activeTab === "participaciones"
                ? participacionesColumns
                : ataqueColumns
            }
            loading={rankingsQuery.isLoading}
          />
        </div>
      </main>
    </div>
  );
}
