import { supabase } from '../supabaseClient';
import * as shapefile from 'shapefile';
import { Feature, Polygon } from 'geojson';

interface BeatPolygon {
  beat_name: string;
  range_name: string;
  division_name: string;
  geometry: string; // WKT format
}

export async function importShapefile(
  file: File,
  divisionName: string,
  rangeName: string
): Promise<void> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Read the shapefile
    const source = await shapefile.open(arrayBuffer);
    const features: Feature<Polygon>[] = [];
    
    // Read all features
    while (true) {
      const result = await source.read();
      if (result.done) break;
      features.push(result.value as Feature<Polygon>);
    }

    // Process each feature
    for (const feature of features) {
      if (feature.geometry.type === 'Polygon') {
        const beatName = feature.properties?.BEAT_NAME || feature.properties?.beat_name;
        if (!beatName) {
          console.warn('Feature missing beat name:', feature);
          continue;
        }

        // Convert GeoJSON to WKT
        const wkt = `POLYGON((${feature.geometry.coordinates[0]
          .map(coord => `${coord[0]} ${coord[1]}`)
          .join(', ')}))`;

        const beatPolygon: BeatPolygon = {
          beat_name: beatName,
          range_name: rangeName,
          division_name: divisionName,
          geometry: wkt
        };

        // Insert into database
        const { error } = await supabase
          .from('beat_polygons')
          .upsert(beatPolygon, {
            onConflict: 'beat_name,range_name,division_name'
          });

        if (error) {
          console.error('Error inserting beat polygon:', error);
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error importing shapefile:', error);
    throw error;
  }
}

export async function findBeatForCoordinates(
  latitude: number,
  longitude: number
): Promise<{ beat_name: string; range_name: string; division_name: string } | null> {
  try {
    const { data, error } = await supabase
      .rpc('find_beat_for_coordinates', {
        lat: latitude,
        lon: longitude
      });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error finding beat for coordinates:', error);
    throw error;
  }
} 