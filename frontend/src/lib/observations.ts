import { supabase } from "./supabaseClient";

export interface ActivityObservation {
  id: string;
  activity_report_id: string;
  total_elephants: number;
  adult_male_count: number;
  adult_female_count: number;
  sub_adult_male_count: number;
  sub_adult_female_count: number;
  calf_count: number;
  unknown_count: number;
  indirect_sighting_type?: string;
  damage_done?: string;
  damage_description?: string;
  loss_type?: string;
  compass_bearing?: number;
  distance?: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityReport {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  activity_date: string;
  activity_time: string;
  latitude: number;
  longitude: number;
  observation_type: 'direct' | 'indirect' | 'loss';
  status: 'draft' | 'submitted' | 'synced' | 'error';
  is_offline: boolean;
  division_id?: string;
  range_id?: string;
  beat_id?: string;
  division_name?: string;
  range_name?: string;
  beat_name?: string;
  compass_bearing?: number;
  distance?: number;
  indirect_sighting_type?: string;
  damage_done?: string;
  damage_description?: string;
  loss_type?: string;
  photo_url?: string;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string;
    full_name?: string;
  };
  activity_observation?: ActivityObservation[];
  reporter_mobile?: string;
  total_elephants?: number;
  adult_male_count?: number;
  adult_female_count?: number;
  unknown_count?: number;
  associated_division?: string;
  associated_range?: string;
  associated_beat?: string;
  email?: string;
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

// Type guard for ActivityReport
function isActivityReport(data: any): data is ActivityReport {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.created_at === 'string' &&
    typeof data.updated_at === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.activity_date === 'string' &&
    typeof data.activity_time === 'string' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    typeof data.observation_type === 'string' &&
    typeof data.status === 'string' &&
    typeof data.is_offline === 'boolean' &&
    (data.division_id === undefined || typeof data.division_id === 'string') &&
    (data.range_id === undefined || typeof data.range_id === 'string') &&
    (data.beat_id === undefined || typeof data.beat_id === 'string') &&
    (data.division_name === undefined || typeof data.division_name === 'string') &&
    (data.range_name === undefined || typeof data.range_name === 'string') &&
    (data.beat_name === undefined || typeof data.beat_name === 'string') &&
    (data.compass_bearing === undefined || typeof data.compass_bearing === 'number') &&
    (data.distance === undefined || typeof data.distance === 'number') &&
    (data.indirect_sighting_type === undefined || typeof data.indirect_sighting_type === 'string') &&
    (data.damage_done === undefined || typeof data.damage_done === 'string') &&
    (data.damage_description === undefined || typeof data.damage_description === 'string') &&
    (data.loss_type === undefined || typeof data.loss_type === 'string') &&
    (data.photo_url === undefined || typeof data.photo_url === 'string') &&
    (data.users === undefined || Array.isArray(data.users)) &&
    (data.activity_observation === undefined || Array.isArray(data.activity_observation)) &&
    (data.reporter_mobile === undefined || typeof data.reporter_mobile === 'string') &&
    (data.total_elephants === undefined || typeof data.total_elephants === 'number') &&
    (data.adult_male_count === undefined || typeof data.adult_male_count === 'number') &&
    (data.adult_female_count === undefined || typeof data.adult_female_count === 'number') &&
    (data.unknown_count === undefined || typeof data.unknown_count === 'number') &&
    (data.associated_division === undefined || typeof data.associated_division === 'string') &&
    (data.associated_range === undefined || typeof data.associated_range === 'string') &&
    (data.associated_beat === undefined || typeof data.associated_beat === 'string') &&
    (data.email === undefined || typeof data.email === 'string')
  );
}

// Type guard functions
function isTotalObservationsData(data: any): data is TotalObservationsData {
  return (
    data &&
    typeof data.count === 'number' &&
    typeof data.direct_sightings === 'number' &&
    typeof data.indirect_signs === 'number'
  );
}

function isCountData(data: any): data is CountData {
  return data && typeof data.count === 'number';
}

function isDivisionStatData(data: any): data is DivisionStatData {
  return (
    data &&
    typeof data.division === 'string' &&
    typeof data.total_observations === 'number' &&
    typeof data.direct_sightings === 'number' &&
    typeof data.indirect_signs === 'number' &&
    typeof data.loss_reports === 'number' &&
    typeof data.total_elephants === 'number'
  );
}

function isHeatmapPointData(data: any): data is HeatmapPointData {
  return (
    data &&
    typeof data.lat === 'number' &&
    typeof data.lng === 'number' &&
    typeof data.intensity === 'number'
  );
}

// Helper function to safely extract data with type checking
function safeExtract<T>(data: any, typeGuard: (d: any) => d is T, defaultValue: T): T {
  return typeGuard(data) ? data : defaultValue;
}

// Helper function to safely extract array data with type checking
function safeExtractArray<T>(data: any[], typeGuard: (d: any) => d is T): T[] {
  if (!Array.isArray(data)) return [];
  return data.filter(typeGuard);
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

// Interface for the view data structures
interface TotalObservationsData {
  count: number;
  direct_sightings: number;
  indirect_signs: number;
}

interface CountData {
  count: number;
}

interface DivisionStatData {
  division: string;
  total_observations: number;
  direct_sightings: number;
  indirect_signs: number;
  loss_reports: number;
  total_elephants: number;
}

interface HeatmapPointData {
  lat: number;
  lng: number;
  intensity: number;
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
    const totalObservationsData = safeExtract(
      totalData?.[0],
      isTotalObservationsData,
      { count: 0, direct_sightings: 0, indirect_signs: 0 }
    );

    // Fetch total loss from v_total_loss (only division filter)
    query = supabase.from('v_total_loss').select('*');
    query = buildDivisionQuery(query);
    const { data: lossData, error: lossError } = await query;
    if (lossError) throw lossError;
    const lossCount = safeExtract(lossData?.[0], isCountData, { count: 0 }).count;

    // Fetch total elephants from v_total_elephants (only division filter)
    query = supabase.from('v_total_elephants').select('*');
    query = buildDivisionQuery(query);
    const { data: elephantData, error: elephantError } = await query;
    if (elephantError) throw elephantError;
    const elephantCount = safeExtract(elephantData?.[0], isCountData, { count: 0 }).count;

    // Fetch male elephants from v_male_elephant_counts (only division filter)
    query = supabase.from('v_male_elephant_counts').select('*');
    query = buildDivisionQuery(query);
    const { data: maleData, error: maleError } = await query;
    if (maleError) throw maleError;
    const maleCount = safeExtract(maleData?.[0], isCountData, { count: 0 }).count;

    // Fetch female elephants from v_female_elephant_counts (only division filter)
    query = supabase.from('v_female_elephant_counts').select('*');
    query = buildDivisionQuery(query);
    const { data: femaleData, error: femaleError } = await query;
    if (femaleError) throw femaleError;
    const femaleCount = safeExtract(femaleData?.[0], isCountData, { count: 0 }).count;

    // Fetch calves from v_calve_count (only division filter)
    query = supabase.from('v_calve_count').select('*');
    query = buildDivisionQuery(query);
    const { data: calveData, error: calveError } = await query;
    if (calveError) throw calveError;
    const calveCount = safeExtract(calveData?.[0], isCountData, { count: 0 }).count;

    // Fetch division statistics from v_dashboard_division_stats (only division filter)
    query = supabase.from('v_dashboard_division_stats').select('*');
    query = buildDivisionQuery(query);
    const { data: divisionData, error: divisionError } = await query;
    if (divisionError) throw divisionError;
    const divisionStatsData = safeExtractArray(divisionData || [], isDivisionStatData);

    // Fetch heatmap data from v_activity_heatmap (all filters)
    query = supabase.from('v_activity_heatmap').select('*');
    query = buildFullQuery(query);
    const { data: heatmapData, error: heatmapError } = await query;
    if (heatmapError) throw heatmapError;
    const heatmapPoints = safeExtractArray(heatmapData || [], isHeatmapPointData);

    // Fetch recent observations from v_recent_observations (all filters)
    query = supabase.from('v_recent_observations').select('*');
    query = buildFullQuery(query);
    const { data: recentObservations, error: recentError } = await query;
    if (recentError) throw recentError;
    const validRecentObservations = safeExtractArray(recentObservations || [], isActivityReport);

    // Process the data into the DashboardStats format
    const stats: DashboardStats = {
      totalObservations: totalObservationsData.count,
      directSightings: totalObservationsData.direct_sightings,
      indirectSigns: totalObservationsData.indirect_signs,
      lossReports: lossCount,
      recentObservations: validRecentObservations,
      heatmapData: heatmapPoints.map(point => [point.lat, point.lng, point.intensity] as [number, number, number]),
      kpis: {
        totalElephants: elephantCount,
        maleElephants: maleCount,
        femaleElephants: femaleCount,
        unknownElephants: calveCount,
        totalCalves: calveCount,
        lossTypes: {}, // Will be populated from division stats if needed
        indirectSigns: {}, // Will be populated from division stats if needed
        divisionStats: divisionStatsData.reduce((acc, curr) => {
          acc[curr.division] = {
            total: curr.total_observations,
            direct: curr.direct_sightings,
            indirect: curr.indirect_signs,
            loss: curr.loss_reports,
            elephants: curr.total_elephants
          };
          return acc;
        }, {} as Record<string, DivisionStat>),
        totalObservations: totalObservationsData.count,
        observationsChange: 0,
        activeElephants: elephantCount,
        activeUsers: 0,
        usersChange: 0,
        reportsToday: 0,
        reportsChange: 0
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
  const updatedStats = { ...currentStats };
  
  // Update total observations
  updatedStats.totalObservations++;
  
  // Update observation type counts
  if (newObservation.observation_type === 'direct') {
    updatedStats.directSightings++;
  } else if (newObservation.observation_type === 'indirect') {
    updatedStats.indirectSigns++;
  } else if (newObservation.observation_type === 'loss') {
    updatedStats.lossReports++;
  }
  
  // Update elephant counts if available
  if (newObservation.total_elephants && newObservation.total_elephants > 0) {
    updatedStats.kpis.totalElephants += newObservation.total_elephants;
    
    if (newObservation.adult_male_count) {
      updatedStats.kpis.maleElephants += newObservation.adult_male_count;
    }
    
    if (newObservation.adult_female_count) {
      updatedStats.kpis.femaleElephants += newObservation.adult_female_count;
    }
    
    if (newObservation.unknown_count) {
      updatedStats.kpis.unknownElephants += newObservation.unknown_count;
    }
    
    // Calculate calves if we have all the necessary counts
    if (newObservation.adult_male_count && newObservation.adult_female_count) {
      const adultCount = newObservation.adult_male_count + newObservation.adult_female_count;
      if (newObservation.total_elephants > adultCount) {
        updatedStats.kpis.totalCalves += newObservation.total_elephants - adultCount;
      }
    }
  }
  
  // Update division stats if available
  if (newObservation.division_name) {
    const division = newObservation.division_name;
    if (!updatedStats.kpis.divisionStats[division]) {
      updatedStats.kpis.divisionStats[division] = {
        total: 0,
        direct: 0,
        indirect: 0,
        loss: 0,
        elephants: 0
      };
    }
    
    updatedStats.kpis.divisionStats[division].total++;
    if (newObservation.observation_type === 'direct') {
      updatedStats.kpis.divisionStats[division].direct++;
    } else if (newObservation.observation_type === 'indirect') {
      updatedStats.kpis.divisionStats[division].indirect++;
    } else if (newObservation.observation_type === 'loss') {
      updatedStats.kpis.divisionStats[division].loss++;
    }
    
    if (newObservation.total_elephants) {
      updatedStats.kpis.divisionStats[division].elephants += newObservation.total_elephants;
    }
  }
  
  // Update heatmap data
  if (newObservation.latitude && newObservation.longitude) {
    let intensity = 1;
    if (newObservation.total_elephants && newObservation.total_elephants > 0) {
      intensity = Math.min(newObservation.total_elephants, 10);
    }
    updatedStats.heatmapData.push([newObservation.latitude, newObservation.longitude, intensity]);
  }
  
  // Add to recent observations
  updatedStats.recentObservations = [newObservation, ...updatedStats.recentObservations].slice(0, 10);
  
  return updatedStats;
}
