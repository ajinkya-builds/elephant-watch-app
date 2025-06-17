import { supabase } from '../supabase';
import * as shapefile from 'shapefile';
import { Feature, Polygon } from 'geojson';

interface BeatPolygon {
  id: string;
  beat_name: string;
  range_name: string;
  division_name: string;
  geometry: any;
  properties: Record<string, unknown>;
}

export async function importShapefile(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/import-shapefile', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to import shapefile');
    }

    const data = await response.json();
    const beatPolygons: BeatPolygon[] = data.features.map((feature: any) => ({
      id: feature.properties.id,
      beat_name: feature.properties.beat_name,
      range_name: feature.properties.range_name,
      division_name: feature.properties.division_name,
      geometry: feature.geometry,
      properties: feature.properties
    }));

    const { error } = await supabase
      .from('beat_polygons')
      .upsert(beatPolygons.map(polygon => ({
        id: polygon.id,
        beat_name: polygon.beat_name,
        range_name: polygon.range_name,
        division_name: polygon.division_name,
        geometry: polygon.geometry,
        properties: polygon.properties
      })));

    if (error) throw error;

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