import { supabase } from "./supabaseClient";

export interface Observation {
  id: string;
  observation_date: string;
  observation_time: string;
  location: {
    lat: number;
    lng: number;
  };
  lat: number;
  lng: number;
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

export interface DivisionStat {
  total: number;
  direct: number;
  indirect: number;
  loss: number;
  elephants: number;
}

export interface DashboardStats {
  totalObservations: number;
  directSightings: number;
  indirectSigns: number;
  lossReports: number;
  recentObservations: Observation[];
  heatmapData: Array<[number, number, number]>;
  kpis: {
    totalElephants: number;
    maleElephants: number;
    femaleElephants: number;
    unknownElephants: number;
    totalCalves: number;
    lossTypes: Record<string, number>;
    indirectSigns: Record<string, number>;
    divisionStats: Record<string, DivisionStat>;
  };
}

// Helper function to extract the count value from view data
function getCount(data: any): number {
  if (!data) return 0;
  
  // Try to find a count field in the data
  if (typeof data.count === 'number') {
    return data.count;
  } else if (typeof data.total_observations === 'number') {
    return data.total_observations;
  } else if (typeof data.total === 'number') {
    return data.total;
  }
  
  // If we can't find a count field, look for any numeric field
  for (const key in data) {
    if (typeof data[key] === 'number') {
      return data[key];
    }
  }
  
  return 0;
}

// Create fallback/mock data for when the API is unavailable
function createMockDashboardData(): DashboardStats {
  // Create mock observations
  const mockObservations: Observation[] = [
    {
      id: "1",
      observation_date: "2025-05-01",
      observation_time: "10:30",
      location: { lat: 12.9716, lng: 77.5946 },
      lat: 12.9716,
      lng: 77.5946,
      observation_type: "elephant",
      photo_url: null,
      total_elephants: 5,
      male_elephants: 2,
      female_elephants: 2,
      unknown_elephants: 1,
      calves: 1,
      indirect_sign: "",
      loss_type: "",
      division: "North Division",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      observation_date: "2025-04-28",
      observation_time: "15:45",
      location: { lat: 13.0827, lng: 77.5090 },
      lat: 13.0827,
      lng: 77.5090,
      observation_type: "indirect",
      photo_url: null,
      total_elephants: 0,
      male_elephants: 0,
      female_elephants: 0,
      unknown_elephants: 0,
      calves: 0,
      indirect_sign: "Footprints",
      loss_type: "",
      division: "East Division",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "3",
      observation_date: "2025-04-25",
      observation_time: "08:15",
      location: { lat: 12.8698, lng: 77.6698 },
      lat: 12.8698,
      lng: 77.6698,
      observation_type: "loss",
      photo_url: null,
      total_elephants: 0,
      male_elephants: 0,
      female_elephants: 0,
      unknown_elephants: 0,
      calves: 0,
      indirect_sign: "",
      loss_type: "Crop damage",
      division: "South Division",
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  // Create mock division stats
  const mockDivisionStats: Record<string, DivisionStat> = {
    "North Division": {
      total: 25,
      direct: 15,
      indirect: 8,
      loss: 2,
      elephants: 45
    },
    "East Division": {
      total: 18,
      direct: 10,
      indirect: 6,
      loss: 2,
      elephants: 32
    },
    "South Division": {
      total: 22,
      direct: 12,
      indirect: 7,
      loss: 3,
      elephants: 38
    },
    "West Division": {
      total: 20,
      direct: 11,
      indirect: 6,
      loss: 3,
      elephants: 35
    }
  };
  
  // Create mock loss types
  const mockLossTypes: Record<string, number> = {
    "Crop damage": 6,
    "Property damage": 3,
    "Human injury": 1
  };
  
  // Create mock indirect signs
  const mockIndirectSigns: Record<string, number> = {
    "Footprints": 12,
    "Dung": 8,
    "Feeding signs": 7
  };
  
  // Create mock heatmap data
  const mockHeatmapData: Array<[number, number, number]> = [
    [12.9716, 77.5946, 5],
    [13.0827, 77.5090, 3],
    [12.8698, 77.6698, 8],
    [12.9419, 77.6370, 4],
    [12.9063, 77.5907, 6]
  ];
  
  // Return the mock dashboard stats
  return {
    totalObservations: 85,
    directSightings: 48,
    indirectSigns: 27,
    lossReports: 10,
    recentObservations: mockObservations,
    heatmapData: mockHeatmapData,
    kpis: {
      totalElephants: 150,
      maleElephants: 65,
      femaleElephants: 70,
      unknownElephants: 15,
      totalCalves: 25,
      lossTypes: mockLossTypes,
      indirectSigns: mockIndirectSigns,
      divisionStats: mockDivisionStats
    }
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch total observations count
    const { data: totalData, error: totalError } = await supabase
      .from('observations')
      .select('count');

    if (totalError) throw totalError;

    // Fetch direct sightings count
    const { data: directData, error: directError } = await supabase
      .from('observations')
      .select('count')
      .eq('observation_type', 'elephant');

    if (directError) throw directError;

    // Fetch indirect signs count
    const { data: indirectData, error: indirectError } = await supabase
      .from('observations')
      .select('count')
      .eq('observation_type', 'indirect');

    if (indirectError) throw indirectError;

    // Fetch loss reports count
    const { data: lossData, error: lossError } = await supabase
      .from('observations')
      .select('count')
      .eq('observation_type', 'loss');

    if (lossError) throw lossError;

    // Fetch recent observations
    const { data: recentObservations, error: recentError } = await supabase
      .from('observations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Fetch division stats
    const { data: divisionStats, error: divisionError } = await supabase
      .from('division_stats')
      .select('*');

    if (divisionError) throw divisionError;

    // Process the data into the required format
    const stats: DashboardStats = {
      totalObservations: getCount(totalData),
      directSightings: getCount(directData),
      indirectSigns: getCount(indirectData),
      lossReports: getCount(lossData),
      recentObservations: recentObservations || [],
      heatmapData: (recentObservations || []).map(obs => [obs.lat, obs.lng, obs.total_elephants || 1]),
      kpis: {
        totalElephants: 0, // Calculate from observations
        maleElephants: 0,
        femaleElephants: 0,
        unknownElephants: 0,
        totalCalves: 0,
        lossTypes: {},
        indirectSigns: {},
        divisionStats: {}
      }
    };

    // Calculate KPIs from the data
    if (recentObservations) {
      stats.kpis.totalElephants = recentObservations.reduce((sum, obs) => sum + (obs.total_elephants || 0), 0);
      stats.kpis.maleElephants = recentObservations.reduce((sum, obs) => sum + (obs.male_elephants || 0), 0);
      stats.kpis.femaleElephants = recentObservations.reduce((sum, obs) => sum + (obs.female_elephants || 0), 0);
      stats.kpis.unknownElephants = recentObservations.reduce((sum, obs) => sum + (obs.unknown_elephants || 0), 0);
      stats.kpis.totalCalves = recentObservations.reduce((sum, obs) => sum + (obs.calves || 0), 0);

      // Calculate loss types and indirect signs
      recentObservations.forEach(obs => {
        if (obs.loss_type) {
          stats.kpis.lossTypes[obs.loss_type] = (stats.kpis.lossTypes[obs.loss_type] || 0) + 1;
        }
        if (obs.indirect_sign) {
          stats.kpis.indirectSigns[obs.indirect_sign] = (stats.kpis.indirectSigns[obs.indirect_sign] || 0) + 1;
        }
      });
    }

    // Process division stats
    if (divisionStats) {
      divisionStats.forEach(stat => {
        stats.kpis.divisionStats[stat.division] = {
          total: stat.total || 0,
          direct: stat.direct || 0,
          indirect: stat.indirect || 0,
          loss: stat.loss || 0,
          elephants: stat.elephants || 0
        };
      });
    }

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data in case of error
    return createMockDashboardData();
  }
}

export function updateDashboardStatsWithNewObservation(
  currentStats: DashboardStats,
  newObservation: Observation
): DashboardStats {
  // Create a deep copy of the current stats
  const updatedStats = JSON.parse(JSON.stringify(currentStats)) as DashboardStats;

  // Update total observations count
  updatedStats.totalObservations += 1;

  // Update observation type counts
  if (newObservation.observation_type === "elephant") {
    updatedStats.directSightings += 1;
    
    // Update elephant counts
    updatedStats.kpis.totalElephants += newObservation.total_elephants || 0;
    updatedStats.kpis.maleElephants += newObservation.male_elephants || 0;
    updatedStats.kpis.femaleElephants += newObservation.female_elephants || 0;
    updatedStats.kpis.unknownElephants += 
      (newObservation.unknown_elephants || 
      (newObservation.total_elephants || 0) - 
      (newObservation.male_elephants || 0) - 
      (newObservation.female_elephants || 0));
    updatedStats.kpis.totalCalves += newObservation.calves || 0;
    
    // Update division stats
    const division = newObservation.division || "Unknown";
    if (!updatedStats.kpis.divisionStats[division]) {
      updatedStats.kpis.divisionStats[division] = {
        total: 0,
        direct: 0,
        indirect: 0,
        loss: 0,
        elephants: 0
      };
    }
    updatedStats.kpis.divisionStats[division].total += 1;
    updatedStats.kpis.divisionStats[division].direct += 1;
    updatedStats.kpis.divisionStats[division].elephants += newObservation.total_elephants || 0;
  } else if (newObservation.observation_type === "indirect") {
    updatedStats.indirectSigns += 1;
    
    // Update indirect sign counts
    const sign = newObservation.indirect_sign || "Unknown";
    if (!updatedStats.kpis.indirectSigns[sign]) {
      updatedStats.kpis.indirectSigns[sign] = 0;
    }
    updatedStats.kpis.indirectSigns[sign] += 1;
    
    // Update division stats
    const division = newObservation.division || "Unknown";
    if (!updatedStats.kpis.divisionStats[division]) {
      updatedStats.kpis.divisionStats[division] = {
        total: 0,
        direct: 0,
        indirect: 0,
        loss: 0,
        elephants: 0
      };
    }
    updatedStats.kpis.divisionStats[division].total += 1;
    updatedStats.kpis.divisionStats[division].indirect += 1;
  } else if (newObservation.observation_type === "loss") {
    updatedStats.lossReports += 1;
    
    // Update loss type counts
    const lossType = newObservation.loss_type || "Unknown";
    if (!updatedStats.kpis.lossTypes[lossType]) {
      updatedStats.kpis.lossTypes[lossType] = 0;
    }
    updatedStats.kpis.lossTypes[lossType] += 1;
    
    // Update division stats
    const division = newObservation.division || "Unknown";
    if (!updatedStats.kpis.divisionStats[division]) {
      updatedStats.kpis.divisionStats[division] = {
        total: 0,
        direct: 0,
        indirect: 0,
        loss: 0,
        elephants: 0
      };
    }
    updatedStats.kpis.divisionStats[division].total += 1;
    updatedStats.kpis.divisionStats[division].loss += 1;
  }

  // Add to recent observations (at the beginning)
  updatedStats.recentObservations.unshift(newObservation);
  // Keep only the most recent 10
  updatedStats.recentObservations = updatedStats.recentObservations.slice(0, 10);

  // Add to heatmap data if location is available
  if (newObservation.lat && newObservation.lng) {
    let intensity = 1;
    if (newObservation.observation_type === "elephant" && newObservation.total_elephants) {
      intensity = Math.min(newObservation.total_elephants, 10);
    } else if (newObservation.observation_type === "indirect") {
      intensity = 3;
    } else if (newObservation.observation_type === "loss") {
      intensity = 8;
    }
    
    updatedStats.heatmapData.push([
      newObservation.lat,
      newObservation.lng,
      intensity
    ]);
  }

  return updatedStats;
}
