import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHeadToHead } from "../hooks/useHeadToHead";
import type { H2HEdition } from "../hooks/useHeadToHead";
import SearchSelect from "../components/ui/SearchSelect";
import H2HSummary from "../components/h2h/H2HSummary";
import H2HMetrics from "../components/h2h/H2HMetrics";
import H2HRadarChart from "../components/h2h/H2HRadarChart";
import H2HMatchHistory from "../components/h2h/H2HMatchHistory";
import { 
  Trophy, 
  Shield, 
  User as UserIcon, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  Swords,
  Calendar,
  Sparkles,
  Loader2,
  TrendingUp
} from "lucide-react";

export default function HeadToHeadPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeframe, setTimeframe] = useState<"global" | "edition">("global");

  const {
    type,
    setType,
    idA,
    setIdA,
    idB,
    setIdB,
    editionId,
    setEditionId,
    teams,
    players,
    editions,
    isLoadingOptions,
    comparison,
    isLoadingComparison,
    isErrorComparison,
  } = useHeadToHead();

  // Resetear filtros temporales cuando cambia a global
  useEffect(() => {
    if (timeframe === "global") {
      setEditionId(null);
    } else if (timeframe === "edition" && editions.length > 0 && editionId === null) {
      // Por defecto elegir la primera edición disponible
      setEditionId(editions[0].id);
    }
  }, [timeframe, editions, setEditionId, editionId]);

  // Navegar al dashboard pasando la pestaña activa en el estado
  const navigateToDashboard = (tab: "ediciones" | "equipos" | "jugadores" | "ingesta") => {
    navigate("/dashboard", { state: { activeTab: tab } });
  };

  // Preparar métricas para el gráfico de radar
  const getRadarMetrics = () => {
    if (!comparison) return [];

    if (type === "equipos") {
      const statsA = comparison.equipo_a.stats;
      const statsB = comparison.equipo_b.stats;
      return [
        { subject: "Copas Mundiales", valueA: statsA.titulos, valueB: statsB.titulos },
        { subject: "Partidos", valueA: statsA.total_partidos, valueB: statsB.total_partidos },
        { subject: "Goles Favor", valueA: statsA.goles_a_favor, valueB: statsB.goles_a_favor },
        { subject: "Goles Contra", valueA: statsA.goles_en_contra, valueB: statsB.goles_en_contra, lowerIsBetter: true },
        { subject: "Posesión %", valueA: statsA.posesion_promedio, valueB: statsB.posesion_promedio }
      ];
    } else {
      const statsA = comparison.jugador_a.stats;
      const statsB = comparison.jugador_b.stats;
      return [
        { subject: "Partidos", valueA: statsA.total_partidos, valueB: statsB.total_partidos },
        { subject: "Goles", valueA: statsA.goles, valueB: statsB.goles },
        { subject: "Asistencias", valueA: statsA.asistencias, valueB: statsB.asistencias },
        { subject: "Goles + Asist.", valueA: statsA.goles + statsA.asistencias, valueB: statsB.goles + statsB.asistencias },
        { subject: "Tarjetas Amar.", valueA: statsA.tarjetas_amarillas, valueB: statsB.tarjetas_amarillas, lowerIsBetter: true }
      ];
    }
  };

  const radarMetrics = getRadarMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Lateral (Replicado de Dashboard) */}
      <aside className={`h-screen sticky top-0 ${isSidebarCollapsed ? "w-20" : "w-64"} bg-slate-900/40 backdrop-blur-md border-r border-white/5 ${isSidebarCollapsed ? "p-4 md:px-3" : "p-6"} flex flex-col justify-between z-10 shrink-0 transition-all duration-300`}>
        <div className="space-y-8">
          {/* Logo */}
          <div 
            onClick={() => navigate("/")}
            className={`flex items-center cursor-pointer ${isSidebarCollapsed ? "justify-center" : "gap-2"}`}
          >
            <Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
            <span className={`font-extrabold text-lg tracking-wider bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent transition-all duration-300 ${isSidebarCollapsed ? "hidden" : ""}`}>
              MUNDIAL<span className="text-white font-medium text-xs ml-1 tracking-normal">Data</span>
            </span>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-4">
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

            <hr className="border-white/5 my-4" />

            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-2">
                  ANÁLISIS
                </div>
              )}
              <div className="space-y-1">
                <button
                  title="Head-to-Head"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                >
                  <Swords className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Head-to-Head</span>
                </button>
              </div>
            </div>

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
          </nav>
        </div>

        {/* Footer Sidebar (Collapse toggle) */}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold mb-2 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Estadísticas Avanzadas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Comparativas Cara a Cara (H2H)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Enfréntate a la historia. Compara selecciones o jugadores para evaluar rendimiento, victorias y goles.
            </p>
          </div>
        </div>

        {/* Controladores y Selectores */}
        <div className="glassmorphism rounded-2xl border border-white/5 p-6 space-y-6 mb-8 relative z-30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs de tipo: Selecciones vs Jugadores */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 self-start">
              <button
                onClick={() => setType("equipos")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === "equipos"
                    ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Comparar Selecciones
              </button>
              <button
                onClick={() => setType("jugadores")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === "jugadores"
                    ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Comparar Jugadores
              </button>
            </div>

            {/* Rango de tiempo: Histórico vs Edición */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setTimeframe("global")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeframe === "global"
                      ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Histórico Global
                </button>
                <button
                  onClick={() => setTimeframe("edition")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeframe === "edition"
                      ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Por Edición
                </button>
              </div>

              {/* Selector de Edición si está activo */}
              {timeframe === "edition" && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-3 duration-200">
                  <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
                  <select
                    value={editionId || ""}
                    onChange={(e) => setEditionId(Number(e.target.value))}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-500 transition-colors"
                  >
                    {editions.map((ed: H2HEdition) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.anio} - {ed.pais_anfitrion}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Buscadores de Entidad */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Entidad A */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-1">
                LADO A (CYAN)
              </label>
              <SearchSelect
                options={type === "equipos" ? teams : players}
                value={idA}
                onChange={setIdA}
                placeholder={type === "equipos" ? "Seleccionar primera selección..." : "Seleccionar primer jugador..."}
                loading={isLoadingOptions}
              />
            </div>

            {/* Icono central de VS */}
            <div className="md:col-span-1 flex justify-center pt-5">
              <div className="p-3 rounded-full bg-slate-900/60 border border-white/10 text-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <Swords className="h-5 w-5" />
              </div>
            </div>

            {/* Entidad B */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest px-1">
                LADO B (AMBER)
              </label>
              <SearchSelect
                options={type === "equipos" ? teams : players}
                value={idB}
                onChange={setIdB}
                placeholder={type === "equipos" ? "Seleccionar segunda selección..." : "Seleccionar segundo jugador..."}
                loading={isLoadingOptions}
              />
            </div>
          </div>
        </div>

        {/* Visualización de Datos */}
        {isLoadingComparison ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Cargando comparativa Head-to-Head...</span>
          </div>
        ) : isErrorComparison ? (
          <div className="glassmorphism p-10 rounded-2xl border border-red-500/10 text-center max-w-lg mx-auto">
            <p className="text-red-400 text-sm font-semibold">
              Ocurrió un error al cargar los datos comparativos. Por favor intente de nuevo.
            </p>
          </div>
        ) : comparison ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Resumen H2H (Solo para Selecciones) */}
            {type === "equipos" && (
              <H2HSummary
                nameA={comparison.equipo_a.nombre}
                nameB={comparison.equipo_b.nombre}
                totalMatches={comparison.resumen.total_partidos}
                winsA={comparison.resumen.victorias_a}
                draws={comparison.resumen.empates}
                winsB={comparison.resumen.victorias_b}
              />
            )}

            {/* Grilla comparativa: Gráfico de radar y Métricas comparativas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Gráfico Radar */}
              <H2HRadarChart
                nameA={type === "equipos" ? comparison.equipo_a.nombre : comparison.jugador_a.nombre}
                nameB={type === "equipos" ? comparison.equipo_b.nombre : comparison.jugador_b.nombre}
                metrics={radarMetrics}
              />

              {/* Barras de métricas */}
              <H2HMetrics
                type={type}
                statsA={type === "equipos" ? comparison.equipo_a.stats : comparison.jugador_a.stats}
                statsB={type === "equipos" ? comparison.equipo_b.stats : comparison.jugador_b.stats}
              />
            </div>

            {/* Historial de partidos (Solo para selecciones) */}
            {type === "equipos" && (
              <H2HMatchHistory
                matches={comparison.partidos}
                nameA={comparison.equipo_a.nombre}
                nameB={comparison.equipo_b.nombre}
              />
            )}
          </div>
        ) : (
          /* Estado Vacío / Hero de Selección */
          <div className="glassmorphism rounded-2xl border border-white/5 p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="p-4 rounded-full bg-slate-900 border border-white/10 text-yellow-500 shadow-md">
              <Swords className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Comenzar el Análisis Head-to-Head
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Selecciona dos equipos o jugadores del catálogo para contrastar su historial de partidos,
              títulos, efectividad y otras estadísticas avanzadas.
            </p>

            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>Datos Históricos Oficiales</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
