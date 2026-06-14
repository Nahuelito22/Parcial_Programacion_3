import SearchSelect from "../ui/SearchSelect";
import { Sparkles, Brain, Cpu, Calendar } from "lucide-react";

interface Team {
  id: number;
  nombre: string;
}

interface Method {
  id: string;
  name: string;
  description: string;
}

interface Edition {
  id: number;
  anio: number;
  pais_anfitrion: string;
}

interface OracleMatchSelectorProps {
  teams: Team[];
  methods: Method[];
  editions: Edition[];
  teamAId: number | null;
  setTeamAId: (id: number | null) => void;
  teamBId: number | null;
  setTeamBId: (id: number | null) => void;
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
  selectedEditionId: number | null;
  setSelectedEditionId: (id: number | null) => void;
  onPredict: () => void;
  loading: boolean;
}

export default function OracleMatchSelector({
  teams,
  methods,
  editions,
  teamAId,
  setTeamAId,
  teamBId,
  setTeamBId,
  selectedMethod,
  setSelectedMethod,
  selectedEditionId,
  setSelectedEditionId,
  onPredict,
  loading,
}: OracleMatchSelectorProps) {
  const isPredictReady = teamAId !== null && teamBId !== null && teamAId !== teamBId;

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 p-6 space-y-6 relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Selección Equipo A */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-1">
            Selección A
          </label>
          <SearchSelect
            options={teams}
            value={teamAId}
            onChange={setTeamAId}
            placeholder="Elegir primera selección..."
            loading={loading}
          />
        </div>

        {/* Separador visual */}
        <div className="md:col-span-1 flex justify-center pt-5">
          <div className="text-gray-500 font-extrabold text-sm tracking-wider">VS</div>
        </div>

        {/* Selección Equipo B */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest px-1">
            Selección B
          </label>
          <SearchSelect
            options={teams}
            value={teamBId}
            onChange={setTeamBId}
            placeholder="Elegir segunda selección..."
            loading={loading}
          />
        </div>
      </div>

      {/* Controles de Configuración del Oráculo */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Selector de Edición / Histórico */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edición:</span>
            <select
              value={selectedEditionId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedEditionId(val ? Number(val) : null);
              }}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="">Histórico Global</option>
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.anio} - {ed.pais_anfitrion}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Método Predictivo */}
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-yellow-500 shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motor:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  title={m.description}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedMethod === m.id
                      ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m.id === "ml" ? <Cpu className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {m.id === "ml" ? "Machine Learning" : "Monte Carlo"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de Invocación del Oráculo */}
        <button
          onClick={onPredict}
          disabled={!isPredictReady || loading}
          className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            isPredictReady && !loading
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-yellow-500/10 hover:shadow-yellow-500/25"
              : "bg-slate-900 border border-white/5 text-gray-500 cursor-not-allowed opacity-50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{loading ? "Invocando..." : "Predecir"}</span>
        </button>
      </div>
    </div>
  );
}
