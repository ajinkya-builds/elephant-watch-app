import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

// Dummy user data
const dummyUsers = [
  { id: 1, email: "admin@example.com", role: "admin", status: "active" },
  { id: 2, email: "user1@example.com", role: "user", status: "active" },
  { id: 3, email: "mod@example.com", role: "moderator", status: "inactive" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(dummyUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const navigate = useNavigate();

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

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
            <li className="text-gray-600">User Management</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">User Management</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <Card className="mb-0 border-none shadow-none">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
              <CardTitle className="text-xl">Users</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={() => { setEditUser(null); setShowModal(true); }}>
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} disabled>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={user.status === "active" ? "text-green-600" : "text-gray-400"}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="mr-2" onClick={() => { setEditUser(user); setShowModal(true); }}>Edit</Button>
                          <Button size="sm" variant="destructive">{user.status === "active" ? "Deactivate" : "Activate"}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal for Add/Edit User (UI only) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editUser ? "Edit User" : "Add User"}</h2>
              <form className="space-y-4">
                <Input placeholder="Email" defaultValue={editUser?.email || ""} disabled={!!editUser} />
                <Select defaultValue={editUser?.role || "user"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={editUser?.status || "active"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
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