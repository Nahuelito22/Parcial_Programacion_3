import { motion } from "framer-motion";

interface LiveIndicatorProps {
  status: string; // 'notstarted', 'HT', 'FT', '15', '45+2', etc.
  finalizado: boolean;
  fecha: string; // "06/11/2026 13:00"
}

export default function LiveIndicator({ status, finalizado, fecha }: LiveIndicatorProps) {
  // Extraer la hora del string de fecha local
  const getMatchTime = () => {
    try {
      const parts = fecha.split(" ");
      return parts.length > 1 ? parts[1] : fecha;
    } catch {
      return fecha;
    }
  };

  const isLive = !finalizado && status !== "notstarted" && status !== "Match Finished";

  if (isLive) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-extrabold uppercase tracking-wider">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"
        />
        <span>
          {status.toLowerCase() === "ht" ? "Entretiempo (HT)" : `En Vivo — ${status}'`}
        </span>
      </div>
    );
  }

  if (finalizado || status === "Match Finished") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">
        Finalizado (FT)
      </span>
    );
  }

  // Partido programado (Upcoming)
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
      {getMatchTime()} hs
    </span>
  );
}
