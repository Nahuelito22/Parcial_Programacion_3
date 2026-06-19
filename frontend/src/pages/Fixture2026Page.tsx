import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useFixtures2026,
  useTeams2026,
  useGroups2026,
  useStadiums2026
} from "../hooks/useWorldCup2026";
import FixtureCard2026 from "../components/fixture/FixtureCard2026";
import GroupStandings from "../components/fixture/GroupStandings";
import TeamCard from "../components/fixture/TeamCard";
import StadiumCard from "../components/fixture/StadiumCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Shield,
  User as UserIcon,
  Database,
  Swords,
  TrendingUp,
  Brain,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Calendar,
  Layers,
  Flame
} from "lucide-react";

type TabType = "fixture" | "grupos" | "equipos" | "estadios";

export default function Fixture2026Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("fixture");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  // Consumo de Hooks de Consulta
  const { data: fixturesData, isLoading: loadingFixtures, error: errorFixtures } = useFixtures2026();
  const { data: teams, isLoading: loadingTeams, error: errorTeams } = useTeams2026();
  const { data: groups, isLoading: loadingGroups, error: errorGroups } = useGroups2026();
  const { data: stadiums, isLoading: loadingStadiums, error: errorStadiums } = useStadiums2026();

  const navigateToDashboard = (tab: "ediciones" | "equipos" | "jugadores" | "ingesta") => {
    navigate("/dashboard", { state: { activeTab: tab } });
  };

  // Clasificación de partidos en la pestaña Fixture
  const getFixturesSections = () => {
    if (!fixturesData?.partidos) return { enVivo: [], proximos: [], finalizados: [] };

    const enVivo = fixturesData.partidos.filter(
      (p) => !p.finalizado && p.estado !== "notstarted" && p.estado !== "Match Finished"
    );
    const proximos = fixturesData.partidos.filter(
      (p) => !p.finalizado && p.estado === "notstarted"
    );
    const finalizados = fixturesData.partidos.filter(
      (p) => p.finalizado || p.estado === "Match Finished"
    );

    return { enVivo, proximos, finalizados };
  };

  const { enVivo, proximos, finalizados } = getFixturesSections();

  const isLoading =
    (activeTab === "fixture" && loadingFixtures) ||
    (activeTab === "equipos" && loadingTeams) ||
    (activeTab === "grupos" && loadingGroups) ||
    (activeTab === "estadios" && loadingStadiums);

  const error =
    (activeTab === "fixture" && errorFixtures) ||
    (activeTab === "equipos" && errorTeams) ||
    (activeTab === "grupos" && errorGroups) ||
    (activeTab === "estadios" && errorStadiums);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar Lateral */}
      <aside className={`h-[calc(100vh-4rem)] sticky top-16 ${isSidebarCollapsed ? "w-20" : "w-64"} bg-slate-900/40 backdrop-blur-md border-r border-white/5 ${isSidebarCollapsed ? "p-4 md:px-3" : "p-6"} flex flex-col justify-between z-10 shrink-0 transition-all duration-300`}>
        <div className="space-y-8">
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
                {/* Enlace Fixture 2026 en primer lugar de Análisis */}
                <button
                  title="Fixture 2026"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
                >
                  <Trophy className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Fixture 2026</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard/h2h")}
                  title="Head-to-Head"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                >
                  <Swords className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarCollapsed ? "hidden" : ""}`}>Head-to-Head</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard/rankings")}
                  title="Rankings"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
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

        <div className="pt-4 border-t border-white/5 mt-auto">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer`}
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Colapsar menú</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 min-w-0 px-6 pt-24 pb-6 md:px-10 md:pb-10 z-10 overflow-y-auto max-w-full">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold mb-2 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
            <Trophy className="h-3.5 w-3.5" />
            <span>Mundial FIFA 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Fixture & Estadísticas en Vivo
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Visualiza el fixture de partidos de la Copa del Mundo 2026 en tiempo real, las sedes, las tablas de posiciones y los equipos clasificados.
          </p>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-2">
          {(["fixture", "grupos", "equipos", "estadios"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab === "fixture" && "📅 Fixture"}
              {tab === "grupos" && "🗂️ Tablas de Grupos"}
              {tab === "equipos" && "🛡️ Selecciones"}
              {tab === "estadios" && "🏟️ Estadios Sede"}
            </button>
          ))}
        </div>

        {/* Zona Dinámica de Contenido */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-2026"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Cargando datos del Mundial 2026...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error-2026"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto gap-3"
            >
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Error de Conexión</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {(error as any).response?.data?.message || (error as any).message || "No se pudo obtener información desde el servidor de Flask."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Contenido Pestaña Fixture */}
              {activeTab === "fixture" && (
                <div className="space-y-10">
                  {/* Partidos EN VIVO */}
                  {enVivo.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-500">
                        <Flame className="h-5 w-5 animate-pulse" />
                        <h2 className="text-lg font-extrabold uppercase tracking-wider font-title">En Juego</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {enVivo.map((p) => (
                          <FixtureCard2026 key={p.id} partido={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Partidos Próximos */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Calendar className="h-5 w-5" />
                      <h2 className="text-lg font-extrabold uppercase tracking-wider font-title">Próximos Partidos</h2>
                    </div>
                    {proximos.length === 0 ? (
                      <div className="glassmorphism p-8 rounded-2xl border border-white/5 text-center text-xs text-gray-500">
                        No hay partidos programados pendientes.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {proximos.map((p) => (
                          <FixtureCard2026 key={p.id} partido={p} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Partidos Finalizados */}
                  {finalizados.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Layers className="h-5 w-5" />
                        <h2 className="text-lg font-extrabold uppercase tracking-wider font-title">Resultados Finales</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {finalizados.map((p) => (
                          <FixtureCard2026 key={p.id} partido={p} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contenido Pestaña Grupos */}
              {activeTab === "grupos" && (
                <div>
                  {groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {groups.map((grupoInfo) => (
                        <GroupStandings key={grupoInfo.grupo} grupoInfo={grupoInfo} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-xs text-gray-500">
                      Aún no hay datos de grupos disponibles. Ejecuta la sincronización en el Panel de Control.
                    </div>
                  )}
                </div>
              )}

              {/* Contenido Pestaña Equipos */}
              {activeTab === "equipos" && (
                <div>
                  {teams && teams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {teams.map((t) => (
                        <TeamCard key={t.api_team_id} equipo={t} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-xs text-gray-500">
                      Aún no hay selecciones registradas. Ejecuta la sincronización en el Panel de Control.
                    </div>
                  )}
                </div>
              )}

              {/* Contenido Pestaña Estadios */}
              {activeTab === "estadios" && (
                <div>
                  {stadiums && stadiums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {stadiums.map((s) => (
                        <StadiumCard key={s.api_stadium_id} estadio={s} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-xs text-gray-500">
                      Aún no hay estadios cargados. Ejecuta la sincronización en el Panel de Control.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
