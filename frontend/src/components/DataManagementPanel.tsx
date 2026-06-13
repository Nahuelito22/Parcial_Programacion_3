import { useState } from "react";
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface DataManagementPanelProps {
  token: string | null;
}

type StatusType = "idle" | "loading" | "success" | "error";

export default function DataManagementPanel({ token }: DataManagementPanelProps) {
  const [importStatus, setImportStatus] = useState<StatusType>("idle");
  const [importMessage, setImportMessage] = useState<string>("");

  const [syncStatus, setSyncStatus] = useState<StatusType>("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");

  const [clearStatus, setClearStatus] = useState<StatusType>("idle");
  const [clearMessage, setClearMessage] = useState<string>("");

  // Manejo de la importación masiva de CSV
  const handleImportCSV = async () => {
    setImportStatus("loading");
    setImportMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al importar el histórico CSV.");
      }
      setImportStatus("success");
      setImportMessage(data.message || "Histórico de datos CSV importado correctamente.");
    } catch (err: any) {
      console.error(err);
      setImportStatus("error");
      setImportMessage(err.message || "Error de conexión con el servidor Flask.");
    }
  };

  // Manejo de la sincronización de la API externa
  const handleSyncAPI = async () => {
    setSyncStatus("loading");
    setSyncMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/sync-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al sincronizar con la API externa.");
      }
      setSyncStatus("success");
      setSyncMessage(data.message || "Datos del Mundial 2026 sincronizados correctamente.");
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      setSyncMessage(err.message || "Error de conexión con el servidor Flask.");
    }
  };

  // Manejo de la limpieza destructiva de la Base de Datos
  const handleClearDB = async () => {
    const confirmClear = window.confirm(
      "⚠️ Esta acción eliminará TODOS los datos de Ediciones, Equipos y Jugadores. ¿Estás seguro?"
    );
    if (!confirmClear) return;

    setClearStatus("loading");
    setClearMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/clear-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al vaciar la base de datos.");
      }
      setClearStatus("success");
      setClearMessage(data.message || "Base de datos vaciada correctamente.");
    } catch (err: any) {
      console.error(err);
      setClearStatus("error");
      setClearMessage(err.message || "Error de conexión con el servidor Flask.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CARD A: Importar CSV */}
      <div className="glassmorphism rounded-2xl border border-white/5 p-6 flex flex-col justify-between h-full hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all duration-300 group">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
              Importar Histórico (CSV)
            </h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Carga los 27 archivos CSV del dataset histórico de Fjelstul en la base de datos MySQL.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {importStatus === "success" && (
            <div className="flex items-start gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{importMessage}</span>
            </div>
          )}
          {importStatus === "error" && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{importMessage}</span>
            </div>
          )}
          <button
            onClick={handleImportCSV}
            disabled={importStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            {importStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importando...</span>
              </>
            ) : (
              <span>Importar CSV</span>
            )}
          </button>
        </div>
      </div>

      {/* CARD B: Sincronizar API */}
      <div className="glassmorphism rounded-2xl border border-white/5 p-6 flex flex-col justify-between h-full hover:border-blue-500/30 hover:bg-white/[0.02] transition-all duration-300 group">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <RefreshCw className={`h-6 w-6 ${syncStatus === "loading" ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
              Sincronizar Mundial 2026
            </h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Conecta con el servicio de API externa para obtener las últimas actualizaciones en tiempo real del Mundial 2026.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {syncStatus === "success" && (
            <div className="flex items-start gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{syncMessage}</span>
            </div>
          )}
          {syncStatus === "error" && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{syncMessage}</span>
            </div>
          )}
          <button
            onClick={handleSyncAPI}
            disabled={syncStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            {syncStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <span>Sincronizar API</span>
            )}
          </button>
        </div>
      </div>

      {/* CARD C: Vaciar Base de Datos */}
      <div className="glassmorphism rounded-2xl border border-white/5 p-6 flex flex-col justify-between h-full hover:border-red-500/30 hover:bg-white/[0.02] transition-all duration-300 group">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform duration-300">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors duration-300">
              Vaciar Base de Datos
            </h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Acción destructiva. Elimina de forma permanente todos los registros de Ediciones, Equipos y Jugadores.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {clearStatus === "success" && (
            <div className="flex items-start gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{clearMessage}</span>
            </div>
          )}
          {clearStatus === "error" && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{clearMessage}</span>
            </div>
          )}
          <button
            onClick={handleClearDB}
            disabled={clearStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            {clearStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Vaciando...</span>
              </>
            ) : (
              <span>Limpiar Todo</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
