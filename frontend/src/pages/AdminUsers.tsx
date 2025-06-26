import { useState, useEffect, useReducer, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, RotateCw, Search } from 'lucide-react';
import { useAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { applyThemeClasses } from "@/theme/AndroidThemeUtils";
import { cn } from "@/lib/utils";

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

type UsersState = {
  users: ExtendedUser[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
};

type UsersAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ExtendedUser[] }
  | { type: 'FETCH_ERROR'; error: string };

function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        users: action.payload,
        lastFetched: Date.now(),
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'viewer' as UserRole,
    position: 'Ranger' as UserPosition,
    password: '',
  });
  
  const { user } = useAuth();
  const { theme } = useAndroidTheme();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [usersState, dispatch] = useReducer(usersReducer, {
    users: [],
    loading: true,
    error: null,
    lastFetched: null,
  });

  // Apply Android theme styling
  const containerClasses = applyThemeClasses(theme, 'bg-background text-onBackground');
  const headerClasses = applyThemeClasses(theme, 'text-onSurface');
  const subtitleClasses = applyThemeClasses(theme, 'text-onSurfaceVariant');

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch({ type: 'FETCH_START' });
        
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        dispatch({ type: 'FETCH_SUCCESS', payload: users });
      } catch (error) {
        console.error('Error fetching users:', error);
        dispatch({ 
          type: 'FETCH_ERROR', 
          error: error instanceof Error ? error.message : 'Failed to fetch users' 
        });
      }
    };
    
    fetchUsers();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
          },
        },
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
      
      // Create user in database
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: authData.user.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
            position: newUser.position,
            is_active: true,
            status: 'active',
            created_by: user.id,
          },
        ]);
        
      if (dbError) throw dbError;
      
      // Refresh users list
      dispatch({ type: 'FETCH_START' });
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      dispatch({ type: 'FETCH_SUCCESS', payload: users });
      setShowModal(false);
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        role: 'viewer',
        position: 'Ranger',
        password: '',
      });
      
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete: ExtendedUser) => {
    if (!window.confirm(`Are you sure you want to delete ${userToDelete.first_name} ${userToDelete.last_name}?`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Delete user from Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.auth_id);
      if (authError) throw authError;
      
      // Delete user from database
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);
        
      if (dbError) throw dbError;
      
      // Update UI
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: usersState.users.filter(u => u.id !== userToDelete.id)
      });
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!search) return usersState.users;
    
    const searchTerm = search.toLowerCase();
    return usersState.users.filter(u => 
      u.first_name.toLowerCase().includes(searchTerm) ||
      u.last_name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm)
    );
  }, [usersState.users, search]);

  // Loading state
  if (usersState.loading && usersState.users.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen", containerClasses)}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (usersState.error) {
    return (
      <div className={cn("p-4", containerClasses)}>
        <div className={cn("border p-4 rounded-lg", applyThemeClasses(theme, 'bg-errorContainer text-onErrorContainer border-error'))}>
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Error: {usersState.error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("mt-2", applyThemeClasses(theme, 'text-onErrorContainer border-onErrorContainer hover:bg-error/10'))}
            onClick={() => window.location.reload()}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen p-6", containerClasses)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={cn(theme.typography.headlineLarge, headerClasses)}>
              User Management
            </h1>
            <p className={cn(theme.typography.bodyLarge, subtitleClasses)}>
              Manage application users and their permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-10 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  className="col-span-3"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  className="col-span-3"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="data_collector">Data Collector</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Position
                </Label>
                <Select
                  value={newUser.position}
                  onValueChange={(value) => setNewUser({...newUser, position: value as UserPosition})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="DFO">DFO</SelectItem>
                    <SelectItem value="Officer">Officer</SelectItem>
                    <SelectItem value="Ranger">Ranger</SelectItem>
                    <SelectItem value="Guard">Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
