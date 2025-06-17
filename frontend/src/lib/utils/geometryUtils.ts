import { Feature, Polygon } from 'geojson';

/**
 * Converts an EWKB hex string or GeoJSON to GeoJSON format
 * @param data EWKB hex string or GeoJSON object
 * @returns GeoJSON Feature object
 */
export function ewkbHexToGeoJSON(data: string | any): Feature<Polygon> {
  // If it's already a GeoJSON object, return it as a Feature
  if (typeof data === 'object' && data !== null) {
    if (data.type === 'Feature') {
      return data as Feature<Polygon>;
    }
    if (data.type === 'Polygon') {
      return {
        type: 'Feature',
        geometry: data,
        properties: {}
      };
    }
    if (data.geometry && data.geometry.type === 'Polygon') {
      return {
        type: 'Feature',
        geometry: data.geometry,
        properties: data.properties || {}
      };
    }
  }

  // If it's a string, try to parse it as EWKB hex
  if (typeof data === 'string') {
    try {
      // Remove the SRID prefix if present (first 18 characters)
      const hexWithoutSRID = data.slice(18);
      
      // Convert hex to binary
      const binary = hexToBinary(hexWithoutSRID);
      
      // Parse the binary data
      const coordinates = parseEWKBPolygon(binary);
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {}
      };
    } catch (error) {
      console.error('Error parsing EWKB hex:', error);
      throw new Error('Invalid EWKB hex string');
    }
  }

  throw new Error('Invalid polygon data format');
}

/**
 * Converts a hex string to binary array
 */
function hexToBinary(hex: string): number[] {
  const binary: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    binary.push(parseInt(hex.substr(i, 2), 16));
  }
  return binary;
}

/**
 * Parses EWKB binary data for a polygon
 */
function parseEWKBPolygon(binary: number[]): number[][] {
  // Skip the byte order and geometry type (first 5 bytes)
  let offset = 5;
  
  // Read number of rings
  const numRings = readInt32(binary, offset);
  offset += 4;
  
  // Read the outer ring
  const outerRing: number[][] = [];
  const numPoints = readInt32(binary, offset);
  offset += 4;
  
  for (let i = 0; i < numPoints; i++) {
    const x = readDouble(binary, offset);
    offset += 8;
    const y = readDouble(binary, offset);
    offset += 8;
    outerRing.push([x, y]);
  }
  
  return outerRing;
}

/**
 * Reads a 32-bit integer from the binary array
 */
function readInt32(binary: number[], offset: number): number {
  return (
    (binary[offset] << 0) |
    (binary[offset + 1] << 8) |
    (binary[offset + 2] << 16) |
    (binary[offset + 3] << 24)
  );
}

/**
 * Reads a 64-bit double from the binary array
 */
function readDouble(binary: number[], offset: number): number {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  
  // Copy bytes to buffer
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, binary[offset + i]);
  }
  
  return view.getFloat64(0, true); // true for little-endian
}

/**
 * Converts a GeoJSON Feature to WKT format
 * @param geojson GeoJSON Feature object
 * @returns WKT polygon string
 */
export function geoJSONToWKT(geojson: Feature<Polygon>): string {
  if (geojson.geometry.type !== 'Polygon') {
    throw new Error('Only Polygon geometry type is supported');
  }

  const coords = geojson.geometry.coordinates[0]
    .map(coord => `${coord[0]} ${coord[1]}`)
    .join(', ');

  return `POLYGON((${coords}))`;
} 