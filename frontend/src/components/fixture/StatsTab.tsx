import { useState } from "react";
import { useStats2026 } from "../../hooks/useWorldCup2026";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

type StatsTabType = "goleadores" | "asistencias" | "tarjetas";

const LIMITS = [5, 10, 20];

export default function StatsTab() {
  const [activeSubTab, setActiveSubTab] = useState<StatsTabType>("goleadores");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStats2026(activeSubTab, limit, page);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const subTabs: { key: StatsTabType; label: string }[] = [
    { key: "goleadores", label: "Goleadores" },
    { key: "asistencias", label: "Asistencias" },
    { key: "tarjetas", label: "Tarjetas" },
  ];

  const handleSubTabChange = (tab: StatsTabType) => {
    setActiveSubTab(tab);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-yellow-500">
        <BarChart3 className="h-5 w-5" />
        <h2 className="text-lg font-extrabold uppercase tracking-wider font-title">
          Estadísticas del Torneo
        </h2>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {subTabs.map((st) => (
          <button
            key={st.key}
            onClick={() => handleSubTabChange(st.key)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeSubTab === st.key
                ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                : "bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Controls: limit selector + pagination info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Mostrar:</span>
          {LIMITS.map((l) => (
            <button
              key={l}
              onClick={() => handleLimitChange(l)}
              className={`px-2 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                limit === l
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {total} registros — Página {page} de {totalPages || 1}
        </span>
      </div>

      {/* Table */}
      <div className="glassmorphism rounded-2xl border border-white/5 p-4 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-gray-500">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No hay datos disponibles. Ejecuta la sincronización en el Panel de Control.
          </div>
        ) : activeSubTab === "goleadores" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                <th className="text-left py-3 px-3 w-10">#</th>
                <th className="text-left py-3 px-3">Jugador</th>
                <th className="text-left py-3 px-3">Equipo</th>
                <th className="text-center py-3 px-3 w-14">PJ</th>
                <th className="text-center py-3 px-3 w-14">Goles</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{item.nombre}</td>
                  <td className="py-3 px-3 text-gray-300">{item.equipo}</td>
                  <td className="py-3 px-3 text-center text-gray-400">{item.partidos}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 font-bold text-sm">
                      {item.goles}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeSubTab === "asistencias" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                <th className="text-left py-3 px-3 w-10">#</th>
                <th className="text-left py-3 px-3">Jugador</th>
                <th className="text-left py-3 px-3">Equipo</th>
                <th className="text-center py-3 px-3 w-14">PJ</th>
                <th className="text-center py-3 px-3 w-14">Asist.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{item.nombre}</td>
                  <td className="py-3 px-3 text-gray-300">{item.equipo}</td>
                  <td className="py-3 px-3 text-center text-gray-400">{item.partidos}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm">
                      {item.asistencias}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                <th className="text-left py-3 px-3 w-10">#</th>
                <th className="text-left py-3 px-3">Equipo</th>
                <th className="text-center py-3 px-3 w-14">PJ</th>
                <th className="text-center py-3 px-3 w-14">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
                  TA
                </th>
                <th className="text-center py-3 px-3 w-14">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
                  TR
                </th>
                <th className="text-center py-3 px-3 w-14">PTS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {item.equipo}
                    <span className="ml-2 text-xs text-gray-500">{item.equipo_codigo}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-400">{item.partidos}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-xs">
                      {item.amarillas}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/20 text-red-500 font-bold text-xs">
                      {item.rojas}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-300 font-mono">{item.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && typeof arr[i - 1] === "number" && p - (arr[i - 1] as number) > 1) {
                acc.push("...");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              typeof p === "string" ? (
                <span key={`dots-${i}`} className="text-gray-600 text-xs px-1">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    page === p
                      ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                      : "text-gray-500 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
