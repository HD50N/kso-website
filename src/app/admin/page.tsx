'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, BoardPosition } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthPrompt from '@/components/AuthPrompt';
import UserProfileModal from '@/components/UserProfileModal';

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [boardPositions, setBoardPositions] = useState<BoardPosition[]>([]);
  const [localBoardPositions, setLocalBoardPositions] = useState<BoardPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [updatingPosition, setUpdatingPosition] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'board'>('users');
  const [newPosition, setNewPosition] = useState({ role: '', display_order: 0 });
  const [addingPosition, setAddingPosition] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoardPositions = useCallback(async () => {
    setBoardLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_positions')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching board positions:', error);
        setError(error.message);
      } else {
        const positions = data || [];
        setBoardPositions(positions);
        setLocalBoardPositions(positions);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error fetching board positions:', error);
      setError('Failed to load board positions');
    } finally {
      setBoardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && profile?.is_admin) {
      fetchUsers();
      fetchBoardPositions();
    }
  }, [authLoading, profile?.is_admin, fetchUsers, fetchBoardPositions]);

  const updateBoardPosition = async (positionId: string, updates: Partial<BoardPosition>) => {
    setUpdatingPosition(positionId);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('board_positions')
        .update(updates)
        .eq('id', positionId);

      if (error) {
        console.error('Error updating board position:', error);
        setError(error.message);
      } else {
        setSuccess('Board position updated successfully!');
        fetchBoardPositions(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating board position:', error);
      setError('Failed to update board position');
    } finally {
      setUpdatingPosition(null);
    }
  };

  const addBoardPosition = async () => {
    if (!newPosition.role.trim()) {
      setError('Position role is required');
      return;
    }

    setAddingPosition(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .from('board_positions')
        .insert({
          role: newPosition.role.trim(),
          display_order: newPosition.display_order || 0,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding board position:', error);
        setError(error.message);
      } else {
        setSuccess('Board position added successfully!');
        setNewPosition({ role: '', display_order: 0 });
        // Add to local state
        setLocalBoardPositions(prev => [...prev, data]);
        setHasUnsavedChanges(true);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error adding board position:', error);
      setError('Failed to add board position');
    } finally {
      setAddingPosition(false);
    }
  };

  const deleteBoardPosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to delete this board position? This action cannot be undone.')) {
      return;
    }

    setUpdatingPosition(positionId);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('board_positions')
        .delete()
        .eq('id', positionId);

      if (error) {
        console.error('Error deleting board position:', error);
        setError(error.message);
      } else {
        setSuccess('Board position deleted successfully!');
        fetchBoardPositions(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting board position:', error);
      setError('Failed to delete board position');
    } finally {
      setUpdatingPosition(null);
    }
  };

  const updateUserStatus = async (userId: string, updates: Partial<Profile>) => {
    setUpdatingUser(userId);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        setError(error.message);
      } else {
        setSuccess('User updated successfully!');
        fetchUsers(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setUpdatingUser(null);
    }
  };

  const swapPositions = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= localBoardPositions.length || toIndex >= localBoardPositions.length) {
      return;
    }

    const newPositions = [...localBoardPositions];
    const fromPosition = newPositions[fromIndex];
    const toPosition = newPositions[toIndex];
    
    // Swap the display_order values
    const tempOrder = fromPosition.display_order;
    fromPosition.display_order = toPosition.display_order;
    toPosition.display_order = tempOrder;
    
    setLocalBoardPositions(newPositions);
    setHasUnsavedChanges(true);
  };

  const updateLocalPosition = (positionId: string, updates: Partial<BoardPosition>) => {
    setLocalBoardPositions(prev => 
      prev.map(position => 
        position.id === positionId 
          ? { ...position, ...updates }
          : position
      )
    );
    setHasUnsavedChanges(true);
  };

  // Function to validate username exists when assigned to a position
  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username) return true; // Empty username is valid (unassigned position)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error || !data) {
      setError(`Username "${username}" not found. Please enter a valid username.`);
      return false;
    }
    
    return true;
  };

  const deleteLocalPosition = (positionId: string) => {
    if (!confirm('Are you sure you want to delete this board position? This action cannot be undone.')) {
      return;
    }

    setLocalBoardPositions(prev => prev.filter(position => position.id !== positionId));
    setHasUnsavedChanges(true);
  };

  const openProfileModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  const saveAllChanges = async () => {
    setSavingChanges(true);
    setError('');
    setSuccess('');

    try {
      // Get all positions that need to be updated
      const positionsToUpdate = localBoardPositions.filter((localPos, index) => {
        const originalPos = boardPositions[index];
        return originalPos && (
          localPos.display_order !== originalPos.display_order ||
          localPos.username !== originalPos.username ||
          localPos.is_active !== originalPos.is_active
        );
      });

      // Get positions that were deleted
      const deletedPositions = boardPositions.filter(originalPos => 
        !localBoardPositions.find(localPos => localPos.id === originalPos.id)
      );

      // Track username changes for profile updates
      const usernameChanges: { username: string; role: string; action: 'assign' | 'unassign' }[] = [];

      // Check for username changes in updated positions
      for (const position of positionsToUpdate) {
        const originalPos = boardPositions.find(p => p.id === position.id);
        if (originalPos) {
          // Username was assigned
          if (!originalPos.username && position.username) {
            usernameChanges.push({ username: position.username, role: position.role, action: 'assign' });
          }
          // Username was unassigned
          else if (originalPos.username && !position.username) {
            usernameChanges.push({ username: originalPos.username, role: originalPos.role, action: 'unassign' });
          }
          // Username was changed
          else if (originalPos.username && position.username && originalPos.username !== position.username) {
            usernameChanges.push({ username: originalPos.username, role: originalPos.role, action: 'unassign' });
            usernameChanges.push({ username: position.username, role: position.role, action: 'assign' });
          }
        }
      }

      // Check for username changes in deleted positions
      for (const position of deletedPositions) {
        if (position.username) {
          usernameChanges.push({ username: position.username, role: position.role, action: 'unassign' });
        }
      }

      // Update existing positions
      for (const position of positionsToUpdate) {
        const { error } = await supabase
          .from('board_positions')
          .update({
            display_order: position.display_order,
            username: position.username,
            is_active: position.is_active
          })
          .eq('id', position.id);

        if (error) {
          throw error;
        }
      }

      // Delete removed positions
      for (const position of deletedPositions) {
        const { error } = await supabase
          .from('board_positions')
          .delete()
          .eq('id', position.id);

        if (error) {
          throw error;
        }
      }

      // Update user profiles based on username changes
      for (const change of usernameChanges) {
        if (change.action === 'assign') {
          // Assign user to board position
          const { error } = await supabase
            .from('profiles')
            .update({
              user_type: 'board_member',
              board_position: change.role
            })
            .eq('username', change.username);

          if (error) {
            console.error(`Error updating profile for ${change.username}:`, error);
          }
        } else if (change.action === 'unassign') {
          // Check if user has other board positions
          const { data: otherPositions } = await supabase
            .from('board_positions')
            .select('role')
            .eq('username', change.username)
            .eq('is_active', true);

          if (otherPositions && otherPositions.length > 0) {
            // User has other positions, update to the first one
            const { error } = await supabase
              .from('profiles')
              .update({
                board_position: otherPositions[0].role
              })
              .eq('username', change.username);

            if (error) {
              console.error(`Error updating profile for ${change.username}:`, error);
            }
          } else {
            // User has no other positions, revert to previous user_type
            // We'll need to determine what the previous type was
            // For now, we'll set it to 'undergrad' as a default
            const { error } = await supabase
              .from('profiles')
              .update({
                user_type: 'undergrad',
                board_position: null
              })
              .eq('username', change.username);

            if (error) {
              console.error(`Error updating profile for ${change.username}:`, error);
            }
          }
        }
      }

      setSuccess('All changes saved successfully!');
      setHasUnsavedChanges(false);
      // Refresh the board positions and users to sync with database
      fetchBoardPositions();
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || user.user_type === filterType;

    return matchesSearch && matchesType;
  });

  // Show loading only for auth, not for content loading
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Admin Panel"
        description="Access the KSO admin dashboard to manage users and board configurations."
        features={[
          "Manage user accounts and permissions",
          "Configure board positions",
          "Monitor member activity",
          "Update organization settings"
        ]}
        ctaText="Sign In to Access Admin Panel"
        ctaHref="/auth"
      />
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access the admin panel. Only administrators can view this page.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-black mb-2">Need Admin Access?</h2>
              <p className="text-sm text-gray-600">
                If you believe you should have admin access, please contact the KSO board or your organization administrator.
              </p>
            </div>
            <Link 
              href="/profile"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Profile
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Admin Panel Section */}
      <section className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin Panel</span>
                      </div>
                      <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
                      <p className="text-gray-600">
                        Manage user accounts, permissions, and board configurations
                      </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-6">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                          <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'users'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            User Management
                          </button>
                          <button
                            onClick={() => setActiveTab('board')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'board'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Board Configuration
                          </button>
                        </nav>
                      </div>
                    </div>

                                {/* User Management Tab */}
                    {activeTab === 'users' && (
                      <>
                        {/* Search and Filters */}
                        <div className="mb-6 space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Search by name, username, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              />
                            </div>
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="all">All Types</option>
                              <option value="undergrad">Undergraduate</option>
                              <option value="grad">Graduate</option>
                              <option value="alumni">Alumni</option>
                              <option value="board_member">Board Member</option>
                            </select>
                          </div>

                          {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-600 text-sm">{error}</p>
                            </div>
                          )}

                          {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-green-600 text-sm">{success}</p>
                            </div>
                          )}

                          <div className="mb-4">
                            <p className="text-gray-600">
                              Showing {filteredUsers.length} of {users.length} users
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Board Configuration Tab */}
                    {activeTab === 'board' && (
                      <>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold text-black mb-4">Executive Board Positions</h2>
                          <p className="text-gray-600 mb-4">
                            Configure board positions and assign usernames to automatically display user information on the board page.
                          </p>
                          
                          {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                              <p className="text-red-600 text-sm">{error}</p>
                            </div>
                          )}

                          {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                              <p className="text-green-600 text-sm">{success}</p>
                            </div>
                          )}

                          {/* Add New Position Form */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-medium text-black mb-3">Add New Position</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Position role (e.g., 'Treasurer')"
                                  value={newPosition.role}
                                  onChange={(e) => setNewPosition({ ...newPosition, role: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>

                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Order"
                                  value={newPosition.display_order || ''}
                                  onChange={(e) => setNewPosition({ ...newPosition, display_order: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                              <button
                                onClick={addBoardPosition}
                                disabled={addingPosition || !newPosition.role.trim()}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {addingPosition ? 'Adding...' : 'Add Position'}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              💡 <strong>Multiple Positions:</strong> You can create multiple positions with the same role (e.g., multiple "Treasurer" or "Social Chair" positions).
                            </p>
                            <p className="text-xs text-gray-500">
                              💡 <strong>Display Order:</strong> Lower numbers appear first. Use increments of 10 (10, 20, 30...) for easy reordering.
                            </p>
                          </div>

                          {/* Save Changes Button */}
                          {hasUnsavedChanges && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <span className="text-yellow-800 font-medium">You have unsaved changes</span>
                                </div>
                                <button
                                  onClick={saveAllChanges}
                                  disabled={savingChanges}
                                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  {savingChanges ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save All Changes'
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                                    {/* Users Table */}
                        {activeTab === 'users' && (
                          <>
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                      // Loading skeletons
                                      [...Array(5)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                                              <div>
                                                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      filteredUsers.map((user) => (
                                      <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden mr-3">
                                              {user.avatar_url ? (
                                                <img
                                                  src={user.avatar_url}
                                                  alt={user.full_name}
                                                  className="w-10 h-10 object-cover"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                  <span className="text-sm font-bold text-gray-600">
                                                    {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {user.full_name}
                                              </div>
                                              {user.username && (
                                                <div className="text-sm text-gray-400">
                                                  @{user.username}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                            user.user_type === 'board_member' 
                                              ? 'bg-blue-100 text-blue-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {user.user_type?.replace('_', ' ')}
                                          </span>
                                          {user.board_position && (
                                            <div className="text-xs text-blue-600 mt-1 font-medium">
                                              {user.board_position}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.is_admin
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {user.is_admin ? 'Admin' : 'User'}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => updateUserStatus(user.id, { is_admin: !user.is_admin })}
                                              disabled={updatingUser === user.id}
                                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                                user.is_admin
                                                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                  : 'bg-red-600 text-white hover:bg-red-700'
                                              } disabled:opacity-50`}
                                            >
                                              {updatingUser === user.id ? 'Updating...' : (user.is_admin ? 'Remove Admin' : 'Make Admin')}
                                            </button>
                                            <button
                                              onClick={() => updateUserStatus(user.id, { user_type: user.user_type === 'board_member' ? 'undergrad' : 'board_member' })}
                                              disabled={updatingUser === user.id}
                                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                                user.user_type === 'board_member'
                                                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                                              } disabled:opacity-50`}
                                            >
                                              {updatingUser === user.id ? 'Updating...' : (user.user_type === 'board_member' ? 'Remove Board' : 'Make Board')}
                                            </button>
                                            <button
                                              onClick={() => openProfileModal(user.user_id)}
                                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                              View Profile
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {filteredUsers.length === 0 && (
                              <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No users found matching your criteria.</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Board Positions Table */}
                        {activeTab === 'board' && (
                          <>
                            {boardLoading ? (
                              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                  <p className="mt-4 text-gray-600">Loading board positions...</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                            Reorder
                                          </th>
                                          <th className="px-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {localBoardPositions.map((position, index) => (
                                          <tr key={position.id} className="hover:bg-gray-50 group relative">
                                            {/* Reorder arrows - only visible on hover */}
                                            <td className="px-10 py-4 whitespace-nowrap w-12">
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1">
                                                {index > 0 && (
                                                  <button
                                                    onClick={() => swapPositions(index, index - 1)}
                                                    className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                                                    title="Move up"
                                                  >
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                  </button>
                                                )}
                                                {index < localBoardPositions.length - 1 && (
                                                  <button
                                                    onClick={() => swapPositions(index, index + 1)}
                                                    className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                                                    title="Move down"
                                                  >
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-20 py-4 whitespace-nowrap">
                                              <div className="text-sm font-medium text-gray-900">
                                                {position.role}
                                              </div>
                                              <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500">Order:</span>
                                                <input
                                                  type="number"
                                                  value={position.display_order || ''}
                                                  onChange={(e) => updateLocalPosition(position.id, { display_order: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                                                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                                                />
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center space-x-2">
                                                <input
                                                  type="text"
                                                  value={position.username || ''}
                                                  onChange={(e) => updateLocalPosition(position.id, { username: e.target.value || undefined })}
                                                  onBlur={async (e) => {
                                                    const username = e.target.value.trim();
                                                    if (username) {
                                                      await validateUsername(username);
                                                    }
                                                  }}
                                                  placeholder="Enter username"
                                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                                                />
                                                {position.username && (
                                                  <span className="text-xs text-gray-500">@{position.username}</span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                position.is_active
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                {position.is_active ? 'Active' : 'Inactive'}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                              <div className="flex space-x-2">
                                                <button
                                                  onClick={() => updateLocalPosition(position.id, { is_active: !position.is_active })}
                                                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                                    position.is_active
                                                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                      : 'bg-green-600 text-white hover:bg-green-700'
                                                  }`}
                                                >
                                                  {position.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                  onClick={() => deleteLocalPosition(position.id)}
                                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {localBoardPositions.length === 0 && (
                                  <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg">No board positions found.</p>
                                  </div>
                                )}

                                {localBoardPositions.length > 0 && (
                                  <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                      Showing {localBoardPositions.filter(p => p.is_active).length} active positions out of {localBoardPositions.length} total positions
                                    </p>
                                  </div>
                                )}
                              </>
                                                            )}
                          </>
                        )}
        </div>
      </section>

      <Footer />
      
      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      )}
    </div>
  );
} 