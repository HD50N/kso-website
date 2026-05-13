'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BoardPosition, Profile } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthPrompt from '@/components/AuthPrompt';
import UserProfileModal from '@/components/UserProfileModal';
import ProductPreviewModal from '@/components/shop/ProductPreviewModal';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';
import { getProductDisplayImage } from '@/lib/utils';

/** Shared field + control styles (editorial / rest of site) */
const ADMIN_FIELD =
  'w-full px-4 py-3 border border-gray-200 bg-white text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors';
const ADMIN_SECTION_TITLE = 'text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2';
const ADMIN_HEADING = 'text-3xl sm:text-4xl font-black text-black tracking-tight mb-4';
const ADMIN_LEAD = 'text-sm text-gray-500 leading-relaxed max-w-2xl mb-6';
const ADMIN_BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3.5 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const ADMIN_BTN_OUTLINE =
  'inline-flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3.5 border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const ADMIN_BTN_ACCENT =
  'inline-flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3.5 bg-[#CD2E3A] text-white hover:bg-[#b02633] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const ADMIN_BTN_DANGER =
  'inline-flex items-center justify-center text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3.5 border border-[#CD2E3A] text-[#CD2E3A] hover:bg-[#CD2E3A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const ADMIN_TABLE_WRAP = 'border border-gray-100 bg-white overflow-hidden';
const ADMIN_TH =
  'px-6 py-3 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 border-b border-gray-100 bg-white';
const ADMIN_ALERT_ERR = 'border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3 mb-4';
const ADMIN_ALERT_OK = 'border border-gray-200 bg-gray-50 px-4 py-3 mb-4';
const ADMIN_ALERT_WARN = 'border border-gray-200 bg-gray-50 px-4 py-4 mb-6';

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Checking authentication...</p>
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
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="border-b border-gray-100 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                  Admin
                </p>
                <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                  Access<br />Denied
                </h1>
              </div>
              <div className="lg:pt-20">
                <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                  &ldquo;This area is restricted to KSO administrators.&rdquo;
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md">
                  You don&apos;t have permission to view the admin panel. If you need access, contact the KSO board.
                </p>
                <Link
                  href="/profile"
                  className="inline-block bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
                >
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                KSO Internal
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                Admin<br />Dashboard
              </h1>
            </div>
            <div className="lg:pt-20">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Manage members, board roles, shop sync, and orders.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                Manage user accounts, permissions, and board configurations. Use the tabs below to switch areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                      <div className="mb-6">
                        <nav className="-mb-px flex flex-wrap gap-x-8 gap-y-2 border-b border-gray-100">
                          <button
                            onClick={() => setActiveTab('users')}
                            className={`py-3 px-0 border-b-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                              activeTab === 'users'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-black'
                            }`}
                          >
                            User Management
                          </button>
                          <button
                            onClick={() => setActiveTab('board')}
                            className={`py-3 px-0 border-b-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                              activeTab === 'board'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-black'
                            }`}
                          >
                            Board Configuration
                          </button>
                          <button
                            onClick={() => setActiveTab('sync')}
                            className={`py-3 px-0 border-b-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                              activeTab === 'sync'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-black'
                            }`}
                          >
                            Sync Products
                          </button>
                          <button
                            onClick={() => setActiveTab('orders')}
                            className={`py-3 px-0 border-b-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                              activeTab === 'orders'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-black'
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
                        <div className="mb-10 space-y-4">
                          <div>
                            <p className={ADMIN_SECTION_TITLE}>Directory</p>
                            <h2 className={ADMIN_HEADING}>User accounts</h2>
                            <p className={ADMIN_LEAD}>
                              Search members, toggle admin or board status, open profiles, or remove accounts (non-admins only).
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Search by name, username, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={ADMIN_FIELD}
                              />
                            </div>
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className={`${ADMIN_FIELD} sm:max-w-[220px]`}
                            >
                              <option value="all">All Types</option>
                              <option value="undergrad">Undergraduate</option>
                              <option value="grad">Graduate</option>
                              <option value="alumni">Alumni</option>
                              <option value="board_member">Board Member</option>
                            </select>
                          </div>

                          {error && (
                            <div className={ADMIN_ALERT_ERR}>
                              <p className="text-[#CD2E3A] text-sm">{error}</p>
                            </div>
                          )}

                          {success && (
                            <div className={ADMIN_ALERT_OK}>
                              <p className="text-gray-700 text-sm">{success}</p>
                            </div>
                          )}

                          <p className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-medium">
                            Showing {filteredUsers.length} of {users.length} users
                          </p>
                        </div>
                      </>
                    )}

                    {/* Board Configuration Tab */}
                    {activeTab === 'board' && (
                      <>
                        <div className="mb-10">
                          <p className={ADMIN_SECTION_TITLE}>Executive board</p>
                          <h2 className={ADMIN_HEADING}>Board positions</h2>
                          <p className={ADMIN_LEAD}>
                            Map roles to usernames for the public board page. Drag cards to set display order (left to right, then next row).
                          </p>

                          {error && (
                            <div className={ADMIN_ALERT_ERR}>
                              <p className="text-[#CD2E3A] text-sm">{error}</p>
                            </div>
                          )}

                          {success && (
                            <div className={ADMIN_ALERT_OK}>
                              <p className="text-gray-700 text-sm">{success}</p>
                            </div>
                          )}

                          {hasUnsavedChanges && (
                            <div className={ADMIN_ALERT_WARN}>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-sm text-gray-700">
                                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black block mb-1">Unsaved changes</span>
                                  Save to push order and edits to the board page.
                                </p>
                                <button
                                  type="button"
                                  onClick={saveAllChanges}
                                  disabled={savingChanges}
                                  className={ADMIN_BTN_ACCENT}
                                >
                                  {savingChanges ? (
                                    <>
                                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                                      Saving
                                    </>
                                  ) : (
                                    'Save all'
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
                            <div className={ADMIN_TABLE_WRAP}>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr>
                                      <th className={ADMIN_TH}>User</th>
                                      <th className={ADMIN_TH}>Type</th>
                                      <th className={ADMIN_TH}>Admin</th>
                                      <th className={ADMIN_TH}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                      // Loading skeletons
                                      [...Array(5)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 mr-3" />
                                              <div>
                                                <div className="h-4 bg-gray-100 w-24 mb-1" />
                                                <div className="h-3 bg-gray-100 w-16" />
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-100 w-20" />
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-100 w-16" />
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-2">
                                              <div className="h-8 bg-gray-100 w-20" />
                                              <div className="h-8 bg-gray-100 w-20" />
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      filteredUsers.map((user) => (
                                      <tr key={user.id} className="hover:bg-gray-50/80">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                            <div className="relative group flex-shrink-0 w-10 h-10 overflow-hidden mr-3 border border-gray-100 bg-gray-50">
                                              {user.avatar_url ? (
                                                <>
                                                  <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    className="w-10 h-10 object-cover"
                                                  />
                                                  <div className="absolute bottom-0 right-0 z-10 scale-75 origin-bottom-right opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                                    <PhotoDownloadButton
                                                      imageUrl={user.avatar_url}
                                                      fileName={`${user.full_name.replace(/\s+/g, '_')}-kso-admin.jpg`}
                                                      tone="onLight"
                                                      size="sm"
                                                    />
                                                  </div>
                                                </>
                                              ) : (
                                                <div className="w-10 h-10 flex items-center justify-center">
                                                  <span className="text-xs font-black text-gray-400">
                                                    {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <div>
                                              <div className="text-sm font-semibold text-black tracking-tight">
                                                {user.full_name}
                                              </div>
                                              {user.username && (
                                                <div className="text-xs text-gray-400">@{user.username}</div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className="inline-block border border-gray-200 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-700">
                                            {user.user_type?.replace('_', ' ')}
                                          </span>
                                          {user.board_position && (
                                            <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mt-1.5">
                                              {user.board_position}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span
                                            className={`inline-block border px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase ${
                                              user.is_admin
                                                ? 'border-[#CD2E3A]/40 text-[#CD2E3A]'
                                                : 'border-gray-200 text-gray-500'
                                            }`}
                                          >
                                            {user.is_admin ? 'Admin' : 'Member'}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex flex-wrap gap-2">
                                            <button
                                              type="button"
                                              onClick={() => updateUserStatus(user.id, { is_admin: !user.is_admin })}
                                              disabled={updatingUser === user.id}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                                            >
                                              {updatingUser === user.id ? '…' : user.is_admin ? 'Remove admin' : 'Make admin'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateUserStatus(user.id, {
                                                  user_type: user.user_type === 'board_member' ? 'undergrad' : 'board_member',
                                                })
                                              }
                                              disabled={updatingUser === user.id}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                                            >
                                              {updatingUser === user.id
                                                ? '…'
                                                : user.user_type === 'board_member'
                                                  ? 'Remove board'
                                                  : 'Make board'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => openProfileModal(user.user_id)}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors"
                                            >
                                              Profile
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => openDeleteUserModal(user)}
                                              disabled={user.is_admin || user.user_id === profile?.user_id}
                                              className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border transition-colors ${
                                                user.is_admin || user.user_id === profile?.user_id
                                                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                                  : 'border-[#CD2E3A]/30 text-[#CD2E3A] hover:bg-[#CD2E3A] hover:text-white'
                                              }`}
                                              title={
                                                user.is_admin
                                                  ? 'Cannot delete admin users'
                                                  : user.user_id === profile?.user_id
                                                    ? 'Cannot delete your own account'
                                                    : 'Delete user'
                                              }
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
                              <div className="text-center py-16 border-t border-gray-100">
                                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-2">No results</p>
                                <p className="text-sm text-gray-500">No users match your search or filter.</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Board Positions - Draggable Cards */}
                        {activeTab === 'board' && (
                          <>
                            {boardLoading ? (
                              <div className={`${ADMIN_TABLE_WRAP} p-12`}>
                                <div className="text-center">
                                  <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                  <p className="mt-4 text-sm text-gray-400">Loading board positions…</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-500 mb-6 max-w-2xl">
                                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black">Reorder</span>
                                  {' — '}Drag cards to change order. Order follows left to right, then the next row.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {localBoardPositions.map((position, index) => (
                                      <div
                                        key={position.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white border p-4 transition-all duration-200 cursor-move ${
                                          draggedIndex === index
                                            ? 'opacity-40 border-black scale-[0.98]'
                                            : dragOverIndex === index
                                            ? 'border-black ring-1 ring-black/10'
                                            : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                                          <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing text-gray-400">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1 .001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                                            </svg>
                                          </div>
                                          <span className="text-[10px] font-mono tabular-nums text-gray-300">
                                            {String(index + 1).padStart(2, '0')}
                                          </span>
                                        </div>

                                        <div className="mb-3">
                                          <label className="block text-[10px] tracking-[0.14em] uppercase text-gray-400 font-medium mb-1.5">Role</label>
                                          <input
                                            type="text"
                                            value={position.role}
                                            onChange={(e) => updateLocalPosition(position.id, { role: e.target.value })}
                                            className={`${ADMIN_FIELD} py-2 text-xs font-semibold`}
                                            placeholder="Role title"
                                          />
                                        </div>

                                        <div className="mb-3">
                                          <label className="block text-[10px] tracking-[0.14em] uppercase text-gray-400 font-medium mb-1.5">Username</label>
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
                                              className={`${ADMIN_FIELD} py-2 text-xs flex-1`}
                                            />
                                            {position.username && (
                                              <span className="text-[10px] text-gray-400 shrink-0">✓</span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                          <span
                                            className={`text-[10px] font-semibold tracking-[0.12em] uppercase ${
                                              position.is_active ? 'text-black' : 'text-gray-400'
                                            }`}
                                          >
                                            {position.is_active ? 'Active' : 'Inactive'}
                                          </span>
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              onClick={() => updateLocalPosition(position.id, { is_active: !position.is_active })}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2 py-1.5 border border-gray-200 hover:border-black transition-colors"
                                              title={position.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                              {position.is_active ? 'Off' : 'On'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => deleteLocalPosition(position.id)}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2 py-1.5 border border-[#CD2E3A]/30 text-[#CD2E3A] hover:bg-[#CD2E3A] hover:text-white transition-colors"
                                              title="Remove position"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={addBoardPosition}
                                      disabled={addingPosition}
                                      className="border border-dashed border-gray-200 bg-gray-50/50 p-4 transition-all min-h-[160px] flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {addingPosition ? (
                                        <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <>
                                          <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                          </svg>
                                          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500">Add position</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                {localBoardPositions.length > 0 && (
                                  <p className="mt-6 text-[10px] tracking-[0.18em] uppercase text-gray-400 font-medium">
                                    {localBoardPositions.filter((p) => p.is_active).length} active · {localBoardPositions.length} total
                                  </p>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Sync Products Tab */}
                        {activeTab === 'sync' && (
                          <>
                            <div className="mb-10">
                              <p className={ADMIN_SECTION_TITLE}>Shop</p>
                              <h2 className={ADMIN_HEADING}>Printful → Stripe</h2>
                              <p className={ADMIN_LEAD}>
                                Preview products from Printful, then sync to Stripe for the shop. Syncing removes orphaned Stripe products that no longer exist in Printful.
                              </p>

                              {syncError && (
                                <div className={ADMIN_ALERT_ERR}>
                                  <p className="text-[#CD2E3A] text-sm">{syncError}</p>
                                </div>
                              )}

                              <div className="border border-gray-100 p-6 mb-8 space-y-3">
                                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold mb-2">How it works</p>
                                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                                  <li>Preview — load Printful catalog (read-only).</li>
                                  <li>Review — check names, variants, and prices in the grid.</li>
                                  <li>Sync — push to Stripe and clean up removed SKUs.</li>
                                </ol>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                                <button
                                  type="button"
                                  onClick={fetchProductsFromPrintful}
                                  disabled={previewLoading}
                                  className={`${ADMIN_BTN_OUTLINE} flex-1`}
                                >
                                  {previewLoading ? 'Loading…' : 'Preview from Printful'}
                                </button>

                                <button
                                  type="button"
                                  onClick={syncProductsToStripe}
                                  disabled={syncLoading || syncProducts.length === 0}
                                  className={`${ADMIN_BTN_PRIMARY} flex-1`}
                                >
                                  {syncLoading ? 'Syncing…' : 'Sync to Stripe'}
                                </button>
                              </div>
                            </div>

                            {/* Products from Printful */}
                            {syncProducts.length > 0 && (
                              <div className="mb-10">
                                <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-3">
                                  Printful ({syncProducts.length})
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {syncProducts.map((product, index) => (
                                    <div key={index} className="border border-gray-100 bg-white overflow-hidden flex flex-col">
                                      <div className="relative group h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                                        {(() => {
                                          const displayImage = getProductDisplayImage(product);
                                          return displayImage ? (
                                            <>
                                              <img
                                                src={displayImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                              />
                                              <div className="absolute bottom-2 right-2 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                                <PhotoDownloadButton
                                                  imageUrl={displayImage}
                                                  fileName={`${String(product.name).replace(/\s+/g, '-')}-sync-preview.jpg`}
                                                  tone="onLight"
                                                  size="sm"
                                                />
                                              </div>
                                            </>
                                          ) : (
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">No image</span>
                                          );
                                        })()}
                                      </div>

                                      <div className="p-4 flex flex-col flex-1">
                                        <h4 className="text-sm font-bold text-black tracking-tight mb-2">{product.name}</h4>
                                        <div className="space-y-1 text-xs text-gray-500 mb-4 flex-1">
                                          <p>ID: {product.id}</p>
                                          <p>Variants: {product.variants}</p>
                                          <p>Synced: {product.synced}</p>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mb-3">
                                          <span className="text-sm font-black text-black">
                                            ${product.retail_price ? product.retail_price.toFixed(2) : 'N/A'}
                                          </span>
                                          <span className="text-[10px] tracking-[0.12em] uppercase text-gray-400">
                                            {product.is_ignored ? 'Ignored' : 'Active'}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => openProductPreview(product)}
                                          className={`${ADMIN_BTN_OUTLINE} w-full py-2.5`}
                                        >
                                          Preview
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Synced Products */}
                            {syncedProducts.length > 0 && (
                              <div className="mb-8">
                                <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-3">
                                  Synced ({syncedProducts.length})
                                </p>
                                <div className="border border-gray-100 divide-y divide-gray-100">
                                  {syncedProducts.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center px-4 py-3 text-sm">
                                      <span className="font-medium text-black">{item.product?.name || 'Product'}</span>
                                      <span className="text-gray-600 tabular-nums">
                                        ${item.priceDetails?.amount ? item.priceDetails.amount.toFixed(2) : 'N/A'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-4">Products are live in Stripe for checkout.</p>
                              </div>
                            )}

                            {process.env.NODE_ENV === 'development' && (
                              <details className="mt-8 border border-gray-100 p-4">
                                <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500">
                                  Debug
                                </summary>
                                <div className="mt-4 space-y-4">
                                  {syncProducts.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-2">Printful payload</p>
                                      <pre className="text-xs bg-gray-50 p-3 border border-gray-100 overflow-auto max-h-40">
                                        {JSON.stringify(syncProducts, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {syncedProducts.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-2">Sync result</p>
                                      <pre className="text-xs bg-gray-50 p-3 border border-gray-100 overflow-auto max-h-40">
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
                            <div className="mb-10">
                              <p className={ADMIN_SECTION_TITLE}>Fulfillment</p>
                              <h2 className={ADMIN_HEADING}>Orders</h2>
                              <p className={ADMIN_LEAD}>
                                Stripe checkout sessions and fulfillment status. Use this list to confirm payments and Printful handoff.
                              </p>
                            </div>

                            <div className={ADMIN_TABLE_WRAP}>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr>
                                      <th className={ADMIN_TH}>Order</th>
                                      <th className={ADMIN_TH}>Customer</th>
                                      <th className={ADMIN_TH}>Total</th>
                                      <th className={ADMIN_TH}>Status</th>
                                      <th className={ADMIN_TH}>Date</th>
                                      <th className={ADMIN_TH}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {ordersLoading ? (
                                      [...Array(3)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                          <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 w-20" />
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 w-32" />
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 w-14" />
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-100 w-24" />
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 w-20" />
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 w-16" />
                                          </td>
                                        </tr>
                                      ))
                                    ) : orders.length === 0 ? (
                                      <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-2">No orders</p>
                                          <p className="text-sm text-gray-500">Purchases will show here after checkout completes.</p>
                                        </td>
                                      </tr>
                                    ) : (
                                      orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/80">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">
                                            …{order.stripe_session_id.slice(-8)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-black tracking-tight">
                                              {order.customer_name || '—'}
                                            </div>
                                            <div className="text-xs text-gray-400">{order.customer_email}</div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black tabular-nums">
                                            ${order.total_amount.toFixed(2)}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-block border border-gray-200 px-2 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-700">
                                              {order.status}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 tabular-nums">
                                            {new Date(order.created_at).toLocaleDateString()}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                              type="button"
                                              onClick={() => {}}
                                              className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 hover:text-black transition-colors"
                                            >
                                              Details
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
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-[70] p-4">
          <div className="bg-white max-w-md w-full border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400">Delete user</h2>
              <button
                type="button"
                onClick={closeDeleteUserModal}
                className="p-1 text-gray-400 hover:text-black transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 w-12 h-12 overflow-hidden mr-4 border border-gray-100 bg-gray-50">
                  {deleteUserModal.user.avatar_url ? (
                    <img
                      src={deleteUserModal.user.avatar_url}
                      alt={deleteUserModal.user.full_name}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <span className="text-sm font-black text-gray-400">
                        {deleteUserModal.user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-black tracking-tight">{deleteUserModal.user.full_name}</h3>
                  {deleteUserModal.user.username && (
                    <p className="text-xs text-gray-400">@{deleteUserModal.user.username}</p>
                  )}
                </div>
              </div>

              <div className={ADMIN_ALERT_ERR}>
                <p className="text-sm text-[#CD2E3A] font-medium mb-1">This cannot be undone</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Permanently removes the account and associated data. The user will lose access immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeDeleteUserModal}
                  className={`${ADMIN_BTN_OUTLINE} flex-1`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteUser(deleteUserModal.user!.id)}
                  disabled={deletingUser === deleteUserModal.user!.id}
                  className={`${ADMIN_BTN_DANGER} flex-1`}
                >
                  {deletingUser === deleteUserModal.user!.id ? 'Deleting…' : 'Delete user'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 