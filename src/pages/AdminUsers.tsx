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

interface Division {
  id: string;
  name: string;
}

interface Range {
  new_id: string;
  name: string;
  new_division_id: string;
}

// All user_id references in this file must be public.users.id, not the auth UID. If setting user_id, look up by auth_id.

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<ExtendedUser | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
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
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setDivisions(data || []);
    } catch (error: any) {
      toast.error('Error fetching divisions: ' + error.message);
    }
  };

  const fetchRanges = async (divisionId: string) => {
    try {
      console.log('Fetching ranges for division:', divisionId); // Debug log
      
      // Now fetch the ranges
      const { data, error } = await supabase
        .from('ranges')
        .select('new_id, name, new_division_id')
        .eq('new_division_id', divisionId)
        .order('name');

      if (error) {
        console.error('Error fetching ranges:', error);
        throw error;
      }
      
      console.log('Fetched ranges:', data); // Debug log
      setRanges(data || []);
    } catch (error: any) {
      console.error('Error in fetchRanges:', error);
      toast.error('Error fetching ranges: ' + error.message);
    }
  };

  const handleDivisionChange = async (value: string) => {
    console.log('Division changed to:', value); // Debug log
    setSelectedDivision(value === 'none' ? null : value);
    setSelectedRange(null);
    if (value && value !== 'none') {
      await fetchRanges(value);
    } else {
      setRanges([]);
    }
  };

  const handleRangeChange = (value: string) => {
    console.log('Range selected:', value); // Debug log
    const newValue = value === 'none' ? null : value;
    console.log('Setting selectedRange to:', newValue); // Debug log
    setSelectedRange(newValue);
  };

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

      // Validate region assignments based on position
      if (newUser.position === 'Ranger' && (!selectedDivision || !selectedRange)) {
        toast.error('Rangers must be assigned to both a division and a range');
        return;
      }
      if (newUser.position === 'DFO' && !selectedDivision) {
        toast.error('DFOs must be assigned to a division');
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
          id: authData.user.id,
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

      if (!profileData || !profileData.id) {
        throw new Error('Failed to create user profile - no ID returned');
      }

      // Create region assignment if needed
      if (selectedDivision) {
        // Find the selected range object to verify we have the correct ID
        console.log('Available ranges:', ranges); // Debug log
        console.log('Selected range value:', selectedRange); // Debug log
        
        const selectedRangeObj = ranges.find(r => r.new_id === selectedRange);
        console.log('Found range object:', selectedRangeObj); // Debug log

        if (newUser.position === 'Ranger' && !selectedRangeObj) {
          throw new Error(`Invalid range ID: ${selectedRange}. Available ranges: ${ranges.map(r => `${r.name} (${r.new_id})`).join(', ')}`);
        }

        console.log('Creating region assignment with:', {
          user_id: profileData.id,
          division_id: selectedDivision,
          range_id: newUser.position === 'Ranger' ? selectedRangeObj?.new_id : null,
          selectedRange,
          selectedRangeObj
        });

        try {
          const { data: regionData, error: regionError } = await adminClient
            .from('user_region_assignments')
            .insert({
              user_id: profileData.id,
              division_id: selectedDivision,
              range_id: newUser.position === 'Ranger' ? selectedRangeObj?.new_id : null,
              start_date: new Date().toISOString()
            })
            .select()
            .single();

          if (regionError) {
            console.error('Error creating region assignment:', regionError);
            // If the error is due to validation, show a more specific message
            if (regionError.message?.includes('must be assigned')) {
              toast.error(`Region assignment failed: ${regionError.message}`);
            } else {
              toast.warning('User created but region assignment failed');
            }
          } else {
            console.log('Region assignment created successfully:', regionData);
          }
        } catch (error: any) {
          console.error('Exception creating region assignment:', error);
          toast.warning('User created but region assignment failed');
        }
      } else {
        console.log('No division selected, skipping region assignment');
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
      setSelectedDivision(null);
      setSelectedRange(null);
      
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
      // First delete the region assignments
      const { error: regionError } = await adminClient
        .from('user_region_assignments')
        .delete()
        .eq('user_id', user.id);

      if (regionError) {
        console.error('Error deleting region assignments:', regionError);
        toast.error('Error deleting region assignments: ' + regionError.message);
        return;
      }

      // Then delete from the users table
      const { error: profileError } = await adminClient
        .from('users')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        toast.error('Error deleting user profile: ' + profileError.message);
        return;
      }

      // Finally try to delete from Auth
      try {
        const { error: authError } = await adminClient.auth.admin.deleteUser(user.auth_id);
        if (authError) {
          console.warn('Warning: Could not delete auth user:', authError);
          // Don't throw here, as the user is already deleted from the database
        }
      } catch (authError: any) {
        console.warn('Warning: Exception deleting auth user:', authError);
        // Don't throw here, as the user is already deleted from the database
      }

      toast.success('User and associated data deleted successfully');
      await fetchUsers();
    } catch (error: any) {
      console.error('Error in delete process:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="container mx-auto p-2 sm:p-4">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "User Management" }
          ]}
        />
        <Card className="border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">User Management</CardTitle>
            {canCreateUserWithRole('data_collector') && (
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-sm"
              >
                Add User
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">Name</TableHead>
                  <TableHead className="text-blue-900">Email</TableHead>
                  <TableHead className="text-blue-900">Phone</TableHead>
                  <TableHead className="text-blue-900">Position</TableHead>
                  <TableHead className="text-blue-900">Role</TableHead>
                  <TableHead className="text-blue-900">Status</TableHead>
                  <TableHead className="text-blue-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors">
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
                          className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="bg-red-500 hover:bg-red-600"
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl border border-blue-100">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {editUser ? "Edit User" : "Add User"}
              </h2>
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
              } : handleCreateUser} className="grid grid-cols-2 gap-8">
                {/* Left Column - Form Entries */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <Input 
                      placeholder="First Name"
                      value={editUser?.first_name || newUser.first_name}
                      onChange={(e) => editUser 
                        ? setEditUser({ ...editUser, first_name: e.target.value })
                        : setNewUser({ ...newUser, first_name: e.target.value })
                      }
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Input 
                      placeholder="Last Name"
                      value={editUser?.last_name || newUser.last_name}
                      onChange={(e) => editUser
                        ? setEditUser({ ...editUser, last_name: e.target.value })
                        : setNewUser({ ...newUser, last_name: e.target.value })
                      }
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Input 
                      type="email"
                      placeholder="Email"
                      value={editUser?.email || newUser.email}
                      onChange={(e) => editUser
                        ? setEditUser({ ...editUser, email: e.target.value })
                        : setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Input 
                      placeholder="Phone"
                      value={editUser?.phone || newUser.phone}
                      onChange={(e) => editUser
                        ? setEditUser({ ...editUser, phone: e.target.value })
                        : setNewUser({ ...newUser, phone: e.target.value })
                      }
                      className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {!editUser && (
                      <Input 
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Right Column - Dropdowns */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Role & Assignment</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-900">Position</label>
                      <select
                        className="w-full p-2 border border-blue-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        value={editUser?.position || newUser.position}
                        onChange={(e) => {
                          const value = e.target.value as "Ranger" | "DFO" | "Officer" | "Guard";
                          if (editUser) {
                            setEditUser({ ...editUser, position: value });
                          } else {
                            setNewUser({ ...newUser, position: value });
                            setSelectedDivision(null);
                            setSelectedRange(null);
                          }
                        }}
                      >
                        <option value="Ranger">Ranger</option>
                        <option value="DFO">DFO</option>
                        <option value="Officer">Officer</option>
                        <option value="Guard">Guard</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-900">Role</label>
                      <select
                        className="w-full p-2 border border-blue-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        value={editUser?.role || newUser.role}
                        onChange={(e) => {
                          const value = e.target.value as UserRole;
                          if (editUser) {
                            setEditUser({ ...editUser, role: value });
                          } else {
                            setNewUser({ ...newUser, role: value });
                          }
                        }}
                      >
                        {user?.role === 'admin' && (
                          <option value="admin">Admin</option>
                        )}
                        {user?.role === 'admin' && (
                          <option value="manager">Manager</option>
                        )}
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                          <option value="data_collector">Data Collector</option>
                        )}
                      </select>
                    </div>

                    {/* Region Assignment Section */}
                    {(newUser.position === 'Ranger' || newUser.position === 'DFO') && (
                      <div className="space-y-4 pt-4 border-t border-blue-100">
                        <h4 className="text-sm font-medium text-blue-900">Region Assignment</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-blue-900">Division</label>
                          <div className="relative">
                            <select
                              className="w-full p-2 border border-blue-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
                              value={selectedDivision || "none"}
                              onChange={(e) => handleDivisionChange(e.target.value)}
                            >
                              <option value="none">Select a division</option>
                              {divisions.map((division) => (
                                <option key={division.id} value={division.id}>
                                  {division.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {newUser.position === 'Ranger' && selectedDivision && selectedDivision !== 'none' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-900">Range</label>
                            <div className="relative">
                              <select
                                className="w-full p-2 border border-blue-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                value={selectedRange || "none"}
                                onChange={(e) => handleRangeChange(e.target.value)}
                              >
                                <option value="none">Select a range</option>
                                {ranges.map((range) => (
                                  <option key={range.new_id} value={range.new_id}>
                                    {range.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="col-span-2 flex justify-end gap-2 mt-6 pt-6 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleModalClose}
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-sm"
                  >
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