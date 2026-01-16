'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BoardPosition, Profile } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthPrompt from '@/components/AuthPrompt';
import UserProfileModal from '@/components/UserProfileModal';
import ProductPreviewModal from '@/components/shop/ProductPreviewModal';
import { getProductDisplayImage } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState<'users' | 'board' | 'sync' | 'orders'>('users');
  const [newPosition, setNewPosition] = useState({ role: '', display_order: 0 });
  const [addingPosition, setAddingPosition] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Sync products state
  const [syncProducts, setSyncProducts] = useState<any[]>([]);
  const [syncedProducts, setSyncedProducts] = useState<any[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [syncError, setSyncError] = useState('');
  
  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Product preview modal state
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Delete user modal state
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; user: Profile | null }>({
    isOpen: false,
    user: null
  });
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

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
    setAddingPosition(true);
    setError('');
    setSuccess('');

    try {
      // Create a temporary ID for the new position (will be replaced when saved)
      const tempId = `temp-${Date.now()}`;
      const newPos: BoardPosition = {
        id: tempId,
        role: 'New Position',
        display_order: localBoardPositions.length, // Add at the end
        is_active: true,
        username: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state immediately
      setLocalBoardPositions(prev => [...prev, newPos]);
      setHasUnsavedChanges(true);
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

  const insertPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= localBoardPositions.length || toIndex >= localBoardPositions.length) {
      return;
    }

    // If dragging to the same position, do nothing
    if (fromIndex === toIndex) {
      return;
    }

    const newPositions = [...localBoardPositions];
    const [removed] = newPositions.splice(fromIndex, 1);
    
    // Calculate the correct insert index
    // If dragging forward (fromIndex < toIndex), we need to adjust because we removed an item
    // If dragging backward (fromIndex > toIndex), the index is already correct
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    newPositions.splice(insertIndex, 0, removed);
    
    // Update display_order based on new positions (left to right, top to bottom)
    newPositions.forEach((position, index) => {
      position.display_order = index;
    });
    
    setLocalBoardPositions(newPositions);
    setHasUnsavedChanges(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      insertPosition(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  const openDeleteUserModal = (user: Profile) => {
    setDeleteUserModal({ isOpen: true, user });
  };

  const closeDeleteUserModal = () => {
    setDeleteUserModal({ isOpen: false, user: null });
  };

  const deleteUser = async (userId: string) => {
    setDeletingUser(userId);
    setError('');
    setSuccess('');

    try {
      // Prevent admin from deleting themselves
      if (deleteUserModal.user?.user_id === profile?.user_id) {
        setError('You cannot delete your own account.');
        return;
      }

      // First, check if user has any board positions
      const { data: boardPositions } = await supabase
        .from('board_positions')
        .select('*')
        .eq('username', deleteUserModal.user?.username);

      if (boardPositions && boardPositions.length > 0) {
        setError('Cannot delete user who has board positions. Please remove them from board positions first.');
        return;
      }

      // Delete the user profile using RLS policies
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        
        // Check for specific RLS errors
        if (error.message?.includes('new row violates row-level security policy')) {
          setError('You do not have permission to delete this user. Only admins can delete users.');
        } else if (error.message?.includes('Cannot delete user who has board positions')) {
          setError('Cannot delete user who has board positions. Please remove them from board positions first.');
        } else if (error.message?.includes('Admins cannot delete their own profile')) {
          setError('You cannot delete your own account.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('User deleted successfully!');
        fetchUsers(); // Refresh the list
        closeDeleteUserModal();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const openProductPreview = (product: any) => {
    setPreviewProduct(product);
    setIsPreviewModalOpen(true);
  };

  const closeProductPreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewProduct(null);
  };

  // Sync products functions
  const fetchProductsFromPrintful = async () => {
    setPreviewLoading(true);
    setSyncError('');
    setSyncProducts([]);
    setSyncedProducts([]);

    try {
      console.log('🔄 Fetching products from Printful...');
      const response = await fetch('/api/sync-products', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Details:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch products');
      }

      const data = await response.json();
      console.log('📦 Products fetched:', data.products);
      setSyncProducts(data.products || []);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('❌ Error fetching products:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const syncProductsToStripe = async () => {
    if (syncProducts.length === 0) {
      setSyncError('No products to sync. Please fetch products first.');
      return;
    }

    setSyncLoading(true);
    setSyncError('');
    setSyncedProducts([]);

    try {
      console.log('🔄 Syncing products to Stripe...');
      const response = await fetch('/api/sync-products', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync products');
      }

      const data = await response.json();
      console.log('✅ Sync completed:', data);
      setSyncedProducts(data.products || []);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync products');
      console.error('❌ Error syncing products:', err);
    } finally {
      setSyncLoading(false);
    }
  };

  const saveAllChanges = async () => {
    setSavingChanges(true);
    setError('');
    setSuccess('');

    try {
      // Separate positions into existing and new ones
      const existingPositions = localBoardPositions.filter(localPos => 
        boardPositions.find(originalPos => originalPos.id === localPos.id)
      );
      const newPositions = localBoardPositions.filter(localPos => 
        !boardPositions.find(originalPos => originalPos.id === localPos.id)
      );

      // Get positions that were deleted
      const deletedPositions = boardPositions.filter(originalPos => 
        !localBoardPositions.find(localPos => localPos.id === originalPos.id)
      );

      // Track username changes for profile updates
      const usernameChanges: { username: string; role: string; action: 'assign' | 'unassign' }[] = [];

      // Check for username changes in all existing positions
      for (const position of existingPositions) {
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
          // Role changed but username stayed the same - need to update profile
          else if (originalPos.username && position.username && originalPos.role !== position.role) {
            usernameChanges.push({ username: position.username, role: position.role, action: 'assign' });
          }
        }
      }

      // Check for username assignments in new positions
      for (const position of newPositions) {
        if (position.username) {
          usernameChanges.push({ username: position.username, role: position.role, action: 'assign' });
        }
      }

      // Check for username changes in deleted positions
      for (const position of deletedPositions) {
        if (position.username) {
          usernameChanges.push({ username: position.username, role: position.role, action: 'unassign' });
        }
      }

      // Update ALL existing positions (to ensure display_order is correct for all)
      for (const position of existingPositions) {
        const { error } = await supabase
          .from('board_positions')
          .update({
            display_order: position.display_order,
            username: position.username,
            is_active: position.is_active,
            role: position.role
          })
          .eq('id', position.id);

        if (error) {
          throw error;
        }
      }

      // Insert new positions
      for (const position of newPositions) {
        const { data, error } = await supabase
          .from('board_positions')
          .insert({
            role: position.role,
            username: position.username,
            display_order: position.display_order,
            is_active: position.is_active ?? true
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Update local state with the real ID from database
        setLocalBoardPositions(prev => 
          prev.map(p => p.id === position.id ? data : p)
        );
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
      <section className="min-h-screen bg-white py-16 sm:py-20 lg:py-24">
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
                          <button
                            onClick={() => setActiveTab('sync')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'sync'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Sync Products
                          </button>
                          <button
                            onClick={() => setActiveTab('orders')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'orders'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Orders
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
                                            <button
                                              onClick={() => openDeleteUserModal(user)}
                                              disabled={user.is_admin || user.user_id === profile?.user_id}
                                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                                user.is_admin || user.user_id === profile?.user_id
                                                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                  : 'bg-red-600 text-white hover:bg-red-700'
                                              }`}
                                              title={user.is_admin ? 'Cannot delete admin users' : user.user_id === profile?.user_id ? 'Cannot delete your own account' : 'Delete user'}
                                            >
                                              Delete
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

                        {/* Board Positions - Draggable Cards */}
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
                                <div className="mb-3">
                                  <p className="text-xs text-gray-500">
                                    💡 <strong>Drag and drop</strong> cards to reorder. Order (left→right, top→bottom) determines board page display.
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {localBoardPositions.map((position, index) => (
                                      <div
                                        key={position.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white rounded-lg shadow-sm border-2 p-3 transition-all duration-200 cursor-move hover:shadow-md ${
                                          draggedIndex === index
                                            ? 'opacity-40 scale-95 border-blue-400 z-50'
                                            : dragOverIndex === index
                                            ? 'border-green-400 scale-[1.02] shadow-md ring-2 ring-green-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        {/* Header: Drag handle and position number */}
                                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                          <div className="flex items-center space-x-1.5 cursor-grab active:cursor-grabbing">
                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1 .001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z"></path>
                                            </svg>
                                          </div>
                                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                            #{index + 1}
                                          </span>
                                        </div>

                                        {/* Position Role - Compact */}
                                        <div className="mb-2">
                                          <input
                                            type="text"
                                            value={position.role}
                                            onChange={(e) => updateLocalPosition(position.id, { role: e.target.value })}
                                            className="w-full px-2 py-1.5 text-xs font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent bg-white"
                                            placeholder="Role"
                                          />
                                        </div>

                                        {/* Username - Compact */}
                                        <div className="mb-2">
                                          <div className="flex items-center gap-1">
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
                                              placeholder="username"
                                              className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent bg-white"
                                            />
                                            {position.username && (
                                              <span className="text-[10px] text-gray-400">✓</span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Status and Actions - Compact */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                                            position.is_active
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}>
                                            {position.is_active ? '✓' : '○'}
                                          </span>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => updateLocalPosition(position.id, { is_active: !position.is_active })}
                                              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                                                position.is_active
                                                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                                                  : 'bg-green-500 text-white hover:bg-green-600'
                                              }`}
                                              title={position.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                              {position.is_active ? 'OFF' : 'ON'}
                                            </button>
                                            <button
                                              onClick={() => deleteLocalPosition(position.id)}
                                              className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                              title="Delete"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* Add New Position Card */}
                                    <button
                                      onClick={addBoardPosition}
                                      disabled={addingPosition}
                                      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 transition-all duration-200 cursor-pointer hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center min-h-[140px]"
                                    >
                                      {addingPosition ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                      ) : (
                                        <>
                                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                          <span className="text-xs font-medium text-gray-500">Add Position</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

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

                        {/* Sync Products Tab */}
                        {activeTab === 'sync' && (
                          <>
                            <div className="mb-6">
                              <h2 className="text-xl font-semibold text-black mb-4">Product Management</h2>
                              <p className="text-gray-600 mb-4">
                                Import products from Printful to your shop by syncing them to Stripe.
                              </p>
                              
                              {syncError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                  <p className="text-red-600 text-sm">{syncError}</p>
                                </div>
                              )}

                              {/* Instructions */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                                <ul className="text-blue-800 space-y-1 text-sm">
                                  <li>• <strong>Step 1:</strong> Preview products from Printful (safe - no changes)</li>
                                  <li>• <strong>Step 2:</strong> Review the products and prices</li>
                                  <li>• <strong>Step 3:</strong> Sync to Stripe to add them to your shop (will delete removed products)</li>
                                </ul>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                  onClick={fetchProductsFromPrintful}
                                  disabled={previewLoading}
                                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                  {previewLoading ? 'Loading...' : '👁️ Preview Products from Printful'}
                                </button>
                                
                                <button
                                  onClick={syncProductsToStripe}
                                  disabled={syncLoading || syncProducts.length === 0}
                                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  {syncLoading ? 'Syncing...' : '🔄 Sync to Stripe (with cleanup)'}
                                </button>
                              </div>
                            </div>

                            {/* Products from Printful */}
                            {syncProducts.length > 0 && (
                              <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                  📦 Products from Printful ({syncProducts.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {syncProducts.map((product, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                      {/* Product Image */}
                                      <div className="h-80 bg-gray-100 flex items-center justify-center">
                                        {(() => {
                                          const displayImage = getProductDisplayImage(product);
                                          return displayImage ? (
                                            <img 
                                              src={displayImage} 
                                              alt={product.name} 
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="text-gray-500 text-center p-4">
                                              <div className="text-2xl mb-2">🖼️</div>
                                              <p className="text-sm">No Image</p>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                      
                                      {/* Product Details */}
                                      <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                          {product.name}
                                        </h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          <p>ID: {product.id}</p>
                                          <p>Variants: {product.variants}</p>
                                          <p>Synced: {product.synced}</p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg text-gray-900">
                                              ${product.retail_price ? product.retail_price.toFixed(2) : 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {product.is_ignored ? 'Ignored' : 'Active'}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Preview Button */}
                                        <div className="mt-3">
                                          <button
                                            onClick={() => openProductPreview(product)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                          >
                                            👁️ Preview Product
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Synced Products */}
                            {syncedProducts.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                  ✅ Synced to Stripe ({syncedProducts.length})
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="space-y-2">
                                    {syncedProducts.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center">
                                        <span className="font-medium text-green-900">
                                          {item.product?.name || 'Product'}
                                        </span>
                                        <span className="text-green-700">
                                          ${item.priceDetails?.amount ? item.priceDetails.amount.toFixed(2) : 'N/A'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-green-700 text-sm mt-3">
                                    ✅ Products have been successfully synced to your shop!
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Debug Info */}
                            {process.env.NODE_ENV === 'development' && (
                              <details className="mt-6">
                                <summary className="cursor-pointer text-gray-700 font-medium">🔧 Debug Information</summary>
                                <div className="mt-2 space-y-4">
                                  {syncProducts.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Raw Products Data:</h4>
                                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(syncProducts, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {syncedProducts.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Sync Results:</h4>
                                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(syncedProducts, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </details>
                                                         )}
                           </>
                         )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                          <>
                            <div className="mb-6">
                              <h2 className="text-xl font-semibold text-black mb-4">Order Management</h2>
                              <p className="text-gray-600 mb-4">
                                View and manage customer orders and fulfillment status.
                              </p>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {ordersLoading ? (
                                      // Loading skeletons
                                      [...Array(3)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : orders.length === 0 ? (
                                      <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                          <div className="text-gray-500">
                                            <div className="text-4xl mb-4">📦</div>
                                            <p className="text-lg font-medium">No orders yet</p>
                                            <p className="text-sm">Orders will appear here once customers make purchases.</p>
                                          </div>
                                        </td>
                                      </tr>
                                    ) : (
                                      orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.stripe_session_id.slice(-8)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {order.customer_name || 'N/A'}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {order.customer_email}
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${order.total_amount.toFixed(2)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              order.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                              order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {order.status}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                              onClick={() => {/* TODO: View order details */}}
                                              className="text-blue-600 hover:text-blue-900"
                                            >
                                              View Details
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
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

      {/* Product Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          isOpen={isPreviewModalOpen}
          onClose={closeProductPreview}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deleteUserModal.isOpen && deleteUserModal.user && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full border border-gray-200/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">Delete User</h2>
              <button
                onClick={closeDeleteUserModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden mr-4">
                  {deleteUserModal.user.avatar_url ? (
                    <img
                      src={deleteUserModal.user.avatar_url}
                      alt={deleteUserModal.user.full_name}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {deleteUserModal.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {deleteUserModal.user.full_name}
                  </h3>
                  {deleteUserModal.user.username && (
                    <p className="text-sm text-gray-500">@{deleteUserModal.user.username}</p>
                  )}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        This will permanently delete the user account and all associated data. 
                        The user will no longer be able to access the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteUserModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(deleteUserModal.user!.id)}
                  disabled={deletingUser === deleteUserModal.user!.id}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingUser === deleteUserModal.user!.id ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 