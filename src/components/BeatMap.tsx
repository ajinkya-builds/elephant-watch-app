import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/BeatMap.css';
import { supabase } from '@/lib/supabaseClient';
import { ewkbHexToGeoJSON } from '@/lib/utils/geometryUtils';
import { Polygon as GeoJSONPolygon, Position } from 'geojson';
import { ActivityObservation } from '@/types/activity-observation';

// Create custom marker icon
const customIcon = new L.DivIcon({
  className: 'custom-marker',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6]
});

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
  polygon: GeoJSONPolygon;
  range_id: string;
  division_id: string;
  range_name?: string;
  division_name?: string;
}

interface RangePolygonData {
  id: string;
  range_id: string;
  name: string;
  polygon: GeoJSONPolygon;
  division_id: string;
  division_name?: string;
}

interface DivisionPolygonData {
  id: string;
  division_id: string;
  name: string;
  polygon: GeoJSONPolygon;
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

// Add this component to fit map bounds to markers
function MapBounds({ observations }: { observations: ActivityObservation[] }) {
  const map = useMap();
  useEffect(() => {
    if (observations.length > 0) {
      const bounds = L.latLngBounds(
        observations.map(obs => [Number(obs.latitude), Number(obs.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [observations, map]);
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
  const [observations, setObservations] = useState<ActivityObservation[]>([]);

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
            .select('new_id, name, new_range_id, new_division_id')
            .eq('new_id', selectedBeat)
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
            .eq('new_beat_id', selectedBeat)
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
              division:new_division_id (
                name
              )
            `)
            .eq('new_id', beatInfo.new_range_id)
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
            id: beatInfo.new_id,
            beat_id: beatInfo.new_id,
            name: beatInfo.name,
            polygon: {
              type: 'Polygon',
              coordinates: [leafletCoordinates.map(([lat, lng]) => [lng, lat])]
            },
            range_id: beatInfo.new_range_id,
            division_id: beatInfo.new_division_id,
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
              new_id,
              name,
              new_division_id,
              range_polygons!inner (
                polygon
              )
            `)
            .eq('new_id', selectedRange)
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
              id: rangeData.new_id,
              range_id: rangeData.new_id,
              name: rangeData.name,
              polygon: polygonData,
              division_id: rangeData.new_division_id,
              division_name: undefined // update if you fetch division name
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

  useEffect(() => {
    async function fetchObservations() {
      try {
        const { data, error } = await supabase
          .from('v_map_observations')
          .select('*');
        if (error) throw error;
        setObservations(data || []);
      } catch (err) {
        console.error('Error fetching observations:', err);
      }
    }
    fetchObservations();
  }, []);

  // Debug: Log observations
  console.log('Observations for markers:', observations);

  // Calculate initial center based on observations
  const initialCenter = observations.length > 0
    ? [Number(observations[0].latitude), Number(observations[0].longitude)]
    : [20.5937, 78.9629]; // Default to central India

  // Determine which boundaries to show based on zoom level
  const showDivision = zoomLevel <= 10 && divisionPolygon;
  const showRange = zoomLevel <= 11 && rangePolygon;
  const showBeat = zoomLevel >= 11 && beatPolygon;

  console.log('BeatMap component is mounted!');
  console.log('Rendering BeatMap, observations:', observations);

  observations.forEach(obs => {
    console.log('Marker:', obs.id, obs.latitude, obs.longitude, typeof obs.latitude, typeof obs.longitude);
  });

  return (
    <div className="map-container">
      {loading && <div className="map-loading">Loading map data...</div>}
      {error && <div className="map-error">{error}</div>}
      <MapContainer
        center={initialCenter as [number, number]}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomHandler onZoomChange={setZoomLevel} />
        {/* Fit map to marker bounds */}
        <MapBounds observations={observations} />
        
        {showDivision && divisionPolygon && (
          <Polygon
            positions={divisionPolygon.polygon.coordinates[0].map((coord: Position) => {
              const [lng, lat] = coord as [number, number];
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
            positions={rangePolygon.polygon.coordinates[0].map((coord: Position) => {
              const [lng, lat] = coord as [number, number];
              return [lat, lng] as [number, number];
            })}
            pathOptions={{ 
              color: '#f59e42',
              fillColor: '#f59e42',
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
            positions={beatPolygon.polygon.coordinates[0].map((coord: Position) => {
              const [lng, lat] = coord as [number, number];
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

        {/* Render observation markers, filter out invalid coordinates, use default marker icon for debugging */}
        {observations
          .filter(obs => !isNaN(Number(obs.latitude)) && !isNaN(Number(obs.longitude)))
          .map((observation) => (
            <Marker
              key={observation.id}
              position={[Number(observation.latitude), Number(observation.longitude)]}
              // icon={customIcon} // Use default icon for debugging
            >
              <Popup>
                <div className="observation-popup">
                  <h3>Elephant Observation</h3>
                  <p><strong>Date:</strong> {new Date(observation.activity_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {observation.activity_time}</p>
                  <p><strong>Type:</strong> {observation.observation_type}</p>
                  <div className="details">
                    <p><strong>Total Elephants:</strong> {observation.total_elephants}</p>
                    {observation.male_elephants && <p><strong>Males:</strong> {observation.male_elephants}</p>}
                    {observation.female_elephants && <p><strong>Females:</strong> {observation.female_elephants}</p>}
                    {observation.calves && <p><strong>Calves:</strong> {observation.calves}</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}
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