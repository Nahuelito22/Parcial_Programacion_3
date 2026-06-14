import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface Option {
  id: number;
  nombre: string;
}

interface SearchSelectProps {
  options: Option[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder: string;
  loading?: boolean;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  loading = false,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Encontrar la etiqueta del valor seleccionado
  const selectedOption = options.find((opt) => opt.id === value);

  // Cerrar el dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpiar buscador al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Filtrar opciones localmente
  const filteredOptions = options.filter((opt) =>
    opt.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botón selector principal */}
      <div
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-slate-900/60 backdrop-blur-md border rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] text-white"
            : "border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex-1 truncate pr-2">
          {selectedOption ? (
            <span className="font-semibold text-white">{selectedOption.nombre}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {value !== null && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "transform rotate-180 text-yellow-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Caja de búsqueda interna */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 py-1"
              autoFocus
            />
          </div>

          {/* Opciones */}
          <ul className="max-h-60 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-500 text-center">
                Sin resultados encontrados
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <li
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 flex items-center justify-between ${
                      isSelected
                        ? "bg-yellow-500/10 text-yellow-500 font-bold"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{opt.nombre}</span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
