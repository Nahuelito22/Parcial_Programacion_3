import { Calendar, MapPin, Award } from "lucide-react";

interface Match {
  edicion_anio: number;
  fecha: string | null;
  estadio: string;
  local: string;
  visitante: string;
  goles_local: number;
  goles_visitante: number;
  penales_local: number | null;
  penales_visitante: number | null;
  resultado: string;
}

interface H2HMatchHistoryProps {
  matches: Match[];
  nameA: string;
  nameB: string;
}

export default function H2HMatchHistory({
  matches,
  nameA,
  nameB,
}: H2HMatchHistoryProps) {
  if (matches.length === 0) {
    return (
      <div className="glassmorphism p-10 rounded-2xl border border-white/5 text-center max-w-lg mx-auto">
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          No se registran enfrentamientos previos directos entre 
          <span className="text-cyan-400 font-bold mx-1">{nameA}</span> y 
          <span className="text-yellow-500 font-bold mx-1">{nameB}</span> 
          en la historia de los Mundiales de la FIFA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-2">
        Historial de Partidos Oficiales ({matches.length})
      </h3>

      <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Edición</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha / Estadio</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Local</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Resultado</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Visitante</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ganador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.map((m, idx) => {
                const hasPenalties = m.penales_local !== null && m.penales_visitante !== null;
                
                // Determinar ganador
                let winnerText = "Empate";
                let winnerColor = "text-gray-400";
                
                if (m.resultado === "local") {
                  winnerText = m.local;
                  winnerColor = "text-emerald-400 font-semibold";
                } else if (m.resultado === "visitante") {
                  winnerText = m.visitante;
                  winnerColor = "text-emerald-400 font-semibold";
                }

                return (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors duration-150">
                    {/* Edición */}
                    <td className="py-4 px-6 text-sm font-bold text-yellow-500 font-mono">
                      {m.edicion_anio}
                    </td>

                    {/* Fecha y Estadio */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Calendar className="h-3 w-3 text-cyan-400" />
                          <span>{m.fecha || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light truncate max-w-[200px]" title={m.estadio}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{m.estadio}</span>
                        </div>
                      </div>
                    </td>

                    {/* Equipo Local */}
                    <td className="py-4 px-6 text-sm font-bold text-white text-right">
                      {m.local}
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-block bg-slate-900/80 border border-white/5 rounded-lg px-3 py-1.5">
                        <span className="text-base font-black font-mono tracking-wider text-white">
                          {m.goles_local} - {m.goles_visitante}
                        </span>
                        {hasPenalties && (
                          <div className="text-[10px] font-bold text-yellow-500 font-mono leading-none mt-0.5">
                            ({m.penales_local} - {m.penales_visitante} pen)
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Equipo Visitante */}
                    <td className="py-4 px-6 text-sm font-bold text-white text-left">
                      {m.visitante}
                    </td>

                    {/* Ganador */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Award className={`h-3.5 w-3.5 ${m.resultado !== "empate" ? "text-emerald-400" : "text-gray-500"}`} />
                        <span className={`text-xs ${winnerColor}`}>{winnerText}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
