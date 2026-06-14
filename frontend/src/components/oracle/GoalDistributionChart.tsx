import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GoalDistributionChartProps {
  teamAName: string;
  teamBName: string;
  distA: Record<string, number>;
  distB: Record<string, number>;
}

export default function GoalDistributionChart({
  teamAName,
  teamBName,
  distA,
  distB,
}: GoalDistributionChartProps) {
  // Mapear los datos al formato de Recharts
  const categories = ["0", "1", "2", "3", "4", "5+"];
  
  const chartData = categories.map((cat) => {
    const label = cat === "1" ? "1 Gol" : `${cat} Goles`;
    return {
      name: cat === "5+" ? "5+ Goles" : label,
      [teamAName]: parseFloat((distA[cat] * 100).toFixed(1)),
      [teamBName]: parseFloat((distB[cat] * 100).toFixed(1)),
    };
  });

  return (
    <div className="w-full h-80 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Distribución de Probabilidad de Goles
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-400">
          Porcentaje de probabilidad de que cada selección anote una cantidad específica de goles.
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0f19",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
              }}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
            />
            <Bar 
              name={teamAName} 
              dataKey={teamAName} 
              fill="#06b6d4" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={30}
            />
            <Bar 
              name={teamBName} 
              dataKey={teamBName} 
              fill="#e5b842" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
