import type { GroupStanding } from "../../hooks/useWorldCup2026";

interface GroupStandingsProps {
  grupoInfo: GroupStanding;
}

export default function GroupStandings({ grupoInfo }: GroupStandingsProps) {
  const { grupo, equipos } = grupoInfo;

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full hover:border-yellow-500/10 transition-all duration-300">
      {/* Cabecera del Grupo */}
      <div className="bg-slate-900/60 border-b border-white/5 py-4 px-5">
        <h3 className="font-extrabold text-white tracking-wide text-sm font-title uppercase">
          Grupo {grupo}
        </h3>
      </div>

      {/* Tabla de Posiciones */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[320px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-3 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8">#</th>
              <th className="py-3 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selección</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8" title="Partidos Jugados">PJ</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8" title="Victorias">PG</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8" title="Empates">PE</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8" title="Derrotas">PP</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-10 hidden sm:table-cell" title="Goles a Favor">GF</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-10 hidden sm:table-cell" title="Goles en Contra">GC</th>
              <th className="py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-10" title="Diferencia de Goles">DG</th>
              <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-12" title="Puntos">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {equipos.map((team, index) => {
              const isQualifiedZone = index < 2; // Clasificación directa
              const isPossibleThird = index === 2; // Posible mejor tercero

              return (
                <tr
                  key={team.team_id}
                  className="hover:bg-white/[0.02] transition-colors duration-150 relative"
                >
                  {/* Posición */}
                  <td className="py-3 px-3 text-xs text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${
                        isQualifiedZone
                          ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                          : isPossibleThird
                          ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                          : "text-gray-500 border border-transparent"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Nombre y bandera */}
                  <td className="py-3 px-3 text-xs font-semibold text-white">
                    <div className="flex items-center gap-2">
                      {team.bandera ? (
                        <img
                          src={team.bandera}
                          alt={team.nombre}
                          className="h-4 w-6 object-cover rounded shadow border border-white/5 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0 w-6">
                          {team.codigo}
                        </span>
                      )}
                      <span className="line-clamp-1 truncate max-w-[120px] sm:max-w-none">
                        {team.nombre}
                      </span>
                    </div>
                  </td>

                  {/* PJ */}
                  <td className="py-3 px-2 text-xs text-center font-medium text-gray-300">
                    {team.pj}
                  </td>
                  {/* PG */}
                  <td className="py-3 px-2 text-xs text-center font-light text-gray-400">
                    {team.pg}
                  </td>
                  {/* PE */}
                  <td className="py-3 px-2 text-xs text-center font-light text-gray-400">
                    {team.pe}
                  </td>
                  {/* PP */}
                  <td className="py-3 px-2 text-xs text-center font-light text-gray-400">
                    {team.pp}
                  </td>

                  {/* GF/GC (sólo sm+) */}
                  <td className="py-3 px-2 text-xs text-center font-light text-gray-500 hidden sm:table-cell">
                    {team.gf}
                  </td>
                  <td className="py-3 px-2 text-xs text-center font-light text-gray-500 hidden sm:table-cell">
                    {team.gc}
                  </td>

                  {/* DG */}
                  <td
                    className={`py-3 px-2 text-xs text-center font-semibold ${
                      team.dg > 0
                        ? "text-emerald-500"
                        : team.dg < 0
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {team.dg > 0 ? `+${team.dg}` : team.dg}
                  </td>

                  {/* Puntos */}
                  <td className="py-3 px-4 text-xs text-center font-bold text-yellow-500 bg-yellow-500/[0.01]">
                    {team.pts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
