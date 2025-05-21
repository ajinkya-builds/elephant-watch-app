import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import { supabase } from "@/lib/supabaseClient";
import "leaflet/dist/leaflet.css";

function FitBounds({ polygon }: { polygon: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (polygon && polygon.length > 2) {
      map.fitBounds(polygon);
    }
  }, [polygon, map]);
  return null;
}

function isValidGeoJSONPolygon(polygon: any): boolean {
  return (
    polygon &&
    polygon.type === "Polygon" &&
    Array.isArray(polygon.coordinates) &&
    Array.isArray(polygon.coordinates[0]) &&
    polygon.coordinates[0].length > 2
  );
}

export function BeatMap2D() {
  const [polygon, setPolygon] = useState<[number, number][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("BeatMap2D component mounted");
    async function fetchPolygon() {
      try {
        setLoading(true);
        console.log("Starting to fetch first polygon from Supabase...");
        const { data, error } = await supabase
          .from("beat_polygons")
          .select("polygon")
          .limit(1)
          .single();
        console.log("Raw Supabase response:", { data, error });
        if (error) {
          console.error("Supabase error:", error);
          setError(error.message);
          return;
        }
        if (!data) {
          console.error("No data received from Supabase");
          setError("No data received");
          return;
        }
        if (!data.polygon) {
          console.error("No polygon in data:", data);
          setError("No polygon data found");
          return;
        }
        if (!isValidGeoJSONPolygon(data.polygon)) {
          setError("Invalid GeoJSON structure");
          return;
        }
        const coords = data.polygon.coordinates[0];
        const processedCoords = coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
        setPolygon(processedCoords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchPolygon();
  }, []);

  const center: [number, number] = polygon ? polygon[0] : [20, 78];

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading polygon data...</div>;
  }
  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }
  if (!polygon) {
    return <div style={{ padding: '20px' }}>No polygon data available</div>;
  }

  return (
    <div className="h-[500px] w-full">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polygon positions={polygon} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }}>
          <Popup>First Beat Polygon</Popup>
        </Polygon>
        <FitBounds polygon={polygon} />
      </MapContainer>
    </div>
  );
} 