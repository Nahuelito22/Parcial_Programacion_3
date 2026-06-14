import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export interface H2HOption {
  id: number;
  nombre: string;
}

export interface H2HEdition {
  id: number;
  anio: number;
  pais_anfitrion: string;
  campeon: string;
}

export function useHeadToHead() {
  const [type, setType] = useState<"equipos" | "jugadores">("equipos");
  const [idA, setIdA] = useState<number | null>(null);
  const [idB, setIdB] = useState<number | null>(null);
  const [editionId, setEditionId] = useState<number | null>(null);

  // 1. Obtener la lista de selecciones
  const teamsQuery = useQuery({
    queryKey: ["h2h", "teams"],
    queryFn: async () => {
      const response = await axios.get<H2HOption[]>(`${API_BASE_URL}/h2h/equipos`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 2. Obtener la lista de jugadores
  const playersQuery = useQuery({
    queryKey: ["h2h", "players"],
    queryFn: async () => {
      const response = await axios.get<H2HOption[]>(`${API_BASE_URL}/h2h/jugadores`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Obtener la lista de ediciones mundiales
  const editionsQuery = useQuery({
    queryKey: ["h2h", "editions"],
    queryFn: async () => {
      const response = await axios.get<H2HEdition[]>(`${API_BASE_URL}/h2h/ediciones`);
      return Array.isArray(response.data) ? response.data : (response.data as any).ediciones || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. Obtener la comparativa H2H de la entidad seleccionada
  const h2hQuery = useQuery({
    queryKey: ["h2h", "comparison", type, idA, idB, editionId],
    queryFn: async () => {
      if (idA === null || idB === null) return null;
      
      const url = `${API_BASE_URL}/h2h/${type}/${idA}/${idB}`;
      const params: Record<string, any> = {};
      if (editionId !== null) {
        params.edicion = editionId;
      }
      
      const response = await axios.get(url, { params });
      return response.data;
    },
    enabled: idA !== null && idB !== null, // Ejecutar solo si ambos están seleccionados
  });

  // Manejar el cambio de tipo de entidad y resetear valores
  const handleTypeChange = (newType: "equipos" | "jugadores") => {
    setType(newType);
    setIdA(null);
    setIdB(null);
    setEditionId(null);
  };

  return {
    type,
    setType: handleTypeChange,
    idA,
    setIdA,
    idB,
    setIdB,
    editionId,
    setEditionId,
    teams: teamsQuery.data || [],
    players: playersQuery.data || [],
    editions: editionsQuery.data || [],
    isLoadingOptions: teamsQuery.isLoading || playersQuery.isLoading || editionsQuery.isLoading,
    comparison: h2hQuery.data,
    isLoadingComparison: h2hQuery.isLoading,
    isErrorComparison: h2hQuery.isError,
    errorComparison: h2hQuery.error,
  };
}
