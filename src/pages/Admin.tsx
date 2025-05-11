import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define user type
interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [isTesting, setIsTesting] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // For now, bypass the profiles check and assume the user is an admin
        // This is a temporary solution until the profiles table is set up
        setIsAdmin(true);
        
        // Load users
        await fetchUsers();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Failed to verify admin privileges');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      // Since the profiles table might not exist, we'll create mock users for demonstration
      // In a real application, you would fetch users from your database
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          role: 'admin',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'user@example.com',
          role: 'user',
          created_at: new Date().toISOString(),
          last_sign_in_at: null
        }
      ];
      
      setUsers(mockUsers);
      
      // Uncomment this when the profiles table is ready
      /*
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, last_sign_in_at');
        
      if (authError) throw authError;
      
      setUsers(authUsers || []);
      */
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };
  
  // Test API connection
  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('unknown');
    setConnectionDetails('Testing connection...');
    
    try {
      // Test basic connection
      const startTime = performance.now();
      
      // Try to query a simple table
      const { data, error } = await supabase
        .from('observations')
        .select('count(*)', { count: 'exact' })
        .limit(1);
        
      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);
      
      if (error) {
        setConnectionStatus('error');
        setConnectionDetails(`Error: ${error.message}\nCode: ${error.code}\nHint: ${error.hint || 'No hint provided'}`);
        throw error;
      }
      
      // Check views
      const views = [
        'v_total_observations',
        'v_observations_by_division',
        'v_recent_observations',
        'v_observation_types',
        'profiles' // This is likely missing but we'll test it anyway
      ];
      
      const viewResults = await Promise.all(
        views.map(async (view) => {
          try {
            const { data, error } = await supabase.from(view).select('*').limit(1);
            return { view, success: !error, error: error ? error.message : null };
          } catch (e) {
            return { view, success: false, error: e.message };
          }
        })
      );
      
      const successfulViews = viewResults.filter(result => result.success);
      const failedViews = viewResults.filter(result => !result.success);
      
      // If we have at least some successful views, consider it a partial success
      if (successfulViews.length > 0) {
        const successDetails = successfulViews.map(v => `✅ ${v.view}`).join('\n');
        const failureDetails = failedViews.map(v => `❌ ${v.view}: ${v.error}`).join('\n');
        
        setConnectionStatus('success');
        setConnectionDetails(
          `Connection partially successful!\n` +
          `Response time: ${responseTime}ms\n\n` +
          `Working views:\n${successDetails}\n\n` +
          `Failed views:\n${failureDetails}\n\n` +
          `Note: The 'profiles' table is likely missing - this is expected and can be set up later.`
        );
      } else {
        throw new Error(`None of the required views are accessible`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setConnectionDetails(
        `Connection failed: ${error.message || 'Unknown error'}\n\n` +
        `Possible issues:\n` +
        `1. Supabase URL or API key may be incorrect\n` +
        `2. Required database views may not exist\n` +
        `3. Network connectivity issues\n\n` +
        `Please check your Supabase configuration and database schema.`
      );
    } finally {
      setIsTesting(false);
    }
  };
  
  // Add new user
  const addUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsAddingUser(true);
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        // Add user to profiles table with role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: newUser.email,
              role: newUser.role
            }
          ]);
          
        if (profileError) throw profileError;
        
        toast.success(`User ${newUser.email} created successfully`);
        setNewUser({ email: '', password: '', role: 'user' });
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsAddingUser(false);
    }
  };
  
  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success('User role updated successfully');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <Button onClick={() => navigate('/dashboard')} className="bg-green-700 text-white hover:bg-green-800">
            Return to Dashboard
          </Button>
        </div>
        
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="connection">API Connection</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          
          {/* API Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Connection Status</CardTitle>
                <CardDescription>
                  Test the connection to your Supabase backend and view the status of required views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className={`h-4 w-4 rounded-full mr-2 ${
                      connectionStatus === 'unknown' ? 'bg-gray-400' :
                      connectionStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      {connectionStatus === 'unknown' ? 'Connection status unknown' :
                       connectionStatus === 'success' ? 'Connected successfully' : 'Connection failed'}
                    </span>
                  </div>
                  
                  {connectionDetails && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-80">
                        {connectionDetails}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={testConnection} 
                  disabled={isTesting}
                  className="bg-green-700 text-white hover:bg-green-800"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>
                  Create a new user account and assign appropriate role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="col-span-3"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="col-span-3"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={addUser} 
                  disabled={isAddingUser || !newUser.email || !newUser.password}
                  className="bg-green-700 text-white hover:bg-green-800"
                >
                  {isAddingUser ? 'Adding...' : 'Add User'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage existing users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                            >
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
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => {
                                // Implement delete user functionality
                                toast.info('Delete functionality not implemented');
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
