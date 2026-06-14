import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProbabilityGaugeProps {
  teamAName: string;
  teamBName: string;
  probA: number;     // 0 a 1
  probDraw: number;  // 0 a 1
  probB: number;     // 0 a 1
}

export default function ProbabilityGauge({
  teamAName,
  teamBName,
  probA,
  probDraw,
  probB,
}: ProbabilityGaugeProps) {
  // Convertir a porcentajes para mostrar
  const pctA = Math.round(probA * 100);
  const pctDraw = Math.round(probDraw * 100);
  const pctB = Math.round(probB * 100);

  // Asegurar que la suma es 100 para evitar desajustes visuales
  const total = pctA + pctDraw + pctB;
  const adjustedPctDraw = total !== 100 ? pctDraw + (100 - total) : pctDraw;

  const data = [
    { name: teamAName, value: pctA, color: "#06b6d4" },          // Cyan (Lado A)
    { name: "Empate", value: adjustedPctDraw, color: "#475569" }, // Slate-600 (Empate)
    { name: teamBName, value: pctB, color: "#e5b842" },          // Gold-500 (Lado B)
  ];

  // Determinar quién tiene mayor probabilidad para mostrar en el centro
  let resultText = "Empate Probable";
  let resultPct = adjustedPctDraw;
  let resultColor = "text-slate-400";

  if (pctA > adjustedPctDraw && pctA >= pctB) {
    resultText = `Favorito: ${teamAName}`;
    resultPct = pctA;
    resultColor = "text-cyan-400";
  } else if (pctB > adjustedPctDraw && pctB >= pctA) {
    resultText = `Favorito: ${teamBName}`;
    resultPct = pctB;
    resultColor = "text-yellow-500";
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto relative h-56">
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="95%"
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Contenido flotante en el centro del semicírculo */}
      <div className="absolute bottom-6 flex flex-col items-center text-center">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          {resultPct}%
        </span>
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${resultColor} mt-1`}>
          {resultText}
        </span>
      </div>

      {/* Leyenda Inferior */}
      <div className="flex items-center gap-6 justify-center mt-2 w-full text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <div className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" />
          <span>{teamAName}: {pctA}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <div className="h-2.5 w-2.5 rounded-full bg-[#475569]" />
          <span>Empate: {adjustedPctDraw}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-500">
          <div className="h-2.5 w-2.5 rounded-full bg-[#e5b842]" />
          <span>{teamBName}: {pctB}%</span>
        </div>
      </div>
    </div>
  );
}
