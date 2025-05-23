import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, LayersControl, ZoomControl, ScaleControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabaseClient';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Polygon as GeoJSONPolygon } from 'geojson';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom elephant marker icon
const elephantIcon = new L.Icon({
  iconUrl: '/icons/elephant-marker.png',  // You'll need to add this icon to your public folder
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface DivisionPolygon {
  division_id: string;
  division_name: string;
  geometry: GeoJSONPolygon;
  observation_count: number;
  direct_sightings: number;
  indirect_sightings: number;
}

interface RangePolygon {
  range_id: string;
  range_name: string;
  division_id: string;
  division_name: string;
  geometry: GeoJSONPolygon;
  observation_count: number;
  direct_sightings: number;
  indirect_sightings: number;
}

interface BeatPolygon {
  beat_id: string;
  beat_name: string;
  range_id: string;
  range_name: string;
  division_id: string;
  division_name: string;
  geometry: GeoJSONPolygon;
  observation_count: number;
  direct_sightings: number;
  indirect_sightings: number;
}

interface BoundaryPolygon {
  id: string;
  name: string;
  polygon: GeoJSONPolygon;
  parent_id?: string;
  parent_name?: string;
  stats?: {
    total: number;
    direct: number;
    indirect: number;
  };
}

interface ElephantSighting {
  id: string;
  latitude: number;
  longitude: number;
  activity_date: string;
  activity_time: string;
  observation_type: string;
  total_elephants?: number;
  male_elephants?: number;
  female_elephants?: number;
  unknown_elephants?: number;
  calves?: number;
  indirect_sighting_type?: string;
  loss_type?: string;
  photo_url?: string;
  associated_beat?: string;
  associated_range?: string;
  associated_division?: string;
}

interface BeatMapProps {
  selectedBeat?: string;
  selectedRange?: string;
  selectedDivision?: string;
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

export function BeatMap({ selectedBeat, selectedRange, selectedDivision }: BeatMapProps) {
  const [beatPolygon, setBeatPolygon] = useState<BoundaryPolygon | null>(null);
  const [rangePolygon, setRangePolygon] = useState<BoundaryPolygon | null>(null);
  const [divisionPolygon, setDivisionPolygon] = useState<BoundaryPolygon | null>(null);
  const [elephantSightings, setElephantSightings] = useState<ElephantSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [showSightings, setShowSightings] = useState(true);

  useEffect(() => {
    async function fetchSightings() {
      try {
        let query = supabase
          .from('activity_observation')
          .select(`
            id,
            latitude,
            longitude,
            activity_date,
            activity_time,
            observation_type,
            total_elephants,
            male_elephants,
            female_elephants,
            unknown_elephants,
            calves,
            indirect_sighting_type,
            loss_type,
            photo_url,
            associated_beat,
            associated_range,
            associated_division
          `);
        
        if (selectedBeat) {
          query = query.eq('associated_beat_id', selectedBeat);
        } else if (selectedRange) {
          query = query.eq('associated_range_id', selectedRange);
        } else if (selectedDivision) {
          query = query.eq('associated_division_id', selectedDivision);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Activity observation query error:', error);
          return;
        }

        setElephantSightings(data || []);
      } catch (err) {
        console.error('Error fetching activity observations:', err);
      }
    }

    fetchSightings();
  }, [selectedBeat, selectedRange, selectedDivision]);

  useEffect(() => {
    async function fetchPolygons() {
      try {
        setLoading(true);
        setError(null);

        // Fetch division polygon if selected
        if (selectedDivision) {
          console.log('Fetching division polygon for:', selectedDivision);
          
          // First get division info
          const { data: divisionData, error: divisionError } = await supabase
            .from('divisions')
            .select('id, name')
            .eq('id', selectedDivision)
            .single();

          if (divisionError) {
            console.error('Division query error:', divisionError);
            throw new Error(`Failed to fetch division: ${divisionError.message}`);
          }

          // Then get the polygon
          const { data: polygonData, error: polygonError } = await supabase
            .from('division_polygons')
            .select('polygon')
            .eq('new_division_id', selectedDivision)
            .single();

          if (polygonError) {
            console.error('Division polygon query error:', polygonError);
            throw new Error(`Failed to fetch division polygon: ${polygonError.message}`);
          }

          if (!divisionData || !polygonData) {
            console.error('No division data found for ID:', selectedDivision);
            throw new Error('Division not found');
          }

          setDivisionPolygon({
            id: divisionData.id,
            name: divisionData.name,
            polygon: polygonData.polygon,
            stats: {
              total: 0,
              direct: 0,
              indirect: 0
            }
          });
        } else {
          setDivisionPolygon(null);
        }

        // Fetch range polygon if selected
        if (selectedRange) {
          console.log('Fetching range polygon for:', selectedRange);
          
          // First get range info
          const { data: rangeData, error: rangeError } = await supabase
            .from('ranges')
            .select('new_id, name, new_division_id, division_name')
            .eq('new_id', selectedRange)
            .single();

          if (rangeError) {
            console.error('Range query error:', rangeError);
            throw new Error(`Failed to fetch range: ${rangeError.message}`);
          }

          // Then get the polygon
          const { data: polygonData, error: polygonError } = await supabase
            .from('range_polygons')
            .select('polygon')
            .eq('new_range_id', selectedRange)
            .single();

          if (polygonError) {
            console.error('Range polygon query error:', polygonError);
            throw new Error(`Failed to fetch range polygon: ${polygonError.message}`);
          }

          if (!rangeData || !polygonData) {
            console.error('No range data found for ID:', selectedRange);
            throw new Error('Range not found');
          }

          setRangePolygon({
            id: rangeData.new_id,
            name: rangeData.name,
            polygon: polygonData.polygon,
            parent_id: rangeData.new_division_id,
            parent_name: rangeData.division_name,
            stats: {
              total: 0,
              direct: 0,
              indirect: 0
            }
          });
        } else {
          setRangePolygon(null);
        }

        // Fetch beat polygon if selected
        if (selectedBeat) {
          console.log('Fetching beat polygon for:', selectedBeat);
          
          // First get beat info
          const { data: beatData, error: beatError } = await supabase
            .from('beats')
            .select('id, name, new_range_id')
            .eq('id', selectedBeat)
            .single();

          if (beatError) {
            console.error('Beat query error:', beatError);
            throw new Error(`Failed to fetch beat: ${beatError.message}`);
          }

          // Then get the polygon
          const { data: polygonData, error: polygonError } = await supabase
            .from('beat_polygons')
            .select('polygon')
            .eq('new_beat_id', selectedBeat)
            .single();

          if (polygonError) {
            console.error('Beat polygon query error:', polygonError);
            throw new Error(`Failed to fetch beat polygon: ${polygonError.message}`);
          }

          if (!beatData || !polygonData) {
            console.error('No beat data found for ID:', selectedBeat);
            throw new Error('Beat not found');
          }

          // Get range name
          const { data: rangeData } = await supabase
            .from('ranges')
            .select('name')
            .eq('new_id', beatData.new_range_id)
            .single();

          setBeatPolygon({
            id: beatData.id,
            name: beatData.name,
            polygon: polygonData.polygon,
            parent_id: beatData.new_range_id,
            parent_name: rangeData?.name || '',
            stats: {
              total: 0,
              direct: 0,
              indirect: 0
            }
          });
        } else {
          setBeatPolygon(null);
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

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading map data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[600px] text-destructive">
          <span>Error: {error}</span>
        </div>
      </Card>
    );
  }

  // Calculate map center and bounds
  let center: [number, number] = [20.5937, 78.9629]; // Default to central India
  let bounds: L.LatLngBounds | null = null;

  const getPolygonBounds = (polygon: GeoJSONPolygon): L.LatLngBounds => {
    const coordinates = polygon.coordinates[0];
    const latLngs = coordinates.map(([lng, lat]) => L.latLng(lat, lng));
    return L.latLngBounds(latLngs);
  };

  // Set bounds based on visible polygons
  if (beatPolygon?.polygon) {
    bounds = getPolygonBounds(beatPolygon.polygon);
  } else if (rangePolygon?.polygon) {
    bounds = getPolygonBounds(rangePolygon.polygon);
  } else if (divisionPolygon?.polygon) {
    bounds = getPolygonBounds(divisionPolygon.polygon);
  }

  // If bounds are set, calculate center
  if (bounds) {
    center = [bounds.getCenter().lat, bounds.getCenter().lng];
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            />
          </LayersControl.BaseLayer>

          {divisionPolygon && (
            <LayersControl.Overlay checked name="Division Boundary">
          <Polygon
                positions={divisionPolygon.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.1,
              weight: 2
            }}
          >
            <Popup>
                  <div className="space-y-2">
                <h3 className="font-bold">Division</h3>
                <p>{divisionPolygon.name}</p>
                {divisionPolygon.stats && (
                  <div className="space-y-1">
                    <Badge variant="secondary">Total: {divisionPolygon.stats.total}</Badge>
                    <Badge variant="secondary">Direct: {divisionPolygon.stats.direct}</Badge>
                    <Badge variant="secondary">Indirect: {divisionPolygon.stats.indirect}</Badge>
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
            </LayersControl.Overlay>
        )}

          {rangePolygon && (
            <LayersControl.Overlay checked name="Range Boundary">
          <Polygon
                positions={rangePolygon.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: '#16a34a',
              fillColor: '#16a34a',
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>
                  <div className="space-y-2">
                <h3 className="font-bold">Range</h3>
                <p>{rangePolygon.name}</p>
                    {rangePolygon.parent_name && (
                      <Badge variant="outline">Division: {rangePolygon.parent_name}</Badge>
                )}
              </div>
            </Popup>
          </Polygon>
            </LayersControl.Overlay>
        )}

          {beatPolygon && (
            <LayersControl.Overlay checked name="Beat Boundary">
          <Polygon
                positions={beatPolygon.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: '#dc2626',
              fillColor: '#dc2626',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
                  <div className="space-y-2">
                <h3 className="font-bold">Beat</h3>
                <p>{beatPolygon.name}</p>
                    {beatPolygon.parent_name && (
                      <Badge variant="outline">Range: {beatPolygon.parent_name}</Badge>
                )}
              </div>
            </Popup>
          </Polygon>
            </LayersControl.Overlay>
        )}

          <LayersControl.Overlay checked={showSightings} name="Elephant Sightings">
            <LayerGroup>
              {elephantSightings.map((sighting) => (
                <Marker
                  key={sighting.id}
                  position={[Number(sighting.latitude), Number(sighting.longitude)]}
                  icon={elephantIcon}
                >
                  <Popup>
                    <div className="space-y-2">
                      <h3 className="font-bold">Elephant Observation</h3>
                      <p>Date: {new Date(sighting.activity_date).toLocaleDateString()}</p>
                      <p>Time: {sighting.activity_time}</p>
                      <Badge variant={sighting.observation_type === 'direct' ? 'default' : 'secondary'}>
                        {sighting.observation_type === 'direct' ? 'Direct Observation' : 'Indirect Observation'}
                      </Badge>
                      {sighting.total_elephants > 0 && (
                        <div className="space-y-1">
                          <p>Total Elephants: {sighting.total_elephants}</p>
                          {sighting.male_elephants > 0 && <p>Males: {sighting.male_elephants}</p>}
                          {sighting.female_elephants > 0 && <p>Females: {sighting.female_elephants}</p>}
                          {sighting.unknown_elephants > 0 && <p>Unknown: {sighting.unknown_elephants}</p>}
                          {sighting.calves > 0 && <p>Calves: {sighting.calves}</p>}
                        </div>
                      )}
                      {sighting.indirect_sighting_type && (
                        <p>Type: {sighting.indirect_sighting_type}</p>
                      )}
                      {sighting.loss_type && (
                        <p>Loss Type: {sighting.loss_type}</p>
                      )}
                      {sighting.photo_url && (
                        <img 
                          src={sighting.photo_url} 
                          alt="Observation photo" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      <div className="text-sm text-muted-foreground">
                        <p>Beat: {sighting.associated_beat}</p>
                        <p>Range: {sighting.associated_range}</p>
                        <p>Division: {sighting.associated_division}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <MapZoomHandler onZoomChange={setZoomLevel} />
      </MapContainer>
    </div>
  );
} 