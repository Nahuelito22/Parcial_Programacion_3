import type { Team2026 } from "../../hooks/useWorldCup2026";
import { Shield } from "lucide-react";

interface TeamCardProps {
  equipo: Team2026;
}

export default function TeamCard({ equipo }: TeamCardProps) {
  const { nombre_en, codigo_fifa, grupo, bandera_url } = equipo;

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 p-5 flex items-center justify-between hover:border-yellow-500/20 hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden">
      {/* Luz decorativa */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-yellow-500/[0.02] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Bandera */}
        {bandera_url ? (
          <img
            src={bandera_url}
            alt={nombre_en}
            className="h-12 w-18 object-cover rounded-lg shadow-md border border-white/10 group-hover:scale-105 transition-transform duration-300 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-12 w-18 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-gray-500 text-xs font-black shrink-0">
            <Shield className="h-5 w-5" />
          </div>
        )}

        {/* Detalle */}
        <div>
          <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-yellow-400 transition-colors duration-200">
            {nombre_en}
          </h4>
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
            FIFA: {codigo_fifa}
          </span>
        </div>
      </div>

      {/* Badge de Grupo */}
      <div className="flex flex-col items-center justify-center bg-slate-900/60 border border-white/5 h-10 w-10 rounded-xl relative z-10 font-bold text-xs shrink-0 text-yellow-500 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/20 transition-colors duration-300">
        <span className="text-[7px] text-gray-500 font-semibold tracking-widest uppercase mb-0.5">Grp</span>
        {grupo || "—"}
      </div>
    </div>
  );
}
