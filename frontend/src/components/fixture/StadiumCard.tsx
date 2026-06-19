import type { Stadium2026 } from "../../hooks/useWorldCup2026";
import { Landmark } from "lucide-react";

interface StadiumCardProps {
  estadio: Stadium2026;
}

export default function StadiumCard({ estadio }: StadiumCardProps) {
  const { nombre_en, nombre_fifa, ciudad, pais, capacidad } = estadio;

  // Formatear capacidad
  const formatCapacity = (cap: number | null) => {
    if (!cap) return "Capacidad N/D";
    return `${cap.toLocaleString("es-ES")} espectadores`;
  };

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 p-5 flex flex-col justify-between hover:border-yellow-500/20 hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden h-full">
      {/* Luz decorativa */}
      <div className="absolute -left-8 -top-8 w-24 h-24 bg-yellow-500/[0.01] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="space-y-3 relative z-10">
        {/* Ícono de Estadio */}
        <div className="h-10 w-10 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform duration-300">
          <Landmark className="h-5 w-5" />
        </div>

        <div>
          {/* Nombre Estadio */}
          <h4 className="font-extrabold text-white text-sm sm:text-base group-hover:text-yellow-400 transition-colors duration-200 line-clamp-1">
            {nombre_en}
          </h4>
          {/* Nombre Oficial FIFA si difiere */}
          {nombre_fifa && nombre_fifa !== nombre_en && (
            <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
              Nombre FIFA: {nombre_fifa}
            </p>
          )}
        </div>
      </div>

      {/* Localización y Capacidad */}
      <div className="mt-5 pt-3 border-t border-white/5 space-y-1 relative z-10">
        <p className="text-xs text-gray-300 font-medium">
          📍 {ciudad}, <span className="text-gray-400 font-light">{pais}</span>
        </p>
        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
          {formatCapacity(capacidad)}
        </p>
      </div>
    </div>
  );
}
