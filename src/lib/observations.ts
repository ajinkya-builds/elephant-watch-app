import { supabase } from "./supabaseClient";

export interface Observation {
  id: string;
  observation_date: string;
  observation_time: string;
  location: {
    lat: number;
    lng: number;
  };
  observation_type: "elephant" | "indirect" | "loss";
  photo_url: string | null;
  total_elephants: number;
  male_elephants: number;
  female_elephants: number;
  unknown_elephants: number;
  calves: number;
  indirect_sign: string;
  loss_type: string;
  division: string;
  created_at: string;
}

export interface DashboardStats {
  totalObservations: number;
  directSightings: number;
  indirectSigns: number;
  lossReports: number;
  recentObservations: Observation[];
  heatmapData: Array<[number, number, number]>; // [lat, lng, intensity]
  kpis: {
    totalElephants: number;
    maleElephants: number;
    femaleElephants: number;
    unknownElephants: number;
    totalCalves: number;
    lossTypes: Record<string, number>;
    indirectSigns: Record<string, number>;
    divisionStats: Record<string, {
      total: number;
      direct: number;
      indirect: number;
      loss: number;
    }>;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: observations, error } = await supabase
    .from("observations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching observations:", error);
    throw error;
  }

  // Calculate KPIs
  const kpis = {
    totalElephants: 0,
    maleElephants: 0,
    femaleElephants: 0,
    unknownElephants: 0,
    totalCalves: 0,
    lossTypes: {} as Record<string, number>,
    indirectSigns: {} as Record<string, number>,
    divisionStats: {} as Record<string, {
      total: number;
      direct: number;
      indirect: number;
      loss: number;
    }>,
  };

  observations.forEach(obs => {
    // Elephant counts
    if (obs.observation_type === "elephant") {
      kpis.totalElephants += obs.total_elephants || 0;
      kpis.maleElephants += obs.male_elephants || 0;
      kpis.femaleElephants += obs.female_elephants || 0;
      kpis.unknownElephants += obs.unknown_elephants || 0;
      kpis.totalCalves += obs.calves || 0;
    }

    // Loss types
    if (obs.observation_type === "loss" && obs.loss_type) {
      kpis.lossTypes[obs.loss_type] = (kpis.lossTypes[obs.loss_type] || 0) + 1;
    }

    // Indirect signs
    if (obs.observation_type === "indirect" && obs.indirect_sign) {
      kpis.indirectSigns[obs.indirect_sign] = (kpis.indirectSigns[obs.indirect_sign] || 0) + 1;
    }

    // Division stats
    if (obs.division) {
      if (!kpis.divisionStats[obs.division]) {
        kpis.divisionStats[obs.division] = {
          total: 0,
          direct: 0,
          indirect: 0,
          loss: 0,
        };
      }
      kpis.divisionStats[obs.division].total++;
      switch (obs.observation_type) {
        case "elephant":
          kpis.divisionStats[obs.division].direct++;
          break;
        case "indirect":
          kpis.divisionStats[obs.division].indirect++;
          break;
        case "loss":
          kpis.divisionStats[obs.division].loss++;
          break;
      }
    }
  });

  const stats: DashboardStats = {
    totalObservations: observations.length,
    directSightings: observations.filter(obs => obs.observation_type === "elephant").length,
    indirectSigns: observations.filter(obs => obs.observation_type === "indirect").length,
    lossReports: observations.filter(obs => obs.observation_type === "loss").length,
    recentObservations: observations.slice(0, 10),
    heatmapData: observations
      .filter(obs => obs.location)
      .map(obs => [obs.location.lat, obs.location.lng, 1]),
    kpis,
  };

  return stats;
} 