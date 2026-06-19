import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

// Interfaces de datos para tipado estricto
export interface Stadium2026 {
  id?: number;
  api_stadium_id: string;
  nombre_en: string;
  nombre_fifa: string;
  ciudad: string;
  pais: string;
  capacidad: number | null;
}

export interface Team2026 {
  id?: number;
  api_team_id: string;
  nombre_en: string;
  codigo_fifa: string;
  grupo: string;
  bandera_url: string;
}

export interface GroupTeamStanding {
  team_id: string;
  nombre: string;
  codigo: string;
  bandera: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
}

export interface GroupStanding {
  grupo: string;
  equipos: GroupTeamStanding[];
}

export interface FixtureStadium {
  nombre: string;
  ciudad: string;
  capacidad: number | null;
}

export interface FixtureTeam {
  id: string;
  nombre: string;
  codigo: string;
  bandera: string;
}

export interface Match2026 {
  id: string;
  grupo: string;
  tipo: string;
  matchday: number | null;
  fecha: string;
  estadio: FixtureStadium;
  local: FixtureTeam;
  visitante: FixtureTeam;
  goles_local: number;
  goles_visitante: number;
  goleadores_local: string[] | null;
  goleadores_visitante: string[] | null;
  finalizado: boolean;
  estado: string;
  etapa_detalle: string | null;
}

export interface FixturesResponse {
  total: number;
  en_vivo: number;
  finalizados: number;
  proximos: number;
  partidos: Match2026[];
}

export interface SyncResponse {
  success: boolean;
  teams?: number;
  stadiums?: number;
  groups?: number;
  matches?: number;
  message?: string;
}

// 1. Hook para obtener partidos con filtros dinámicos
export function useFixtures2026(filtros?: {
  grupo?: string;
  tipo?: string;
  equipo?: string;
  estado?: string;
  matchday?: string;
}) {
  return useQuery({
    queryKey: ["fixtures-2026", filtros],
    queryFn: async () => {
      const response = await axios.get<FixturesResponse>(`${API_BASE_URL}/2026/fixtures`, {
        params: filtros,
      });
      return response.data;
    },
    staleTime: 30 * 1000,        // 30 segundos (datos en vivo)
    refetchInterval: 60 * 1000,   // refetch automático cada minuto
    refetchOnWindowFocus: true,
  });
}

// 2. Hook para obtener equipos
export function useTeams2026() {
  return useQuery({
    queryKey: ["teams-2026"],
    queryFn: async () => {
      const response = await axios.get<Team2026[]>(`${API_BASE_URL}/2026/teams`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,    // 5 minutos (datos estáticos)
  });
}

// 3. Hook para obtener posiciones de grupos
export function useGroups2026() {
  return useQuery({
    queryKey: ["groups-2026"],
    queryFn: async () => {
      const response = await axios.get<GroupStanding[]>(`${API_BASE_URL}/2026/groups`);
      return response.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// 4. Hook para obtener estadios
export function useStadiums2026() {
  return useQuery({
    queryKey: ["stadiums-2026"],
    queryFn: async () => {
      const response = await axios.get<Stadium2026[]>(`${API_BASE_URL}/2026/stadiums`);
      return response.data;
    },
    staleTime: 60 * 60 * 1000,   // 1 hora (datos estáticos)
  });
}

// 5. Mutación para realizar sincronización completa (Admin)
export function useSyncWorldCup2026(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post<SyncResponse>(
        `${API_BASE_URL}/2026/sync`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forzar recarga de datos frescos
      queryClient.invalidateQueries({ queryKey: ["fixtures-2026"] });
      queryClient.invalidateQueries({ queryKey: ["teams-2026"] });
      queryClient.invalidateQueries({ queryKey: ["groups-2026"] });
      queryClient.invalidateQueries({ queryKey: ["stadiums-2026"] });
    },
  });
}
