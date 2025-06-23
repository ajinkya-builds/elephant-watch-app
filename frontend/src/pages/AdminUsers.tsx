import { useState, useEffect, useCallback, useReducer, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, RotateCw, Search } from 'lucide-react';
import { useAuth } from '@/contexts/NewAuthContext';
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

// Define types for our state
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

const usersReducer = (state: UsersState, action: UsersAction): UsersState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        users: action.payload,
        lastFetched: Date.now()
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [divisions, setDivisions] = useState<Array<{ id: string; name: string }>>([]);
  const [ranges, setRanges] = useState<Array<{ id: string; name: string }>>([]);
  const [beats, setBeats] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingRanges, setIsLoadingRanges] = useState(false);
  const [rangesError, setRangesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [usersState, dispatch] = useReducer(usersReducer, {
    users: [],
    loading: true,
    error: null,
    lastFetched: null
  });
  
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: 'data_collector' as UserRole,
    position: 'Ranger' as UserPosition,
    division_id: '',
    range_id: '',
    beat_id: '',
  });

  // Fetch divisions on modal open or when needed
  useEffect(() => {
    if (!showModal) return;
    
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchDivisions = async () => {
      try {
        const { data, error } = await supabase
          .from('divisions')
          .select('id, name')
          .order('name')
          .abortSignal(controller.signal);
        
        if (!isMounted) return;
        
        if (error) throw error;
        
        if (data) {
          setDivisions(data as unknown as Array<{id: string, name: string}>);
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.error('Error fetching divisions:', error);
          toast.error('Failed to load divisions');
        }
      }
    };
    
    // Add a small delay to prevent rapid successive calls
    const timer = setTimeout(fetchDivisions, 100);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [showModal]);

  // Fetch ranges when division changes (for Ranger/Guard)
  useEffect(() => {
    let isMounted = true;
    
    const shouldFetchRanges = showModal && 
                           newUser.division_id && 
                           ['Ranger', 'Guard'].includes(newUser.position);
    
    if (!shouldFetchRanges) {
      if (isMounted) {
        setRanges([]);
        setRangesError(null);
      }
      return;
    }
    
    async function fetchRanges() {
      if (!isMounted) return;
      
      setIsLoadingRanges(true);
      setRangesError(null);
      
      try {
        const { data, error } = await supabase
          .from('ranges')
          .select('new_id, name, new_division_id')
          .eq('new_division_id', newUser.division_id)
          .order('name');
        
        if (!isMounted) return;
        
        if (error) throw error;
        
        const typedData = data.map(item => ({
          id: item.new_id as string,
          name: item.name as string
        }));
        
        setRanges(typedData);
      } catch (error) {
        console.error('Error fetching ranges:', error);
        if (isMounted) {
          setRangesError('Failed to load ranges. Please try again.');
          toast.error('Failed to load ranges');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRanges(false);
        }
      }
    }
    
    // Add a small delay to prevent rapid successive calls
    const timer = setTimeout(fetchRanges, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [showModal, newUser.division_id, newUser.position]);

  // Fetch beats when range changes (for Guard)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const shouldFetchBeats = showModal && 
                           newUser.range_id && 
                           newUser.position === 'Guard';
    
    if (!shouldFetchBeats) {
      setBeats([]);
      return;
    }
    
    const fetchBeats = async () => {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('new_id, name, new_range_id, new_division_id')
          .eq('new_range_id', newUser.range_id)
          .eq('new_division_id', newUser.division_id)
          .order('name')
          .abortSignal(controller.signal);
        
        if (!isMounted) return;
        
        if (error) throw error;
        
        if (data) {
          const typedData = data.map(item => ({
            id: item.new_id as string,
            name: item.name as string
          }));
          setBeats(typedData);
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.error('Error fetching beats:', error);
          toast.error('Failed to load beats');
        }
      }
    };
    
    // Add a small delay to prevent rapid successive calls
    const timer = setTimeout(fetchBeats, 300);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [showModal, newUser.range_id, newUser.position, newUser.division_id]);

  const fetchData = useCallback(async () => {
    // Cancel any in-progress requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Don't refetch if data is fresh (less than 30 seconds old)
    if (usersState.lastFetched && (Date.now() - usersState.lastFetched < 30000)) {
      return;
    }
    
    dispatch({ type: 'FETCH_START' });
    
    try {
      const timeoutId = setTimeout(() => {
        controller.abort('Request timed out');
      }, 10000); // 10 second timeout
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'Not authenticated');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({}),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch users');
      }
      
      const responseData = await response.json();
      
      if (!responseData.users) {
        throw new Error('Invalid response format from server');
      }
      
      const formattedUsers = responseData.users.map((user: any) => ({
        ...user,
        user_region_assignments: user.user_region_assignments || []
      }));
      
      dispatch({ type: 'FETCH_SUCCESS', payload: formattedUsers });
    } catch (err: any) {
      // Don't show error if the fetch was aborted
      if (err.name === 'AbortError') return;
      
      console.error('Error fetching users:', err);
      const errorMessage = err.message || 'Failed to load users';
      dispatch({ type: 'FETCH_ERROR', error: errorMessage });
      toast.error(errorMessage);
    }
  }, [usersState.lastFetched]);
  
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => {
      // Clean up on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearInterval(refreshInterval);
    };
  }, [fetchData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name || !newUser.role || !newUser.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Position-specific validation
    if (['DFO', 'Ranger', 'Guard'].includes(newUser.position) && !newUser.division_id) {
      toast.error('Please select a division');
      return;
    }
    if (['Ranger', 'Guard'].includes(newUser.position) && !newUser.range_id) {
      toast.error('Please select a range');
      return;
    }
    if (newUser.position === 'Guard' && !newUser.beat_id) {
      toast.error('Please select a beat');
      return;
    }

    setIsSubmitting(true);
    
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
      
      // Build assignments based on position
      const assignments: any = {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
        status: 'active',
        created_by: user?.id,
      };
      
      if (newUser.position === 'DFO' && newUser.division_id) {
        assignments.division_id = newUser.division_id;
      }
      if (newUser.position === 'Ranger' && newUser.division_id && newUser.range_id) {
        assignments.division_id = newUser.division_id;
        assignments.range_id = newUser.range_id;
      }
      if (newUser.position === 'Guard' && newUser.division_id && newUser.range_id && newUser.beat_id) {
        assignments.division_id = newUser.division_id;
        assignments.range_id = newUser.range_id;
        assignments.beat_id = newUser.beat_id;
      }

      console.log('Calling create-user function with:', { 
        userData: { ...userData, password: '[REDACTED]' }, 
        assignments 
      });
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken || sessionError) {
        throw new Error(sessionError?.message || 'No active session found. Please log in again.');
      }
      
      // Make the request to the Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({ userData, assignments })
      });
      
      console.log('Raw response status:', response.status, response.statusText);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (parseError) {
        const text = await response.text();
        console.error('Error parsing response. Raw response:', text);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        const errorMessage = responseData?.error?.message || 
                            responseData?.message || 
                            `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // If we get here, user was created successfully
      toast.success('User created successfully');
      setIsSubmitting(false);
      setShowModal(false);
      
      // Reset form
      setNewUser({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'data_collector',
        position: 'Ranger',
        division_id: '',
        range_id: '',
        beat_id: '',
      });
      
      // Refresh user list
      await fetchData();
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMessage = err.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: ExtendedUser) => {
    console.log('handleDeleteUser called with:', userToDelete);
    if (!userToDelete) {
      console.error('No user provided to delete');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${userToDelete.email}?`)) {
      console.log('User cancelled deletion');
      return;
    }

    try {
      console.log('Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', { session, sessionError });
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Failed to verify authentication. Please try again.');
      }
      
      if (!session) {
        console.error('No active session found');
        throw new Error('No active session. Please log in again.');
      }

      const requestBody = {
        userId: userToDelete.id,
        authId: userToDelete.auth_id || userToDelete.id, // Fallback to user.id if auth_id is not available
      };

      const functionName = 'delete-user';
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
      
      console.log('Calling delete-user function with:', {
        functionUrl,
        method: 'POST',
        body: requestBody,
        hasAuthToken: !!session?.access_token
      });

      // Call the Edge Function with POST and JSON body
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
      });

      let data = null;
      let error = null;
      
      try {
        const responseData = await response.json();
        if (!response.ok) {
          error = responseData.error || { message: 'Unknown error occurred' };
        } else {
          data = responseData;
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        error = { message: 'Failed to parse server response' };
      }

      console.log('delete-user function response:', { data, error });

      if (error) {
        console.error('Error from delete-user function:', {
          name: error.name,
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          cause: error.cause,
        });
        
        // Try to extract more detailed error message
        let errorMessage = error.message || 'Failed to delete user';
        if (error.status === 500) {
          errorMessage = 'Server error while deleting user. Please try again later.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to delete users';
        } else if (error.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('No response data from server');
      }

      console.log('User deleted successfully:', data);
      
      // Update the UI by removing the deleted user using the reducer
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: usersState.users.filter(u => u.id !== userToDelete.id)
      });
      
      // Show success message
      toast.success('User deleted successfully');
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      
      console.error('Error in handleDeleteUser:', {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Show user-friendly error message
      toast.error(errorMessage);
    }
  };

  // Memoize filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    if (!search) return usersState.users;
    
    const searchTerm = search.toLowerCase();
    return usersState.users.filter((u: ExtendedUser) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    );
  }, [usersState.users, search]);

  // Loading skeleton
  if (usersState.loading && usersState.users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state with retry button
  if (usersState.error) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>Failed to load users: {usersState.error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchData}
            disabled={usersState.loading}
          >
            {usersState.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="mr-2 h-4 w-4" />
            )}
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Blue-Green Gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-500 px-6 py-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">User Management</h1>
          <p className="text-blue-100 mt-1 text-base">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-white text-blue-700 hover:bg-blue-50 border-blue-200 border font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4 text-green-600" /> Add User
        </Button>
      </div>

      {/* Card with Themed Border */}
      <Card className="bg-gradient-to-br from-blue-50 via-green-50 to-white border-2 border-blue-100/60 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100/60 to-green-100/60 rounded-t-2xl px-6 py-4 border-b border-green-200/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="w-full">
              <CardTitle className="text-lg mb-1 text-blue-700 font-bold tracking-wide">Users</CardTitle>
              <div className="flex flex-row gap-4 items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 bg-white/70 border border-blue-200 focus:border-green-400"
                  />
                </div>
                <span className="ml-2 text-sm text-green-700 font-medium bg-green-100/70 rounded-xl px-3 py-1">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-2xl">
            <Table className="min-w-full divide-y divide-blue-100">
              <TableHeader className="bg-gradient-to-r from-blue-100/40 to-green-100/40">
                <TableRow>
                  <TableHead className="text-blue-700 font-semibold">Name</TableHead>
                  <TableHead className="text-blue-700 font-semibold">Email</TableHead>
                  <TableHead className="text-green-700 font-semibold">Role</TableHead>
                  <TableHead className="text-green-700 font-semibold">Position</TableHead>
                  <TableHead className="text-blue-700 font-semibold">Status</TableHead>
                  <TableHead className="text-right text-blue-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-blue-50/60">
                    <TableCell className="font-medium text-blue-900">{u.first_name} {u.last_name}</TableCell>
                    <TableCell className="text-blue-800">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-green-300 text-green-700 bg-green-50/80">
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-800">{u.position}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'active' ? 'default' : 'destructive'} className={u.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-100/60">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-100/60"
                          onClick={(e) => {
                            console.log('Delete button clicked');
                            e.stopPropagation();
                            handleDeleteUser(u);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-4xl w-[90vw] max-w-[90vw]">
            <DialogHeader className="px-1">
              <DialogTitle className="text-2xl font-bold text-blue-800">Add New User</DialogTitle>
              <DialogDescription className="text-blue-600">
                Create a new user account with the appropriate permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="flex flex-col md:flex-row gap-8 py-2">
                {/* LEFT: Personal Details */}
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 shadow-sm border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Personal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser(p => ({...p, first_name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser(p => ({...p, last_name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser(p => ({...p, email: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                  </div>
                </div>
                {/* RIGHT: Role, Position, Assignment */}
                <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-semibold mb-4 text-green-700">Role & Assignment</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={newUser.position}
                        onValueChange={(value) => setNewUser(p => ({ ...p, position: value as UserPosition }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DFO">DFO</SelectItem>
                          <SelectItem value="Ranger">Ranger</SelectItem>
                          <SelectItem value="Guard">Guard</SelectItem>
                          <SelectItem value="Officer">Officer</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser(p => ({ ...p, role: value as UserRole }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="data_collector">Data Collector</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Region selectors based on position */}
                    {['DFO', 'Ranger', 'Guard'].includes(newUser.position) && (
                      <div>
                        <Label>Division</Label>
                        <Select
                          value={newUser.division_id || ''}
                          onValueChange={(value) => setNewUser(p => ({ ...p, division_id: value }))}
                          disabled={divisions.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              divisions.length === 0 ? 'Loading divisions...' : 'Select division'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map(div => (
                              <SelectItem key={div.id} value={div.id}>
                                {div.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {['Ranger', 'Guard'].includes(newUser.position) && newUser.division_id && (
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Range</Label>
                          {isLoadingRanges && (
                            <span className="text-xs text-blue-600 flex items-center">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Loading...
                            </span>
                          )}
                        </div>
                        <Select
                          value={newUser.range_id || ''}
                          onValueChange={(value) => setNewUser(p => ({ ...p, range_id: value }))}
                          disabled={isLoadingRanges || rangesError !== null}
                        >
                          <SelectTrigger className={rangesError ? 'border-red-300' : ''}>
                            <SelectValue 
                              placeholder={
                                isLoadingRanges 
                                  ? 'Loading ranges...' 
                                  : rangesError 
                                    ? 'Error loading ranges'
                                    : 'Select range'
                              } 
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {rangesError ? (
                              <div className="text-sm text-red-600 p-2">
                                {rangesError}
                              </div>
                            ) : ranges.length > 0 ? (
                              ranges.map(range => (
                                <SelectItem key={range.id} value={range.id}>
                                  {range.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground p-2">
                                No ranges found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        {rangesError && (
                          <p className="text-xs text-red-500 mt-1">
                            {rangesError}
                          </p>
                        )}
                      </div>
                    )}
                    {newUser.position === 'Guard' && newUser.range_id && (
                      <div>
                        <Label>Beat</Label>
                        <Select
                          value={newUser.beat_id || ''}
                          onValueChange={(value) => setNewUser(p => ({ ...p, beat_id: value }))}
                          disabled={beats.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              beats.length === 0 ? 'Loading beats...' : 'Select beat'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {beats.map(beat => (
                              <SelectItem key={beat.id} value={beat.id}>
                                {beat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
            </DialogContent>
          </Dialog>
    </div>
  );
}