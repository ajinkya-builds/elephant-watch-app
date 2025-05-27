import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { importShapefile } from '../lib/utils/shapefileImporter';
import { toast } from 'react-hot-toast';

interface BeatPolygon {
  id: number;
  beat_name: string;
  range_name: string;
  division_name: string;
  created_at: string;
  updated_at: string;
}

export default function AdminBeatPolygons() {
  const [polygons, setPolygons] = useState<BeatPolygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [divisionName, setDivisionName] = useState('');
  const [rangeName, setRangeName] = useState('');

  useEffect(() => {
    fetchPolygons();
  }, []);

  async function fetchPolygons() {
    try {
      const { data, error } = await supabase
        .from('beat_polygons')
        .select('*')
        .order('division_name, range_name, beat_name');

      if (error) throw error;
      setPolygons(data || []);
    } catch (error: any) {
      console.error('Error fetching polygons:', error);
      toast.error('Failed to fetch beat polygons');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile || !divisionName || !rangeName) {
      toast.error('Please select a file, division, and range');
      return;
    }

    try {
      setLoading(true);
      await importShapefile(selectedFile, divisionName, rangeName);
      toast.success('Shapefile imported successfully');
      await fetchPolygons();
      setSelectedFile(null);
      setDivisionName('');
      setRangeName('');
    } catch (error: any) {
      console.error('Error importing shapefile:', error);
      toast.error(`Failed to import shapefile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Beat Polygons</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Import Shapefile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division Name
            </label>
            <input
              type="text"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter division name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Range Name
            </label>
            <input
              type="text"
              value={rangeName}
              onChange={(e) => setRangeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter range name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shapefile
            </label>
            <input
              type="file"
              accept=".shp,.shx,.dbf,.prj"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          <button
            onClick={handleFileUpload}
            disabled={loading || !selectedFile || !divisionName || !rangeName}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Shapefile'}
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">Beat Polygons</h2>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : polygons.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No beat polygons found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {polygons.map((polygon) => (
                  <tr key={polygon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{polygon.division_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{polygon.range_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{polygon.beat_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(polygon.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 