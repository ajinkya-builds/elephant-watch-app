import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/NewAuthContext';
import { Breadcrumb } from "@/components/Breadcrumb";
import { supabase } from '@/lib/supabaseClient';

// Types
type UserRole = 'admin' | 'manager' | 'data_collector' | 'viewer';
type UserPosition = 'Ranger' | 'DFO' | 'Officer' | 'Guard' | 'Manager' | 'Admin';

interface User {
  id: string;
  auth_id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  role: UserRole;
  position: UserPosition;
  is_active: boolean;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface ExtendedUser extends User {
  divisions?: Array<{ id: string; name: string }>;
  ranges?: Array<{ id: string; name: string }>;
  beats?: Array<{ id: string; name: string }>;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: 'data_collector' as UserRole,
    position: 'Ranger' as UserPosition,
  });
  
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-users', {
        method: 'GET'
      });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
          position: newUser.position,
        },
      };
      const assignments = {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
        status: 'active',
        created_by: user?.id,
      };

      const { error } = await supabase.functions.invoke('create-user', {
        body: { userData, assignments },
      });

      if (error) throw error;
      toast.success('User created successfully');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Error creating user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: ExtendedUser) => {
    if (!window.confirm(`Are you sure you want to delete ${userToDelete.first_name}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: userToDelete.id, authId: userToDelete.auth_id },
      });
      if (error) throw error;
      toast.success('User deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error(`Error deleting user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <>
      <Breadcrumb items={[{ label: "Admin" }, { label: "User Management" }]} />
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex items-center gap-4">
              <Input
              placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
              />
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.first_name} {u.last_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge>{u.role}</Badge></TableCell>
                  <TableCell>{u.position}</TableCell>
                    <TableCell>
                    <Badge variant={u.status === 'active' ? 'default' : 'destructive'}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" disabled>
                      <Pencil className="h-4 w-4" />
                        </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(u)}>
                      <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input placeholder="First Name" onChange={(e) => setNewUser(p => ({...p, first_name: e.target.value}))} required />
                <Input placeholder="Last Name" onChange={(e) => setNewUser(p => ({...p, last_name: e.target.value}))} required />
                <Input type="email" placeholder="Email" onChange={(e) => setNewUser(p => ({...p, email: e.target.value}))} required />
                <Input type="password" placeholder="Password" onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))} required />
                {/* Add selects for role and position if needed */}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        )}
    </>
  );
} 