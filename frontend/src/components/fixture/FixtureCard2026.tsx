import type { Match2026 } from "../../hooks/useWorldCup2026";
import LiveIndicator from "./LiveIndicator";

interface FixtureCard2026Props {
  partido: Match2026;
}

export default function FixtureCard2026({ partido }: FixtureCard2026Props) {
  const {
    grupo,
    tipo,
    fecha,
    estadio,
    local,
    visitante,
    goles_local,
    goles_visitante,
    goleadores_local,
    goleadores_visitante,
    finalizado,
    estado,
    etapa_detalle
  } = partido;

  // Formatear el tipo/etapa de partido
  const formatStage = () => {
    if (tipo === "group") return `Grupo ${grupo}`;
    const stageMap: Record<string, string> = {
      r32: "Dieciseisavos (R32)",
      r16: "Octavos (R16)",
      qf: "Cuartos de Final",
      sf: "Semifinal",
      third: "Tercer Puesto",
      final: "Gran Final"
    };
    return stageMap[tipo] || tipo.toUpperCase();
  };

  const isStarted = estado !== "notstarted";

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 p-5 flex flex-col justify-between hover:border-yellow-500/20 hover:bg-white/[0.02] transition-all duration-300 relative group">
      {/* Luces decorativas en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/[0.02] to-yellow-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Cabecera de la Tarjeta */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10">
        <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider uppercase">
          {formatStage()}
        </span>
        <LiveIndicator status={estado} finalizado={finalizado} fecha={fecha} />
      </div>

      {/* Detalle Knockout (ej. Winner Group A) */}
      {etapa_detalle && (
        <div className="text-[9px] text-yellow-500/70 font-semibold tracking-wide uppercase text-center mt-1">
          {etapa_detalle}
        </div>
      )}

      {/* Marcador Principal */}
      <div className="grid grid-cols-7 items-center justify-center py-5 relative z-10 gap-2">
        {/* Local Team */}
        <div className="col-span-3 flex flex-col items-center justify-center text-center gap-2">
          {local.bandera ? (
            <img
              src={local.bandera}
              alt={local.nombre}
              className="h-10 w-14 object-cover rounded-md shadow-md shadow-black/40 border border-white/10 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-10 w-14 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] text-gray-500 font-bold">
              {local.codigo || "TBD"}
            </div>
          )}
          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1">
            {local.nombre}
          </span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            {local.codigo}
          </span>
        </div>

        {/* Score / VS */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          {isStarted ? (
            <div className="flex items-center justify-center gap-1 bg-slate-900/60 border border-white/5 py-1.5 px-3 rounded-xl text-base sm:text-lg font-black font-title text-white min-w-[70px]">
              <span>{goles_local}</span>
              <span className="text-gray-600">:</span>
              <span>{goles_visitante}</span>
            </div>
          ) : (
            <div className="text-xs font-black text-gray-600 tracking-wider">
              VS
            </div>
          )}
        </div>

        {/* Visiting Team */}
        <div className="col-span-3 flex flex-col items-center justify-center text-center gap-2">
          {visitante.bandera ? (
            <img
              src={visitante.bandera}
              alt={visitante.nombre}
              className="h-10 w-14 object-cover rounded-md shadow-md shadow-black/40 border border-white/10 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-10 w-14 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] text-gray-500 font-bold">
              {visitante.codigo || "TBD"}
            </div>
          )}
          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1">
            {visitante.nombre}
          </span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            {visitante.codigo}
          </span>
        </div>
      </div>

      {/* Detalle de Goleadores */}
      {isStarted && ((goleadores_local && goleadores_local.length > 0) || (goleadores_visitante && goleadores_visitante.length > 0)) && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[10px] text-gray-400 relative z-10 leading-relaxed font-light">
          {/* Goles Local */}
          <div className="text-left space-y-0.5 border-r border-white/5 pr-2">
            {goleadores_local?.map((scorer, idx) => (
              <div key={idx} className="flex items-center gap-1 line-clamp-1">
                <span>⚽</span>
                <span>{scorer}</span>
              </div>
            ))}
          </div>
          {/* Goles Visitante */}
          <div className="text-right space-y-0.5 pl-2 flex flex-col items-end">
            {goleadores_visitante?.map((scorer, idx) => (
              <div key={idx} className="flex items-center gap-1 justify-end line-clamp-1">
                <span>{scorer}</span>
                <span>⚽</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sede y Estadio */}
      <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-gray-500 flex items-center justify-between relative z-10 font-medium">
        <span className="line-clamp-1">🏟️ {estadio.nombre}</span>
        <span className="shrink-0">{estadio.ciudad}</span>
      </div>
    </div>
  );
}
