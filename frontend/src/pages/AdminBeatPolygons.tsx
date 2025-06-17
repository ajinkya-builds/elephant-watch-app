import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as shapefile from 'shapefile';

interface BeatPolygon {
  id: string;
  beat_name: string;
  range_name: string;
  division_name: string;
  geometry: any;
  created_at: string;
  updated_at: string;
}

export default function AdminBeatPolygons() {
  const [polygons, setPolygons] = useState<BeatPolygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [divisionName, setDivisionName] = useState('');
  const [rangeName, setRangeName] = useState('');

  useEffect(() => {
    fetchPolygons();
  }, []);

  const fetchPolygons = async () => {
    try {
      const { data, error } = await supabase
        .from('beat_polygons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolygons((data || []) as unknown as BeatPolygon[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch polygons');
    } finally {
      setLoading(false);
    }
  };

  const importShapefile = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result;
        if (!buffer) throw new Error('Failed to read file');

        const shape = await shapefile.open(buffer);
        const features: any[] = [];
        let result;
        while (!(result = await shape.read()).done) {
          features.push(result.value);
        }
        const polygons = features.map((feature: any) => ({
          beat_name: feature.properties.NAME || feature.properties.BEAT_NAME,
          range_name: rangeName,
          division_name: divisionName,
          geometry: feature.geometry
        }));

        const { error } = await supabase
          .from('beat_polygons')
          .insert(polygons);

        if (error) throw error;
        await fetchPolygons();
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import shapefile');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a shapefile');
      return;
    }
    if (!divisionName || !rangeName) {
      setError('Please enter division and range names');
      return;
    }
    await importShapefile(selectedFile);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Beat Polygons</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Import Shapefile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="shapefile">Shapefile</Label>
            <Input
              id="shapefile"
              type="file"
              accept=".shp,.dbf"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <Label htmlFor="division">Division Name</Label>
            <Input
              id="division"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              placeholder="Enter division name"
            />
          </div>
          <div>
            <Label htmlFor="range">Range Name</Label>
            <Input
              id="range"
              value={rangeName}
              onChange={(e) => setRangeName(e.target.value)}
              placeholder="Enter range name"
            />
          </div>
        </div>
        <Button
          onClick={handleImport}
          disabled={!selectedFile || !divisionName || !rangeName}
          className="mt-4"
        >
          Import
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Polygons</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beat Name</TableHead>
              <TableHead>Range Name</TableHead>
              <TableHead>Division Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polygons.map((polygon) => (
              <TableRow key={polygon.id}>
                <TableCell>{polygon.beat_name}</TableCell>
                <TableCell>{polygon.range_name}</TableCell>
                <TableCell>{polygon.division_name}</TableCell>
                <TableCell>{new Date(polygon.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(polygon.updated_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 