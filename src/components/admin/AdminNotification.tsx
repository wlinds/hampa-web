// src/components/admin/AdminNotification.tsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getPendingUsers } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminNotification: React.FC = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.profile?.role === 'admin') {
      fetchPendingCount();
      
      // Check for pending users every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingCount = async () => {
    try {
      const pendingUsers = await getPendingUsers();
      setPendingCount(pendingUsers.length);
    } catch (error) {
      console.error('Error fetching pending users count:', error);
    }
  };

  // Only show for admins
  if (user?.profile?.role !== 'admin' || pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-hemp-600 text-white p-3 rounded-lg shadow-lg border-l-4 border-yellow-400">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-sm font-medium">
              {pendingCount} användare väntar på godkännande
            </p>
            <a
              href="/admin"
              className="text-xs text-hemp-200 hover:text-white underline"
            >
              Gå till adminpanel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;