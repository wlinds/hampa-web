// src/components/admin/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { Users, Settings, CheckCircle, XCircle, Crown, User, Mail, Calendar } from 'lucide-react';
import { Profile, getPendingUsers, approveUser, updateUserRole, formatDate } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { Button } from '../ui/Button';

const AdminPanel: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPanelContent />
    </ProtectedRoute>
  );
};

const AdminPanelContent: React.FC = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      await approveUser(userId);
      await fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Fel vid godkännande av användare');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm('Är du säker på att du vill göra denna användare till admin?')) {
      return;
    }

    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      await updateUserRole(userId, 'admin');
      await fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Fel vid uppdatering av användarroll');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-hemp-100 rounded mb-4 w-48 animate-pulse"></div>
            <div className="h-4 bg-hemp-100 rounded w-64 animate-pulse"></div>
          </div>
          
          {/* Pending users skeleton */}
          <LoadingSkeleton type="admin-list" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-hemp-600" />
            <h1 className="text-3xl font-bold text-hemp-900">Adminpanel</h1>
          </div>
          <p className="text-hemp-700">
            Hantera användare och godkänn nya registreringar.
          </p>
        </div>

        {/* Pending Users Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Väntande godkännanden</h2>
                <p className="text-hemp-100 text-sm">
                  {pendingUsers.length} användare väntar på godkännande
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-hemp-100">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-hemp-900 mb-2">
                  Inga väntande godkännanden
                </h3>
                <p className="text-hemp-600">
                  Alla användare är godkända!
                </p>
              </div>
            ) : (
              pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-hemp-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-hemp-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-hemp-900">
                          {pendingUser.full_name || 'Inget namn angivet'}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-hemp-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{pendingUser.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Registrerad {formatDate(pendingUser.created_at)}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Väntar på godkännande
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleMakeAdmin(pendingUser.id)}
                        loading={processingUsers.has(pendingUser.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300"
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Gör till admin
                      </Button>

                      <Button
                        onClick={() => handleApproveUser(pendingUser.id)}
                        loading={processingUsers.has(pendingUser.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Godkänn
                      </Button>

                      <Button
                        disabled={processingUsers.has(pendingUser.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Avslå
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-semibold mb-4">Admin-information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Dina behörigheter</h4>
              <ul className="space-y-1 text-hemp-100">
                <li>• Godkänna nya användare</li>
                <li>• Tilldela admin-roller</li>
                <li>• Hantera blogginlägg</li>
                <li>• Administrera systemet</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Inloggad som</h4>
              <div className="text-hemp-100">
                <p>{user?.profile?.full_name || user?.email}</p>
                <p className="text-sm">Admin-konto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;