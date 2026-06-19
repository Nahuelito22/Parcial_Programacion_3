import { Goleador2026 } from "../../hooks/useWorldCup2026";

interface Props {
  goleadores: Goleador2026[];
}

export default function StatsGoleadores({ goleadores }: Props) {
  if (!goleadores || goleadores.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        No hay datos de goleadores disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-yellow-500 uppercase tracking-wider mb-4">
        Goleadores
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
              <th className="text-left py-3 px-4 w-12">#</th>
              <th className="text-left py-3 px-4">Jugador</th>
              <th className="text-left py-3 px-4">Equipo</th>
              <th className="text-center py-3 px-4 w-16">PJ</th>
              <th className="text-center py-3 px-4 w-16">Goles</th>
            </tr>
          </thead>
          <tbody>
            {goleadores.map((g, idx) => (
              <tr
                key={`${g.nombre}-${idx}`}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {g.nombre}
                </td>
                <td className="py-3 px-4 text-gray-300">{g.equipo}</td>
                <td className="py-3 px-4 text-center text-gray-400">
                  {g.partidos}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 font-bold text-sm">
                    {g.goles}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
