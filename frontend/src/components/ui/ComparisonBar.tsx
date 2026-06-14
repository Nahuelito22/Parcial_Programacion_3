import React from "react";

interface ComparisonBarProps {
  label: string;
  valueA: number;
  valueB: number;
  colorA?: string; // Tailwind class, e.g., 'from-cyan-500 to-blue-600'
  colorB?: string; // Tailwind class, e.g., 'from-amber-500 to-orange-600'
  textColorA?: string;
  textColorB?: string;
}

export default function ComparisonBar({
  label,
  valueA,
  valueB,
  colorA = "from-cyan-500 to-blue-600",
  colorB = "from-yellow-500 to-amber-600",
  textColorA = "text-cyan-400",
  textColorB = "text-yellow-500",
}: ComparisonBarProps) {
  const total = valueA + valueB;
  
  // Calcular porcentajes relativos. Si el total es 0, ambos al 0%
  const pctA = total > 0 ? (valueA / total) * 100 : 0;
  const pctB = total > 0 ? (valueB / total) * 100 : 0;

  return (
    <div className="w-full space-y-2 py-3 border-b border-white/[0.03] last:border-b-0">
      {/* Etiquetas e información de valores */}
      <div className="flex items-center justify-between text-sm">
        {/* Valor Entidad A */}
        <span className={`font-mono font-bold text-base ${textColorA}`}>
          {typeof valueA === "number" && !Number.isInteger(valueA)
            ? valueA.toFixed(1)
            : valueA}
        </span>

        {/* Nombre de la Métrica */}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
          {label}
        </span>

        {/* Valor Entidad B */}
        <span className={`font-mono font-bold text-base ${textColorB}`}>
          {typeof valueB === "number" && !Number.isInteger(valueB)
            ? valueB.toFixed(1)
            : valueB}
        </span>
      </div>

      {/* Barra de progreso back-to-back */}
      <div className="grid grid-cols-2 gap-1.5 items-center w-full">
        {/* Lado A (Crece de derecha a izquierda) */}
        <div className="w-full bg-slate-900/60 h-2.5 rounded-l-full overflow-hidden flex justify-end border border-white/5 border-r-0">
          <div
            style={{ width: `${pctA}%` }}
            className={`h-full bg-gradient-to-l ${colorA} rounded-l-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(6,182,212,0.15)]`}
          />
        </div>

        {/* Lado B (Crece de izquierda a derecha) */}
        <div className="w-full bg-slate-900/60 h-2.5 rounded-r-full overflow-hidden flex justify-start border border-white/5 border-l-0">
          <div
            style={{ width: `${pctB}%` }}
            className={`h-full bg-gradient-to-r ${colorB} rounded-r-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(234,179,8,0.15)]`}
          />
        </div>
      </div>
    </div>
  );
}
