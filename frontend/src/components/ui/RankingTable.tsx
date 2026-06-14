import { motion } from "framer-motion";

export interface RankingColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (val: any, item: any) => React.ReactNode;
}

interface RankingTableProps {
  data: any[];
  columns: RankingColumn[];
  loading?: boolean;
}

export default function RankingTable({
  data,
  columns,
  loading = false,
}: RankingTableProps) {
  // Animación del contenedor de la lista (Staggered list)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Animación para cada fila individual
  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  // Obtener emoji de medalla según posición (1-based index)
  const getPositionBadge = (pos: number) => {
    if (pos === 1) return <span className="text-xl" title="Ganador">🥇</span>;
    if (pos === 2) return <span className="text-xl" title="Segundo">🥈</span>;
    if (pos === 3) return <span className="text-xl" title="Tercero">🥉</span>;
    return <span className="font-mono text-gray-500 font-bold px-1 text-xs">#{pos}</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Consultando API de Rankings...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="block text-sm text-gray-500">No se encontraron registros en esta categoría.</span>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16 text-center">
                Pos
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  } ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {data.map((item, idx) => {
              const position = idx + 1;
              return (
                <motion.tr
                  key={item.id || idx}
                  variants={rowVariants}
                  className="hover:bg-white/[0.02] transition-colors duration-150"
                >
                  {/* Columna de Posición / Medalla */}
                  <td className="py-4 px-6 text-center align-middle">
                    {getPositionBadge(position)}
                  </td>

                  {/* Resto de Columnas Dinámicas */}
                  {columns.map((col) => {
                    const value = item[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`py-4 px-6 text-sm align-middle ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        } ${col.className || ""}`}
                      >
                        {col.render ? col.render(value, item) : value}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
