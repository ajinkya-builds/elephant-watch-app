import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

// Dummy observation data
const dummyObservations = [
  {
    id: 1,
    username: "admin@example.com",
    timestamp: "2024-06-01 10:30:00",
    data: {
      activity: "Elephant sighted near river",
      location: "Zone A",
      elephants: 3,
      notes: "All healthy."
    }
  },
  {
    id: 2,
    username: "user1@example.com",
    timestamp: "2024-06-02 14:15:00",
    data: {
      activity: "Crop damage reported",
      location: "Village B",
      elephants: 0,
      notes: "Significant crop loss."
    }
  },
];

export default function AdminObservations() {
  const [observations, setObservations] = useState(dummyObservations);
  const [viewObs, setViewObs] = useState(null);
  const [editObs, setEditObs] = useState(null);
  const navigate = useNavigate();

  const handleDelete = (id) => {
    setObservations(observations.filter(obs => obs.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <button
                className="hover:underline text-green-800 font-medium"
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </button>
            </li>
            <li>
              <span className="mx-1">/</span>
            </li>
            <li className="text-gray-600">Observation & Report Management</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Observation & Report Management</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <Card className="mb-0 border-none shadow-none">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
              <CardTitle className="text-xl">User-Submitted Reports</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.map(obs => (
                      <TableRow key={obs.id}>
                        <TableCell>{obs.username}</TableCell>
                        <TableCell>{obs.timestamp}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="mr-2" onClick={() => setViewObs(obs)}>View</Button>
                          <Button size="sm" variant="outline" className="mr-2" onClick={() => setEditObs(obs)}>Rectify</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(obs.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Modal */}
        {viewObs && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">View Report</h2>
              <div className="mb-4">
                <div><b>Username:</b> {viewObs.username}</div>
                <div><b>Timestamp:</b> {viewObs.timestamp}</div>
                <div className="mt-2">
                  <b>Data:</b>
                  <pre className="bg-gray-100 rounded p-2 mt-1 text-sm overflow-x-auto">{JSON.stringify(viewObs.data, null, 2)}</pre>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewObs(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Rectify Modal (UI only) */}
        {editObs && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Rectify Report</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Activity</label>
                  <input className="w-full border rounded px-3 py-2" defaultValue={editObs.data.activity} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input className="w-full border rounded px-3 py-2" defaultValue={editObs.data.location} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Elephants</label>
                  <input className="w-full border rounded px-3 py-2" type="number" defaultValue={editObs.data.elephants} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea className="w-full border rounded px-3 py-2" defaultValue={editObs.data.notes} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditObs(null)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 