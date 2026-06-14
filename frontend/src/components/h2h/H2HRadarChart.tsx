import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface MetricItem {
  subject: string;
  valueA: number;
  valueB: number;
  lowerIsBetter?: boolean;
}

interface H2HRadarChartProps {
  nameA: string;
  nameB: string;
  metrics: MetricItem[];
}

export default function H2HRadarChart({
  nameA,
  nameB,
  metrics,
}: H2HRadarChartProps) {
  // Normalizar datos para que se muestren en la misma escala (0 a 100)
  const chartData = metrics.map((m) => {
    let normA = 0;
    let normB = 0;

    const valA = m.valueA;
    const valB = m.valueB;

    if (m.lowerIsBetter) {
      // Para métricas donde "menos es mejor" (ej: goles en contra)
      const min = Math.min(valA, valB);
      if (min === 0 && valA === 0 && valB === 0) {
        normA = 100;
        normB = 100;
      } else {
        // El menor obtiene 100, el otro obtiene una puntuación proporcionalmente menor
        normA = valA === 0 ? 100 : (min / Math.max(valA, 1)) * 100;
        normB = valB === 0 ? 100 : (min / Math.max(valB, 1)) * 100;
      }
    } else {
      // Para métricas normales
      const max = Math.max(valA, valB);
      if (max === 0) {
        normA = 0;
        normB = 0;
      } else {
        normA = (valA / max) * 100;
        normB = (valB / max) * 100;
      }
    }

    return {
      subject: m.subject,
      [nameA]: normA,
      [nameB]: normB,
      rawA: valA,
      rawB: valB,
    };
  });

  return (
    <div className="w-full h-80 relative flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-4">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">
        Análisis de Rendimiento Relativo
      </h3>
      
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgba(156, 163, 175, 0.8)", fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            
            {/* Radar para Entidad A (Cyan) */}
            <Radar
              name={nameA}
              dataKey={nameA}
              stroke="rgb(6, 182, 212)"
              fill="rgb(6, 182, 212)"
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
            
            {/* Radar para Entidad B (Amber) */}
            <Radar
              name={nameB}
              dataKey={nameB}
              stroke="rgb(234, 179, 8)"
              fill="rgb(234, 179, 8)"
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda Personalizada */}
      <div className="flex gap-6 mt-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-500 border border-cyan-400" />
          <span className="text-gray-300">{nameA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500 border border-yellow-400" />
          <span className="text-gray-300">{nameB}</span>
        </div>
      </div>
    </div>
  );
}
