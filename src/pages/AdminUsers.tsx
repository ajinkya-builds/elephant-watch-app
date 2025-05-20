import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";
import { UserRole, ExtendedUser } from "@/contexts/AuthContext";

// Create a service role client for admin operations
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<ExtendedUser | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    phone: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "data_collector" as UserRole,
    position: "Ranger" as "Ranger" | "DFO" | "Officer" | "Guard"
  });
  const navigate = useNavigate();
  const { user, canCreateUserWithRole } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(users as ExtendedUser[]);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!canCreateUserWithRole(newUser.role)) {
        toast.error('You do not have permission to create users with this role');
        return;
      }

      // First create the auth user using the admin client
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: newUser.email || undefined,
        phone: newUser.phone || undefined,
        password: newUser.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Then create the user profile using the admin client
      const { data: profileData, error: profileError } = await adminClient
        .from('users')
        .insert([{
          auth_id: authData.user.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          position: newUser.position,
          status: 'active'
        }])
        .select()
        .single();

      if (profileError) {
        // Rollback auth user creation if profile creation fails
        await adminClient.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      toast.success('User created successfully');
      setShowModal(false);
      setNewUser({
        email: "",
        phone: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "data_collector",
        position: "Ranger"
      });
      
      await fetchUsers();
    } catch (error: any) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      const { error } = await adminClient
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      toast.success('User updated successfully');
      await fetchUsers();
    } catch (error: any) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.last_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.phone || '').includes(search)
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          {canCreateUserWithRole('data_collector') && (
            <Button onClick={() => setShowModal(true)}>Add User</Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{user.position}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditUser(user);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input 
                placeholder="First Name"
                value={editUser?.first_name || newUser.first_name}
                onChange={(e) => editUser 
                  ? handleUpdateUser(editUser.id, { first_name: e.target.value })
                  : setNewUser({ ...newUser, first_name: e.target.value })
                }
              />
              <Input 
                placeholder="Last Name"
                value={editUser?.last_name || newUser.last_name}
                onChange={(e) => editUser
                  ? handleUpdateUser(editUser.id, { last_name: e.target.value })
                  : setNewUser({ ...newUser, last_name: e.target.value })
                }
              />
              <Input 
                type="email"
                placeholder="Email"
                value={editUser?.email || newUser.email}
                onChange={(e) => editUser
                  ? handleUpdateUser(editUser.id, { email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <Input 
                placeholder="Phone"
                value={editUser?.phone || newUser.phone}
                onChange={(e) => editUser
                  ? handleUpdateUser(editUser.id, { phone: e.target.value })
                  : setNewUser({ ...newUser, phone: e.target.value })
                }
              />
              <Select 
                value={editUser?.position || newUser.position}
                onValueChange={(value: "Ranger" | "DFO" | "Officer" | "Guard") => editUser
                  ? handleUpdateUser(editUser.id, { position: value })
                  : setNewUser({ ...newUser, position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ranger">Ranger</SelectItem>
                  <SelectItem value="DFO">DFO</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Guard">Guard</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={editUser?.role || newUser.role}
                onValueChange={(value: UserRole) => editUser
                  ? handleUpdateUser(editUser.id, { role: value })
                  : setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditUser(null);
                  }}
                >
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
  );
} 