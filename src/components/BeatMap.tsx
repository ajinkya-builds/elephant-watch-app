import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabaseClient';
import { ewkbHexToGeoJSON } from '@/lib/utils/geometryUtils';
import { Polygon as GeoJSONPolygon } from 'geojson';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface BeatPolygonData {
  id: string;
  beat_id: string;
  name: string;
  polygon: GeoJSONPolygon; // GeoJSON polygon after conversion
  range_id: string;
  division_id: string;
  range_name?: string;
  division_name?: string;
}

interface RangePolygonData {
  id: string;
  range_id: string;
  name: string;
  polygon: GeoJSONPolygon; // GeoJSON polygon after conversion
  division_id: string;
  division_name?: string;
}

interface DivisionPolygonData {
  id: string;
  division_id: string;
  name: string;
  polygon: GeoJSONPolygon; // GeoJSON polygon after conversion
}

interface BeatData {
  id: string;
  name: string;
  range_id: string;
  division_id: string;
  beat_polygons: {
    polygon: any;
  }[];
  range?: {
    name: string;
    division?: {
      name: string;
    };
  };
}

interface RangeData {
  id: string;
  name: string;
  division_id: string;
  range_polygons: {
    polygon: any;
  }[];
  division?: {
    name: string;
  };
}

interface DivisionData {
  id: string;
  name: string;
  division_polygons: {
    polygon: any;
  }[];
}

// Component to handle map zoom level changes
function MapZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

interface BeatMapProps {
  selectedBeat?: string;
  selectedRange?: string;
  selectedDivision?: string;
}

export function BeatMap({ selectedBeat, selectedRange, selectedDivision }: BeatMapProps) {
  const [beatPolygon, setBeatPolygon] = useState<BeatPolygonData | null>(null);
  const [rangePolygon, setRangePolygon] = useState<RangePolygonData | null>(null);
  const [divisionPolygon, setDivisionPolygon] = useState<DivisionPolygonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);

  useEffect(() => {
    async function fetchPolygons() {
      try {
        setLoading(true);
        setError(null);

        // Fetch beat polygon if selected
        if (selectedBeat) {
          console.log('Fetching beat data for ID:', selectedBeat);
          
          // First, let's check if the beat exists and get its basic info
          const { data: beatInfo, error: beatInfoError } = await supabase
            .from('beats')
            .select('id, name, range_id, division_id')
            .eq('id', selectedBeat)
            .single();

          if (beatInfoError) {
            console.error('Error fetching beat info:', beatInfoError);
            throw new Error(`Failed to fetch beat info: ${beatInfoError.message}`);
          }

          if (!beatInfo) {
            console.error('No beat found with ID:', selectedBeat);
            throw new Error(`No beat found with ID: ${selectedBeat}`);
          }

          console.log('Beat info:', beatInfo);

          // Let's check the beat_polygons table directly
          const { data: polygonData, error: polygonError } = await supabase
            .from('beat_polygons')
            .select('*')
            .eq('beat_id', selectedBeat)
            .single();

          if (polygonError) {
            console.error('Error fetching polygon:', polygonError);
            throw new Error(`Failed to fetch polygon: ${polygonError.message}`);
          }

          if (!polygonData) {
            console.error('No polygon found for beat:', selectedBeat);
            throw new Error('No polygon found for this beat');
          }

          console.log('Raw polygon data:', polygonData);
          console.log('Polygon data type:', typeof polygonData.polygon);
          console.log('Polygon data structure:', JSON.stringify(polygonData.polygon, null, 2));

          // Get the range and division info
          const { data: rangeData, error: rangeError } = await supabase
            .from('ranges')
            .select(`
              name,
              division:division_id (
                name
              )
            `)
            .eq('id', beatInfo.range_id)
            .single();

          if (rangeError) {
            console.error('Error fetching range info:', rangeError);
            throw new Error(`Failed to fetch range info: ${rangeError.message}`);
          }

          // Parse the polygon data
          let polygon;
          try {
            if (typeof polygonData.polygon === 'string') {
              // If it's a WKT string, convert it to GeoJSON
              if (polygonData.polygon.startsWith('SRID=4326;')) {
                console.log('Processing WKT polygon');
                const wkt = polygonData.polygon.replace('SRID=4326;', '');
                console.log('WKT after removing SRID:', wkt);
                
                // Extract coordinates from WKT
                const coordString = wkt
                  .replace('POLYGON((', '')
                  .replace('))', '');
                console.log('Coordinate string:', coordString);
                
                const coordinates = coordString
                  .split(',')
                  .map(coord => {
                    const [lng, lat] = coord.trim().split(' ').map(Number);
                    console.log('Parsed coordinate:', [lng, lat]);
                    return [lng, lat];
                  });
                
                console.log('Parsed coordinates:', coordinates);
                
                polygon = {
                  type: 'Polygon',
                  coordinates: [coordinates]
                };
              } else {
                console.log('Processing JSON string polygon');
                polygon = JSON.parse(polygonData.polygon);
              }
            } else {
              console.log('Processing object polygon');
              polygon = polygonData.polygon;
            }
            console.log('Processed polygon:', polygon);
          } catch (e) {
            console.error('Error processing polygon data:', e);
            throw new Error(`Invalid polygon data format: ${e.message}`);
          }

          // Validate polygon structure
          if (!polygon || !polygon.coordinates || !Array.isArray(polygon.coordinates[0])) {
            console.error('Invalid polygon structure:', polygon);
            throw new Error('Invalid polygon structure');
          }

          // Ensure coordinates are in the correct format for Leaflet
          const leafletCoordinates = polygon.coordinates[0].map((coord: [number, number]) => {
            const [lng, lat] = coord;
            if (isNaN(lat) || isNaN(lng)) {
              console.warn('Invalid coordinate:', coord);
              return null;
            }
            // Validate coordinate ranges
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.warn('Coordinate out of valid range:', coord);
              return null;
            }
            return [lat, lng] as [number, number];
          }).filter((coord): coord is [number, number] => coord !== null);

          if (leafletCoordinates.length === 0) {
            throw new Error('No valid coordinates found in polygon');
          }

          console.log('Leaflet coordinates:', leafletCoordinates);

          // Calculate the center of the polygon for the map view
          const center = calculateCentroid(leafletCoordinates);
          console.log('Calculated center:', center);

          setBeatPolygon({
            id: beatInfo.id,
            beat_id: beatInfo.id,
            name: beatInfo.name,
            polygon: {
              type: 'Polygon',
              coordinates: [leafletCoordinates.map(([lat, lng]) => [lng, lat])]
            },
            range_id: beatInfo.range_id,
            division_id: beatInfo.division_id,
            range_name: rangeData?.name,
            division_name: rangeData?.division?.name
          });
        } else {
          setBeatPolygon(null);
        }

        // Fetch range polygon if selected
        if (selectedRange) {
          const { data: rangeData, error: rangeError } = await supabase
            .from('ranges')
            .select(`
              id,
              name,
              division_id,
              range_polygons!inner (
                polygon
              ),
              division:division_id (
                name
              )
            `)
            .eq('id', selectedRange)
            .single() as { data: RangeData | null, error: any };

          if (!rangeError && rangeData) {
            console.log('Range data:', rangeData);

            // Parse the polygon data
            let polygonData;
            try {
              if (typeof rangeData.range_polygons[0].polygon === 'string') {
                polygonData = JSON.parse(rangeData.range_polygons[0].polygon);
              } else {
                polygonData = rangeData.range_polygons[0].polygon;
              }
            } catch (e) {
              console.error('Error parsing range polygon data:', e);
              throw new Error('Invalid range polygon data format');
            }

            setRangePolygon({
              id: rangeData.id,
              range_id: rangeData.id,
              name: rangeData.name,
              polygon: polygonData,
              division_id: rangeData.division_id,
              division_name: rangeData.division?.name
            });
          } else {
            setRangePolygon(null);
          }
        } else {
          setRangePolygon(null);
        }

        // Fetch division polygon if selected
        if (selectedDivision) {
          const { data: divisionData, error: divisionError } = await supabase
            .from('divisions')
            .select(`
              id,
              name,
              division_polygons!inner (
                polygon
              )
            `)
            .eq('id', selectedDivision)
            .single() as { data: DivisionData | null, error: any };

          if (!divisionError && divisionData) {
            console.log('Division data:', divisionData);

            // Parse the polygon data
            let polygonData;
            try {
              if (typeof divisionData.division_polygons[0].polygon === 'string') {
                polygonData = JSON.parse(divisionData.division_polygons[0].polygon);
              } else {
                polygonData = divisionData.division_polygons[0].polygon;
              }
            } catch (e) {
              console.error('Error parsing division polygon data:', e);
              throw new Error('Invalid division polygon data format');
            }

            setDivisionPolygon({
              id: divisionData.id,
              division_id: divisionData.id,
              name: divisionData.name,
              polygon: polygonData
            });
          } else {
            setDivisionPolygon(null);
          }
        } else {
          setDivisionPolygon(null);
        }

      } catch (err) {
        console.error('Error in fetchPolygons:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch polygon data');
      } finally {
        setLoading(false);
      }
    }

    fetchPolygons();
  }, [selectedBeat, selectedRange, selectedDivision]);

  if (loading) return <div>Loading polygon data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!beatPolygon && !rangePolygon && !divisionPolygon) {
    return <div>Select a beat, range, or division to view the map</div>;
  }

  // Calculate the center based on available polygons
  let center: [number, number] = [20.5937, 78.9629]; // Default to central India
  let positions: [number, number][] = [];

  if (beatPolygon?.polygon?.coordinates?.[0]) {
    positions = beatPolygon.polygon.coordinates[0]
      .map((coord: [number, number]) => {
        const [lng, lat] = coord;
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid beat coordinates:', coord);
          return null;
        }
        return [lat, lng] as [number, number];
      })
      .filter((coord): coord is [number, number] => coord !== null);
  } else if (rangePolygon?.polygon?.coordinates?.[0]) {
    positions = rangePolygon.polygon.coordinates[0]
      .map((coord: [number, number]) => {
        const [lng, lat] = coord;
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid range coordinates:', coord);
          return null;
        }
        return [lat, lng] as [number, number];
      })
      .filter((coord): coord is [number, number] => coord !== null);
  } else if (divisionPolygon?.polygon?.coordinates?.[0]) {
    positions = divisionPolygon.polygon.coordinates[0]
      .map((coord: [number, number]) => {
        const [lng, lat] = coord;
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid division coordinates:', coord);
          return null;
        }
        return [lat, lng] as [number, number];
      })
      .filter((coord): coord is [number, number] => coord !== null);
  }

  if (positions.length > 0) {
    center = calculateCentroid(positions);
  }

  // Determine which boundaries to show based on zoom level
  const showDivision = zoomLevel <= 10 && divisionPolygon;
  const showRange = zoomLevel <= 11 && rangePolygon;
  const showBeat = zoomLevel >= 11 && beatPolygon;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomHandler onZoomChange={setZoomLevel} />
        
        {showDivision && divisionPolygon && (
          <Polygon
            positions={divisionPolygon.polygon.coordinates[0].map((coord: [number, number]) => {
              const [lng, lat] = coord;
              return [lat, lng] as [number, number];
            })}
            pathOptions={{ 
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.1,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">Division</h3>
                <p>{divisionPolygon.name}</p>
              </div>
            </Popup>
          </Polygon>
        )}

        {showRange && rangePolygon && (
          <Polygon
            positions={rangePolygon.polygon.coordinates[0].map((coord: [number, number]) => {
              const [lng, lat] = coord;
              return [lat, lng] as [number, number];
            })}
            pathOptions={{ 
              color: '#16a34a',
              fillColor: '#16a34a',
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">Range</h3>
                <p>{rangePolygon.name}</p>
                {rangePolygon.division_name && (
                  <p>Division: {rangePolygon.division_name}</p>
                )}
              </div>
            </Popup>
          </Polygon>
        )}

        {showBeat && beatPolygon && (
          <Polygon
            positions={beatPolygon.polygon.coordinates[0].map((coord: [number, number]) => {
              const [lng, lat] = coord;
              console.log('Rendering beat coordinate:', [lat, lng]);
              return [lat, lng] as [number, number];
            })}
            pathOptions={{ 
              color: '#dc2626',
              fillColor: '#dc2626',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">Beat</h3>
                <p>{beatPolygon.name}</p>
                {beatPolygon.range_name && (
                  <p>Range: {beatPolygon.range_name}</p>
                )}
                {beatPolygon.division_name && (
                  <p>Division: {beatPolygon.division_name}</p>
                )}
              </div>
            </Popup>
          </Polygon>
        )}
      </MapContainer>
    </div>
  );
}

// Helper function to calculate the centroid of a polygon
function calculateCentroid(points: [number, number][]): [number, number] {
  if (!points || points.length === 0) {
    // Default to a central location in India if no points are available
    return [20.5937, 78.9629];
  }

  let x = 0;
  let y = 0;
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const [lat, lng] = points[i];
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates found:', points[i]);
      continue;
    }
    x += lat;
    y += lng;
  }

  // If all coordinates were invalid, return default
  if (x === 0 && y === 0) {
    return [20.5937, 78.9629];
  }

  return [x / len, y / len];
} 