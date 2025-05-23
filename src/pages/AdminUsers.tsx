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
import { Breadcrumb } from "@/components/Breadcrumb";

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

// All user_id references in this file must be public.users.id, not the auth UID. If setting user_id, look up by auth_id.

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
          status: 'active',
          created_by: user?.id
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

  const handleDeleteUser = async (user: ExtendedUser) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Try to delete from Auth
      const { error: authError } = await adminClient.auth.admin.deleteUser(user.auth_id);

      // If the error is not a 404 (user not found) or 500 (internal error), throw it
      if (authError && !authError.message?.includes('User not found') && !authError.message?.includes('500')) throw authError;

      // Always try to delete from the users table
      const { error: profileError } = await adminClient
        .from('users')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      // Update the user profile in your DB
      const { error: profileError, data: updatedUser } = await adminClient
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('DB update error:', profileError);
        toast.error('Database error updating user: ' + (profileError.message || JSON.stringify(profileError)));
        return;
      }
      if (!updatedUser) {
        toast.error('No user found to update.');
        return;
      }

      // Prepare Auth update payload
      const authPayload: { email?: string; phone?: string } = {};
      if (updates.email && updates.email.trim() !== '') {
        authPayload.email = updates.email.trim();
      }
      if (updates.phone && updates.phone.trim() !== '') {
        authPayload.phone = updates.phone.trim();
      }

      let authUpdateFailed = false;
      // Only update Auth if we have something to update
      if (Object.keys(authPayload).length > 0 && updatedUser?.auth_id) {
        try {
          const { error: authError } = await adminClient.auth.admin.updateUserById(
            updatedUser.auth_id,
            authPayload
          );
          if (authError && !authError.message?.includes('User not found') && !authError.message?.includes('500')) throw authError;
          if (authError && (authError.message?.includes('User not found') || authError.message?.includes('500'))) {
            authUpdateFailed = true;
          }
        } catch (authError: any) {
          authUpdateFailed = true;
        }
      }

      if (authUpdateFailed) {
        toast.warning('User updated in database, but not found or not updated in Auth.');
      } else {
        toast.success('User updated successfully');
      }
      await fetchUsers();
      setEditUser(null);
      setShowModal(false);
    } catch (error: any) {
      toast.error('Error updating user: ' + (error.message || JSON.stringify(error)));
      console.error('Error updating user:', error);
    }
  };

  const handleEditUser = (user: ExtendedUser) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditUser(null);
    setNewUser({
      email: "",
      phone: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "data_collector",
      position: "Ranger"
    });
  };

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.last_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.phone || '').includes(search)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "User Management" }
        ]}
      />
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </div>
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
            <form onSubmit={editUser ? (e) => {
              e.preventDefault();
              handleUpdateUser(editUser.id, {
                first_name: editUser.first_name,
                last_name: editUser.last_name,
                email: editUser.email,
                phone: editUser.phone,
                role: editUser.role,
                position: editUser.position
              });
            } : handleCreateUser} className="space-y-4">
              <Input 
                placeholder="First Name"
                value={editUser?.first_name || newUser.first_name}
                onChange={(e) => editUser 
                  ? setEditUser({ ...editUser, first_name: e.target.value })
                  : setNewUser({ ...newUser, first_name: e.target.value })
                }
              />
              <Input 
                placeholder="Last Name"
                value={editUser?.last_name || newUser.last_name}
                onChange={(e) => editUser
                  ? setEditUser({ ...editUser, last_name: e.target.value })
                  : setNewUser({ ...newUser, last_name: e.target.value })
                }
              />
              <Input 
                type="email"
                placeholder="Email"
                value={editUser?.email || newUser.email}
                onChange={(e) => editUser
                  ? setEditUser({ ...editUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <Input 
                placeholder="Phone"
                value={editUser?.phone || newUser.phone}
                onChange={(e) => editUser
                  ? setEditUser({ ...editUser, phone: e.target.value })
                  : setNewUser({ ...newUser, phone: e.target.value })
                }
              />
              <Select 
                value={editUser?.position || newUser.position}
                onValueChange={(value: "Ranger" | "DFO" | "Officer" | "Guard") => editUser
                  ? setEditUser({ ...editUser, position: value })
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
                  ? setEditUser({ ...editUser, role: value })
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
                  onClick={handleModalClose}
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