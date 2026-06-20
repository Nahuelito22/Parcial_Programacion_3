import type { Tarjeta2026 } from "../../hooks/useWorldCup2026";

interface Props {
  tarjetas: Tarjeta2026[];
}

export default function StatsTarjetas({ tarjetas }: Props) {
  if (!tarjetas || tarjetas.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        No hay datos de tarjetas disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-red-500 uppercase tracking-wider mb-4">
        Tarjetas por Equipo
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
              <th className="text-left py-3 px-4 w-12">#</th>
              <th className="text-left py-3 px-4">Equipo</th>
              <th className="text-center py-3 px-4 w-16">PJ</th>
              <th className="text-center py-3 px-4 w-16">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 mr-1" />
                TA
              </th>
              <th className="text-center py-3 px-4 w-16">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1" />
                TR
              </th>
              <th className="text-center py-3 px-4 w-16">PTS</th>
            </tr>
          </thead>
          <tbody>
            {tarjetas.map((t, idx) => (
              <tr
                key={`${t.equipo_codigo}-${idx}`}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {t.equipo}
                  <span className="ml-2 text-xs text-gray-500">
                    {t.equipo_codigo}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-400">
                  {t.partidos}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-xs">
                    {t.amarillas}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/20 text-red-500 font-bold text-xs">
                    {t.rojas}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-300 font-mono">
                  {t.puntos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
