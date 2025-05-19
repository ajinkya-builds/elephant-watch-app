import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, adminClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import bcrypt from 'bcryptjs';

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showOnlyCreated, setShowOnlyCreated] = useState(false);
  const [newUser, setNewUser] = useState({
    email_or_phone: "",
    role: "data_collector" as UserRole,
    password: ""
  });
  const navigate = useNavigate();
  const { user, canCreateUserWithRole } = useAuth();

  // Fetch users on component mount
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First, ensure we're using the admin client for this operation
      let query = adminClient
        .from('users')
        .select(`
          id,
          email_or_phone,
          role,
          status,
          created_at,
          updated_at,
          created_by,
          creator:created_by (
            id,
            email_or_phone,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // If showOnlyCreated is true, only show users created by the current user
      if (showOnlyCreated && user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('No data returned from users query');
        setUsers([]);
        return;
      }

      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.email_or_phone.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.creator?.email_or_phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!canCreateUserWithRole(newUser.role)) {
        toast.error('You do not have permission to create users with this role');
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email_or_phone', newUser.email_or_phone)
        .single();

      if (existingUser) {
        toast.error('A user with this email/phone already exists');
        return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newUser.password, salt);

      const now = new Date().toISOString();
      const { data, error } = await adminClient
        .from('users')
        .insert([{
          email_or_phone: newUser.email_or_phone,
          role: newUser.role,
          password_hash: passwordHash,
          status: 'active',
          created_at: now,
          updated_at: now,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('A user with this email/phone already exists');
        } else {
          throw error;
        }
        return;
      }

      // Log the user creation
      await adminClient.from('activity_logs').insert({
        user_id: user?.id,
        action: 'create_user',
        details: {
          created_user_id: data.id,
          created_user_role: data.role,
          created_user_email: data.email_or_phone
        },
        created_at: now
      });

      toast.success('User created successfully');
      setShowModal(false);
      setNewUser({
        email_or_phone: "",
        role: "data_collector" as UserRole,
        password: ""
      });
      
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      if (!canCreateUserWithRole(updates.role)) {
        toast.error('You do not have permission to update users with this role');
        return;
      }

      const now = new Date().toISOString();
      const { error } = await adminClient
        .from('users')
        .update({
          ...updates,
          updated_at: now
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
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
                <Button 
                  variant={showOnlyCreated ? "default" : "outline"}
                  onClick={() => {
                    setShowOnlyCreated(!showOnlyCreated);
                    fetchUsers();
                  }}
                >
                  {showOnlyCreated ? "Show All Users" : "Show My Users"}
                </Button>
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
                      <TableHead>Email/Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email_or_phone}</TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value) => handleUpdateUser(user.id, { role: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {canCreateUserWithRole('admin' as UserRole) && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                              {canCreateUserWithRole('manager' as UserRole) && (
                                <SelectItem value="manager">Manager</SelectItem>
                              )}
                              {canCreateUserWithRole('data_collector' as UserRole) && (
                                <SelectItem value="data_collector">Data Collector</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.creator ? (
                            <span className="text-sm text-gray-600">
                              {user.creator.email_or_phone}
                              <span className="text-xs text-gray-400 ml-1">
                                ({user.creator.role})
                              </span>
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mr-2" 
                            onClick={() => { setEditUser(user); setShowModal(true); }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editUser ? "Edit User" : "Add User"}</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input 
                  placeholder="Email or Phone" 
                  value={newUser.email_or_phone}
                  onChange={(e) => setNewUser({ ...newUser, email_or_phone: e.target.value })}
                  disabled={!!editUser} 
                />
                <Select 
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === 'admin' && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                    {user?.role === 'admin' && (
                      <SelectItem value="manager">Manager</SelectItem>
                    )}
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <SelectItem value="data_collector">Data Collector</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!editUser && (
                  <Input 
                    type="password"
                    placeholder="Password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 