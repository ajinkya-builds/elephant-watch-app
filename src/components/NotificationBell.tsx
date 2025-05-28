import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityReportService } from '@/services/activity-report.service';
import type { ActivityReport } from '@/types/activity-report';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  activity_id: string | null;
  division_id: string | null;
  range_id: string | null;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activityDetails, setActivityDetails] = useState<ActivityReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  // New: State for division, range, beat name mapping
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [ranges, setRanges] = useState<{ id: string; name: string }[]>([]);
  const [beats, setBeats] = useState<{ id: string; name: string }[]>([]);

  // New: Fetch all divisions, ranges, beats on mount
  useEffect(() => {
    async function fetchMeta() {
      const [divRes, rangeRes, beatRes] = await Promise.all([
        supabase.from('divisions').select('id, name'),
        supabase.from('ranges').select('new_id, name'),
        supabase.from('beats').select('new_id, name'),
      ]);
      if (!divRes.error) setDivisions(divRes.data || []);
      if (!rangeRes.error) setRanges((rangeRes.data || []).map((r: any) => ({ id: r.new_id, name: r.name })));
      if (!beatRes.error) setBeats((beatRes.data || []).map((b: any) => ({ id: b.new_id, name: b.name })));
    }
    fetchMeta();
  }, []);

  // New: Helper functions to get names from IDs
  const getDivisionName = (id?: string | null) => divisions.find(d => d.id === id)?.name || id || '';
  const getRangeName = (id?: string | null) => {
    const found = ranges.find(r => r.id === id || (r as any).new_id === id);
    return found?.name || id || '';
  };
  const getBeatName = (id?: string | null) => beats.find(b => b.id === id)?.name || id || '';

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setActivityDetails(null);
    setModalOpen(true);
    if (notification.activity_id) {
      setActivityLoading(true);
      try {
        const details = await ActivityReportService.getInstance().getById(notification.activity_id);
        setActivityDetails(details);
      } catch (err) {
        toast.error('Failed to load activity details');
      } finally {
        setActivityLoading(false);
      }
    }
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Subscribe to new notifications
      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-12 w-12"
            aria-label="View notifications"
          >
            <Bell className="h-7 w-7" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                      {notification.message}
                    </p>
                    {/* Show summary details with names */}
                    <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                      {notification.division_id && <span>Division: {getDivisionName(notification.division_id)}</span>}
                      {notification.range_id && <span>Range: {getRangeName(notification.range_id)}</span>}
                      {notification.activity_id && <span>Activity: {notification.activity_id}</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Modal for activity details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {activityLoading ? (
            <div className="p-4 text-center text-gray-500">Loading details...</div>
          ) : activityDetails ? (
            <div className="space-y-2">
              {Object.entries(activityDetails).map(([key, value]) => {
                if (value == null || value === '') return null;
                let displayValue = value;
                if (key === 'associated_division' || key === 'associated_division_id') displayValue = getDivisionName(value as string);
                if (key === 'associated_range' || key === 'associated_range_id') displayValue = getRangeName(value as string);
                if (key === 'associated_beat' || key === 'associated_beat_id') displayValue = getBeatName(value as string);
                return (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{typeof displayValue === 'object' && displayValue instanceof Date ? displayValue.toLocaleString() : displayValue.toString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No activity details found for this notification.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 