import { Calendar } from "lucide-react";

interface Edition {
  id: number;
  anio: number;
  pais_anfitrion: string;
  campeon: string;
}

interface RankingFilterBarProps {
  editions: Edition[];
  selectedEditionId: number | null;
  onEditionChange: (id: number | null) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export default function RankingFilterBar({
  editions,
  selectedEditionId,
  onEditionChange,
  limit,
  onLimitChange,
}: RankingFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filtro de Ediciones */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Edición Mundial:
          </span>
          <select
            value={selectedEditionId || ""}
            onChange={(e) => {
              const val = e.target.value;
              onEditionChange(val ? Number(val) : null);
            }}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-500 transition-colors"
          >
            <option value="">Histórico Global</option>
            {editions.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.anio} - {ed.pais_anfitrion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selector de Top (Límite) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Mostrar Top:
        </span>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
          {[5, 10, 20].map((num) => (
            <button
              key={num}
              onClick={() => onLimitChange(num)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                limit === num
                  ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
