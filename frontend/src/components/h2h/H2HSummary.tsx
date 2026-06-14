import { Swords, Trophy, Activity } from "lucide-react";

interface H2HSummaryProps {
  nameA: string;
  nameB: string;
  totalMatches: number;
  winsA: number;
  draws: number;
  winsB: number;
}

export default function H2HSummary({
  nameA,
  nameB,
  totalMatches,
  winsA,
  draws,
  winsB,
}: H2HSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Tarjeta 1: Partidos Totales */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Enfrentamientos
          </span>
          <Swords className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-white font-mono leading-none">
            {totalMatches}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
            Partidos Disputados
          </p>
        </div>
      </div>

      {/* Tarjeta 2: Victorias A */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[80%]">
            Victorias {nameA}
          </span>
          <Trophy className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-cyan-400 font-mono leading-none">
            {winsA}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
            {totalMatches > 0 ? ((winsA / totalMatches) * 100).toFixed(0) : 0}% de efectividad
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Empates */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-slate-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Empates
          </span>
          <Activity className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-gray-400 font-mono leading-none">
            {draws}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
            {totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(0) : 0}% de los partidos
          </p>
        </div>
      </div>

      {/* Tarjeta 4: Victorias B */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-yellow-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[80%]">
            Victorias {nameB}
          </span>
          <Trophy className="h-4 w-4 text-yellow-400" />
        </div>
        <div>
          <h4 className="text-2xl font-black text-yellow-500 font-mono leading-none">
            {winsB}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
            {totalMatches > 0 ? ((winsB / totalMatches) * 100).toFixed(0) : 0}% de efectividad
          </p>
        </div>
      </div>
    </div>
  );
}
