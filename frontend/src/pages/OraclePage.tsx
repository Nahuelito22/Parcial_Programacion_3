import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOracle } from "../hooks/useOracle";
import OracleMatchSelector from "../components/oracle/OracleMatchSelector";
import ProbabilityGauge from "../components/ui/ProbabilityGauge";
import GoalDistributionChart from "../components/oracle/GoalDistributionChart";
import { motion, AnimatePresence } from "framer-motion";
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
  Brain,
  Info
} from "lucide-react";

export default function OraclePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    teamAId,
    setTeamAId,
    teamBId,
    setTeamBId,
    selectedMethod,
    setSelectedMethod,
    selectedEditionId,
    setSelectedEditionId,
    teams,
    methods,
    editions,
    isLoadingOptions,
    prediction,
    isLoadingPrediction,
    isErrorPrediction,
    predict,
    resetPrediction,
  } = useOracle();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const navigateToDashboard = (tab: "ediciones" | "equipos" | "jugadores" | "ingesta") => {
    navigate("/dashboard", { state: { activeTab: tab } });
  };

  // Encontrar nombres de equipos seleccionados para los resultados
  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Lateral (Replicado del Dashboard) */}
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
                  onClick={() => navigate("/dashboard/fixture-2026")}
                  title="Fixture 2026"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
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
                  title="Oráculo IA"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500"
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
            <span>Predicciones Científicas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            El Oráculo IA
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Simula encuentros futuros o hipotéticos cruzando promedios estadísticos mediante Monte Carlo de Poisson o clasificadores de Machine Learning.
          </p>
        </div>

        {/* Panel Selector */}
        <div className="mb-8">
          <OracleMatchSelector
            teams={teams}
            methods={methods}
            editions={editions}
            teamAId={teamAId}
            setTeamAId={(id) => {
              setTeamAId(id);
              resetPrediction();
            }}
            teamBId={teamBId}
            setTeamBId={(id) => {
              setTeamBId(id);
              resetPrediction();
            }}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            selectedEditionId={selectedEditionId}
            setSelectedEditionId={setSelectedEditionId}
            onPredict={predict}
            loading={isLoadingOptions || isLoadingPrediction}
          />
        </div>

        {/* Zona de Resultados de la Predicción */}
        <AnimatePresence mode="wait">
          {isLoadingPrediction && (
            <motion.div
              key="loading-oracle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                <Brain className="h-5 w-5 text-yellow-500 absolute animate-pulse" />
              </div>
              <div className="text-center">
                <span className="block text-sm text-white font-bold">Invocando al Oráculo...</span>
                <span className="block text-xs text-gray-500 mt-1">
                  {selectedMethod === "ml"
                    ? "Consultando clasificador RandomForest..."
                    : "Simulando 10,000 partidos en base a distribución de Poisson..."}
                </span>
              </div>
            </motion.div>
          )}

          {isErrorPrediction && (
            <motion.div
              key="error-oracle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glassmorphism p-8 rounded-2xl border border-red-500/10 text-center max-w-lg mx-auto flex flex-col items-center gap-3"
            >
              <div className="p-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Error de Simulación</h3>
              <p className="text-xs text-gray-400">
                No se pudo completar la simulación. Asegúrate de que los equipos seleccionados tengan datos cargados en el sistema o reintenta en unos instantes.
              </p>
            </motion.div>
          )}

          {prediction && teamA && teamB && !isLoadingPrediction && (
            <motion.div
              key="prediction-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              {/* Bloque Principal del Resultado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Panel del Gauge de Probabilidades */}
                <div className="glassmorphism rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                      Probabilidad de Resultado
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Cálculo de probabilidad del resultado del encuentro en tiempo reglamentario.
                    </p>
                  </div>

                  <div className="my-auto py-4">
                    <ProbabilityGauge
                      teamAName={teamA.nombre}
                      teamBName={teamB.nombre}
                      probA={prediction.probabilidades.victoria_a}
                      probDraw={prediction.probabilidades.empate}
                      probB={prediction.probabilidades.victoria_b}
                    />
                  </div>

                  <div className="text-[10px] sm:text-xs text-gray-400 border-t border-white/5 pt-4 leading-relaxed flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-500 shrink-0" />
                    <span>
                      {prediction.metodo_usado.includes("monte_carlo")
                        ? `Resultado obtenido tras ejecutar ${prediction.simulaciones?.toLocaleString()} simulaciones Monte Carlo, cruzando goles promedio a favor/contra bajo distribución Poisson.`
                        : "Resultado predicho a través del clasificador supervisado RandomForest entrenado de forma histórica."}
                    </span>
                  </div>
                </div>

                {/* Resumen de Expectativas */}
                <div className="flex flex-col gap-6">
                  {/* Tarjeta de Marcador más Probable */}
                  <div className="glassmorphism rounded-2xl border border-white/5 p-6 flex flex-col justify-between flex-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div>
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                        Resultado Recomendado
                      </span>
                      <h4 className="text-white text-base font-bold mt-1">Marcador Más Probable</h4>
                    </div>

                    <div className="flex items-center justify-center py-6 gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{teamA.nombre}</span>
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 text-white">
                          {prediction.most_likely_score.split("-")[0]}
                        </span>
                      </div>
                      <div className="text-gray-600 font-bold text-xl">-</div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">{teamB.nombre}</span>
                        <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 text-white">
                          {prediction.most_likely_score.split("-")[1]}
                        </span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-500 border-t border-white/5 pt-3">
                      Goles esperados: <span className="text-cyan-400 font-semibold">{prediction.goles_esperados.a}</span> (A) vs <span className="text-yellow-500 font-semibold">{prediction.goles_esperados.b}</span> (B)
                    </div>
                  </div>

                  {/* Explicación Corta */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex gap-3.5 items-start">
                    <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 shrink-0">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-white tracking-wider">Análisis Relativo</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">
                        La simulación evalúa la fuerza de ataque de cada selección y la contrasta con la solidez defensiva de su oponente. {prediction.goles_esperados.a > prediction.goles_esperados.b ? `${teamA.nombre} presenta un promedio ofensivo superior considerando los goles en contra históricos de ${teamB.nombre}.` : `${teamB.nombre} presenta un promedio ofensivo superior considerando los goles en contra históricos de ${teamA.nombre}.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Distribución de Goles */}
              <div className="w-full">
                <GoalDistributionChart
                  teamAName={teamA.nombre}
                  teamBName={teamB.nombre}
                  distA={prediction.distribucion_goles_local}
                  distB={prediction.distribucion_goles_visitante}
                />
              </div>
            </motion.div>
          )}

          {!prediction && !isLoadingPrediction && (
            <motion.div
              key="empty-oracle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glassmorphism rounded-2xl border border-white/5 p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="p-4 rounded-full bg-slate-900 border border-white/10 text-yellow-500 shadow-md">
                <Brain className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Consultar el Oráculo IA
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Elige dos selecciones nacionales del menú de arriba y haz clic en "Predecir" para proyectar la probabilidad de victoria o empate del partido mediante simulación estadística Poisson o Machine Learning supervisado.
              </p>

              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  <span>Cálculos de Poisson en tiempo real</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
