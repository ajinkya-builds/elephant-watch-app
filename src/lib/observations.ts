import { supabase } from "./supabaseClient";

export interface ActivityReport {
  id: number;
  created_at: string;
  email: string;
  division_name: string;
  range_name: string;
  land_type: string;
  beat_name: string;
  compartment_no: string;
  damage_done: string | null;
  damage_description: string | null;
  total_elephants: number;
  male_elephants: number;
  female_elephants: number;
  unknown_elephants: number;
  activity_date: string;
  activity_time: string;
  latitude: number;
  longitude: number;
  heading_towards: string | null;
  local_name: string | null;
  identification_marks: string | null;
  reporter_name: string;
  reporter_mobile: string;
  user_id: string;
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
  recentObservations: ActivityReport[];
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
    totalObservations: number;
    observationsChange: number;
    activeElephants: number;
    activeUsers: number;
    usersChange: number;
    reportsToday: number;
    reportsChange: number;
  };
}

interface DashboardFilters {
  division?: string;
  range?: string;
  beat?: string;
  startDate?: string;
  endDate?: string;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  total_elephants: number | null;
}

interface ElephantData {
  total_elephants: number | null;
  male_elephants: number | null;
  female_elephants: number | null;
  calves: number | null;
  division: string | null;
  loss_type: string | null;
  indirect_sign: string | null;
}

interface CountResult {
  count: number;
}

interface TypeCount {
  count: number;
  loss_type?: string;
  indirect_sign?: string;
  division?: string;
  observation_type?: string;
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
  const mockObservations: ActivityReport[] = [
    {
      id: 1,
      created_at: new Date().toISOString(),
      email: "user@example.com",
      division_name: "North Division",
      range_name: "Range 1",
      land_type: "Forest",
      beat_name: "Beat 1",
      compartment_no: "C1",
      damage_done: null,
      damage_description: null,
      total_elephants: 5,
      male_elephants: 2,
      female_elephants: 2,
      unknown_elephants: 1,
      activity_date: "2025-05-01",
      activity_time: "10:30",
      latitude: 12.9716,
      longitude: 77.5946,
      heading_towards: null,
      local_name: null,
      identification_marks: null,
      reporter_name: "John Doe",
      reporter_mobile: "+14155552671",
      user_id: "user1"
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      email: "user@example.com",
      division_name: "East Division",
      range_name: "Range 2",
      land_type: "Grassland",
      beat_name: "Beat 2",
      compartment_no: "C2",
      damage_done: null,
      damage_description: null,
      total_elephants: 0,
      male_elephants: 0,
      female_elephants: 0,
      unknown_elephants: 0,
      activity_date: "2025-04-28",
      activity_time: "15:45",
      latitude: 13.0827,
      longitude: 77.5090,
      heading_towards: null,
      local_name: null,
      identification_marks: "Footprints",
      reporter_name: "Jane Doe",
      reporter_mobile: "+14155552672",
      user_id: "user2"
    },
    {
      id: 3,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      email: "user@example.com",
      division_name: "South Division",
      range_name: "Range 3",
      land_type: "Agricultural",
      beat_name: "Beat 3",
      compartment_no: "C3",
      damage_done: null,
      damage_description: "Crop damage",
      total_elephants: 0,
      male_elephants: 0,
      female_elephants: 0,
      unknown_elephants: 0,
      activity_date: "2025-04-25",
      activity_time: "08:15",
      latitude: 12.8698,
      longitude: 77.6698,
      heading_towards: null,
      local_name: null,
      identification_marks: null,
      reporter_name: "Bob Smith",
      reporter_mobile: "+14155552673",
      user_id: "user3"
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
      divisionStats: mockDivisionStats,
      totalObservations: 85,
      observationsChange: 0,
      activeElephants: 150,
      activeUsers: 0,
      usersChange: 0,
      reportsToday: 10,
      reportsChange: 0
    }
  };
}

export async function getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
  try {
    // Base query builder function for views that need all filters
    const buildFullQuery = <T>(query: any) => {
      if (filters?.division && filters.division !== 'all') {
        query = query.eq('division_name', filters.division);
      }
      if (filters?.range && filters.range !== 'all') {
        query = query.eq('range_name', decodeURIComponent(filters.range));
      }
      if (filters?.beat && filters.beat !== 'all') {
        query = query.eq('beat_name', decodeURIComponent(filters.beat));
      }
      if (filters?.startDate) {
        query = query.or(`activity_date.gte.${filters.startDate},observation_date.gte.${filters.startDate}`);
      }
      if (filters?.endDate) {
        query = query.or(`activity_date.lte.${filters.endDate},observation_date.lte.${filters.endDate}`);
      }
      return query;
    };

    // Base query builder function for views that only need division filter
    const buildDivisionQuery = <T>(query: any) => {
      if (filters?.division && filters.division !== 'all') {
        query = query.eq('division_name', filters.division);
      }
      if (filters?.startDate) {
        query = query.gte('activity_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('activity_date', filters.endDate);
      }
      return query;
    };

    // Fetch total observations from v_total_observations (only division filter)
    let query = supabase.from('v_total_observations').select('*');
    query = buildDivisionQuery(query);
    const { data: totalData, error: totalError } = await query;
    if (totalError) {
      console.error('Error fetching total observations:', totalError);
      throw totalError;
    }

    // Fetch total loss from v_total_loss (only division filter)
    query = supabase.from('v_total_loss').select('*');
    query = buildDivisionQuery(query);
    const { data: lossData, error: lossError } = await query;
    if (lossError) throw lossError;

    // Fetch total elephants from v_total_elephants (only division filter)
    query = supabase.from('v_total_elephants').select('*');
    query = buildDivisionQuery(query);
    const { data: elephantData, error: elephantError } = await query;
    if (elephantError) throw elephantError;

    // Fetch male elephants from v_male_elephant_counts (only division filter)
    query = supabase.from('v_male_elephant_counts').select('*');
    query = buildDivisionQuery(query);
    const { data: maleData, error: maleError } = await query;
    if (maleError) throw maleError;

    // Fetch female elephants from v_female_elephant_counts (only division filter)
    query = supabase.from('v_female_elephant_counts').select('*');
    query = buildDivisionQuery(query);
    const { data: femaleData, error: femaleError } = await query;
    if (femaleError) throw femaleError;

    // Fetch calves from v_calve_count (only division filter)
    query = supabase.from('v_calve_count').select('*');
    query = buildDivisionQuery(query);
    const { data: calveData, error: calveError } = await query;
    if (calveError) throw calveError;

    // Fetch division statistics from v_division_statistics (only division filter)
    query = supabase.from('v_division_statistics').select('*');
    query = buildDivisionQuery(query);
    const { data: divisionData, error: divisionError } = await query;
    if (divisionError) throw divisionError;

    // Fetch heatmap data from v_activity_heatmap (all filters)
    query = supabase.from('v_activity_heatmap').select('*');
    query = buildFullQuery(query);
    const { data: heatmapData, error: heatmapError } = await query;
    if (heatmapError) throw heatmapError;

    // Fetch recent observations from v_recent_observations (all filters)
    query = supabase.from('v_recent_observations').select('*');
    query = buildFullQuery(query);
    const { data: recentObservations, error: recentError } = await query;
    if (recentError) throw recentError;

    // Process the data into the DashboardStats format
    const stats: DashboardStats = {
      totalObservations: totalData?.[0]?.count || 0,
      directSightings: totalData?.[0]?.direct_sightings || 0,
      indirectSigns: totalData?.[0]?.indirect_signs || 0,
      lossReports: lossData?.[0]?.count || 0,
      recentObservations: recentObservations || [],
      heatmapData: heatmapData?.map(point => [point.lat, point.lng, point.intensity]) || [],
      kpis: {
        totalElephants: elephantData?.[0]?.count || 0,
        maleElephants: maleData?.[0]?.count || 0,
        femaleElephants: femaleData?.[0]?.count || 0,
        unknownElephants: calveData?.[0]?.count || 0,
        totalCalves: calveData?.[0]?.count || 0,
        lossTypes: {}, // Will be populated from division stats if needed
        indirectSigns: {}, // Will be populated from division stats if needed
        divisionStats: divisionData?.reduce((acc, curr) => {
          acc[curr.division] = {
            total: curr.total_observations,
            direct: curr.direct_sightings,
            indirect: curr.indirect_signs,
            loss: curr.loss_reports,
            elephants: curr.total_elephants
          };
          return acc;
        }, {} as Record<string, DivisionStat>) || {},
        totalObservations: totalData?.[0]?.count || 0,
        observationsChange: 0, // This would need to be calculated based on historical data
        activeElephants: elephantData?.[0]?.count || 0,
        activeUsers: 0, // This would need to be calculated based on user activity
        usersChange: 0, // This would need to be calculated based on historical data
        reportsToday: 0, // This would need to be calculated based on today's date
        reportsChange: 0 // This would need to be calculated based on historical data
      }
    };

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export function updateDashboardStatsWithNewObservation(
  currentStats: DashboardStats,
  newObservation: ActivityReport
): DashboardStats {
  // Create a deep copy of the current stats
  const updatedStats = JSON.parse(JSON.stringify(currentStats)) as DashboardStats;

  // Update total observations count
  updatedStats.totalObservations += 1;

  // Update observation type counts
  if (newObservation.total_elephants > 0) {
    updatedStats.directSightings += 1;
    
    // Update elephant counts
    updatedStats.kpis.totalElephants += newObservation.total_elephants;
    updatedStats.kpis.maleElephants += newObservation.male_elephants;
    updatedStats.kpis.femaleElephants += newObservation.female_elephants;
    updatedStats.kpis.unknownElephants += 
      (newObservation.unknown_elephants || 
      (newObservation.total_elephants - 
      (newObservation.male_elephants + newObservation.female_elephants)));
    updatedStats.kpis.totalCalves += newObservation.unknown_elephants || 0;
    
    // Update division stats
    const division = newObservation.division_name || "Unknown";
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
    updatedStats.kpis.divisionStats[division].elephants += newObservation.total_elephants;
  }

  // Add to recent observations (at the beginning)
  updatedStats.recentObservations.unshift(newObservation);
  // Keep only the most recent 10
  updatedStats.recentObservations = updatedStats.recentObservations.slice(0, 10);

  // Add to heatmap data if location is available
  if (newObservation.latitude && newObservation.longitude) {
    let intensity = 1;
    if (newObservation.total_elephants > 0) {
      intensity = Math.min(newObservation.total_elephants, 10);
    }
    
    updatedStats.heatmapData.push([
      newObservation.latitude,
      newObservation.longitude,
      intensity
    ]);
  }

  return updatedStats;
}
