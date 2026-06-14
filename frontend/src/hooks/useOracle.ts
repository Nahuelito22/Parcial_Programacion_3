import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export interface TeamOption {
  id: number;
  nombre: string;
}

export interface PredictionMethod {
  id: string;
  name: string;
  description: string;
}

export interface PredictionResult {
  metodo_usado: string;
  metodos_disponibles: string[];
  equipo_a: { id: number; nombre: string };
  equipo_b: { id: number; nombre: string };
  probabilidades: {
    victoria_a: number;
    empate: number;
    victoria_b: number;
  };
  goles_esperados: { a: number; b: number };
  distribucion_goles_local: Record<string, number>;
  distribucion_goles_visitante: Record<string, number>;
  most_likely_score: string;
  simulaciones?: number;
}

export interface H2HEdition {
  id: number;
  anio: number;
  pais_anfitrion: string;
  campeon: string;
}

export function useOracle() {
  const [teamAId, setTeamAId] = useState<number | null>(null);
  const [teamBId, setTeamBId] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("monte_carlo");
  const [selectedEditionId, setSelectedEditionId] = useState<number | null>(null);

  // 1. Obtener la lista de selecciones
  const teamsQuery = useQuery({
    queryKey: ["oracle", "teams"],
    queryFn: async () => {
      const response = await axios.get<TeamOption[]>(`${API_BASE_URL}/oracle/equipos`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Obtener los métodos habilitados
  const methodsQuery = useQuery({
    queryKey: ["oracle", "methods"],
    queryFn: async () => {
      const response = await axios.get<{ methods: PredictionMethod[] }>(`${API_BASE_URL}/oracle/methods`);
      return response.data.methods;
    },
    staleTime: 1 * 60 * 1000,
  });

  // 3. Obtener la lista de ediciones
  const editionsQuery = useQuery({
    queryKey: ["oracle", "editions"],
    queryFn: async () => {
      const response = await axios.get<H2HEdition[]>(`${API_BASE_URL}/h2h/ediciones`);
      return Array.isArray(response.data) ? response.data : (response.data as any).ediciones || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. Mutación para invocar la predicción (POST)
  const predictMutation = useMutation({
    mutationFn: async () => {
      if (teamAId === null || teamBId === null) return null;
      
      const payload: Record<string, any> = {
        team_a_id: teamAId,
        team_b_id: teamBId,
        method: selectedMethod,
      };
      
      if (selectedEditionId !== null) {
        payload.edition_id = selectedEditionId;
      }

      const response = await axios.post<PredictionResult>(`${API_BASE_URL}/oracle/predict`, payload);
      return response.data;
    },
  });

  return {
    teamAId,
    setTeamAId,
    teamBId,
    setTeamBId,
    selectedMethod,
    setSelectedMethod,
    selectedEditionId,
    setSelectedEditionId,
    teams: teamsQuery.data || [],
    methods: methodsQuery.data || [],
    editions: editionsQuery.data || [],
    isLoadingOptions: teamsQuery.isLoading || methodsQuery.isLoading || editionsQuery.isLoading,
    prediction: predictMutation.data,
    isLoadingPrediction: predictMutation.isPending,
    isErrorPrediction: predictMutation.isError,
    errorPrediction: predictMutation.error,
    predict: () => predictMutation.mutate(),
    resetPrediction: () => predictMutation.reset(),
  };
}
