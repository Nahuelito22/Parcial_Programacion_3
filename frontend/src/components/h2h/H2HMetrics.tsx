import ComparisonBar from "../ui/ComparisonBar";

interface TeamStats {
  nombre: string;
  total_partidos: number;
  goles_a_favor: number;
  goles_en_contra: number;
  posesion_promedio: number;
  titulos: number;
}

interface PlayerStats {
  nombre: string;
  total_partidos: number;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
}

interface H2HMetricsProps {
  type: "equipos" | "jugadores";
  statsA: any;
  statsB: any;
}

export default function H2HMetrics({ type, statsA, statsB }: H2HMetricsProps) {
  if (type === "equipos") {
    const sA = statsA as TeamStats;
    const sB = statsB as TeamStats;

    return (
      <div className="glassmorphism p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
          Estadísticas Históricas de Selección
        </h3>
        <div className="space-y-1">
          <ComparisonBar
            label="Copas Mundiales (Títulos)"
            valueA={sA.titulos}
            valueB={sB.titulos}
          />
          <ComparisonBar
            label="Partidos Jugados"
            valueA={sA.total_partidos}
            valueB={sB.total_partidos}
          />
          <ComparisonBar
            label="Goles a Favor"
            valueA={sA.goles_a_favor}
            valueB={sB.goles_a_favor}
          />
          <ComparisonBar
            label="Goles en Contra"
            valueA={sA.goles_en_contra}
            valueB={sB.goles_en_contra}
            // Invertimos el degradado visual si se prefiere, pero el ComparisonBar maneja la escala.
            // Para goles en contra, menos es mejor, así que podemos mantener los colores por defecto.
          />
          <ComparisonBar
            label="Posesión Promedio (%)"
            valueA={Number(sA.posesion_promedio.toFixed(1))}
            valueB={Number(sB.posesion_promedio.toFixed(1))}
          />
        </div>
      </div>
    );
  } else {
    const sA = statsA as PlayerStats;
    const sB = statsB as PlayerStats;

    const g_plus_a_A = sA.goles + sA.asistencias;
    const g_plus_a_B = sB.goles + sB.asistencias;

    return (
      <div className="glassmorphism p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
          Estadísticas Históricas del Jugador
        </h3>
        <div className="space-y-1">
          <ComparisonBar
            label="Partidos Jugados"
            valueA={sA.total_partidos}
            valueB={sB.total_partidos}
          />
          <ComparisonBar
            label="Goles Anotados"
            valueA={sA.goles}
            valueB={sB.goles}
          />
          <ComparisonBar
            label="Asistencias"
            valueA={sA.asistencias}
            valueB={sB.asistencias}
          />
          <ComparisonBar
            label="Goles + Asistencias (G+A)"
            valueA={g_plus_a_A}
            valueB={g_plus_a_B}
          />
          <ComparisonBar
            label="Tarjetas Amarillas"
            valueA={sA.tarjetas_amarillas}
            valueB={sB.tarjetas_amarillas}
          />
        </div>
      </div>
    );
  }
}
