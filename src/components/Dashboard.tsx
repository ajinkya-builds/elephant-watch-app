import React, { useState, useEffect } from 'react';
import { BeatMap } from './BeatMap';
import { supabase } from '@/lib/supabaseClient';

interface FilterOption {
  id: string;
  name: string;
}

export function Dashboard() {
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [selectedBeat, setSelectedBeat] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch all divisions
  useEffect(() => {
    async function fetchDivisions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisions')
        .select('did, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching divisions:', error);
        return;
      }
      
      console.log('Fetched divisions:', data);
      const transformedData = data?.map(division => ({
        id: division.did,
        name: division.name
      })) || [];
      setDivisions(transformedData);
      setLoading(false);
    }
    
    fetchDivisions();
  }, []);

  // Fetch ranges for selected division
  useEffect(() => {
    async function fetchRanges() {
      if (!selectedDivision) {
        setRanges([]);
        setBeats([]);
        setSelectedRange('');
        setSelectedBeat('');
        return;
      }

      setLoading(true);
      console.log('Fetching ranges for division:', selectedDivision);
      
<<<<<<< HEAD
      try {
        const { data, error } = await supabase
          .from('ranges')
          .select('did, name')
          .eq('did', selectedDivision)
          .order('name');
        
        if (error) {
          console.error('Error fetching ranges:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          return;
        }
        
        console.log('Raw ranges data:', data);
        const transformedData = data?.map(range => ({
          id: range.did,
          name: range.name
        })) || [];
        setRanges(transformedData);
        setBeats([]);
        setSelectedRange('');
        setSelectedBeat('');
      } catch (err) {
        console.error('Unexpected error in fetchRanges:', err);
      } finally {
        setLoading(false);
=======
      const { data, error } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          associated_division_id
        `)
        .eq('associated_division_id', selectedDivision)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
>>>>>>> 2f6bd8fcab214df0f722880eaa8ca399a693b837
      }
    }
    
    fetchRanges();
  }, [selectedDivision]);

  // Fetch beats for selected range
  useEffect(() => {
    async function fetchBeats() {
      if (!selectedRange || !selectedDivision) {
        setBeats([]);
        setSelectedBeat('');
        return;
      }

      setLoading(true);
      console.log('Fetching beats for range:', selectedRange);
      
<<<<<<< HEAD
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('new_id, name')
          .eq('new_range_id', selectedRange)
          .order('name');
        
        if (error) {
          console.error('Error fetching beats:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          return;
        }
        
        console.log('Raw beats data:', data);
        const transformedData = data?.map(beat => ({
          id: beat.new_id,
          name: beat.name
        })) || [];
        setBeats(transformedData);
        setSelectedBeat('');
      } catch (err) {
        console.error('Unexpected error in fetchBeats:', err);
      } finally {
        setLoading(false);
=======
      // First, let's check if we can get any beats at all
      const { data: allBeats, error: allBeatsError } = await supabase
        .from('beats')
        .select('*')
        .limit(5);
      
      console.log('Sample of all beats:', allBeats);

      // Now fetch beats for the selected range and division
      const { data, error } = await supabase
        .from('beats')
        .select(`
          id,
          name,
          associated_range_id,
          associated_division_id
        `)
        .eq('associated_range_id', selectedRange)
        .eq('associated_division_id', selectedDivision)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
>>>>>>> 2f6bd8fcab214df0f722880eaa8ca399a693b837
      }
    }
    
    fetchBeats();
  }, [selectedRange, selectedDivision]);

  // Handle division selection
  const handleDivisionChange = (divisionId: string) => {
    console.log('Selected division:', divisionId);
    setSelectedDivision(divisionId);
    setSelectedRange('');
    setSelectedBeat('');
  };

  // Handle range selection
  const handleRangeChange = (rangeId: string) => {
    console.log('Selected range:', rangeId);
    setSelectedRange(rangeId);
    setSelectedBeat('');
  };

  // Handle beat selection
  const handleBeatChange = (beatId: string) => {
    console.log('Selected beat:', beatId);
    setSelectedBeat(beatId);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Forest Beat Dashboard</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Division</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Range</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              disabled={!selectedDivision || loading}
            >
              <option value="">Select Range</option>
              {ranges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Beat</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedBeat}
              onChange={(e) => handleBeatChange(e.target.value)}
              disabled={!selectedRange || loading}
            >
              <option value="">Select Beat</option>
              {beats.map((beat) => (
                <option key={beat.id} value={beat.id}>
                  {beat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <p>Selected Division: {selectedDivision}</p>
          <p>Selected Range: {selectedRange}</p>
          <p>Number of Ranges: {ranges.length}</p>
          <p>Number of Beats: {beats.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="h-[600px] w-full">
            <BeatMap
              selectedBeat={selectedBeat}
              selectedRange={selectedRange}
              selectedDivision={selectedDivision}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 