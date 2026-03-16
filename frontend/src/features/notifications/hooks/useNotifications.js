import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  showDesktopNotification, 
  requestNotificationPermission,
  initializeDesktopNotifications 
} from "../utils/desktopNotifications";

const isMissingNotificationsTableError = (error) => {
  if (!error) return false;

  const message = `${error.message || ""} ${error.hint || ""}`.toLowerCase();
  return error.code === "PGRST205" && message.includes("notifications");
};

/**
 * Hook to fetch and subscribe to real-time notifications
 * @returns {Object} { notifications, loading, error, markAsRead, refreshNotifications }
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableAvailable, setTableAvailable] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) {
        if (isMissingNotificationsTableError(fetchError)) {
          setTableAvailable(false);
          setNotifications([]);
          setError(null);
          return;
        }
        throw fetchError;
      }

      setTableAvailable(true);
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    fetchNotifications();
    
    // Initialize desktop notifications
    initializeDesktopNotifications();

    if (!tableAvailable) {
      return;
    }

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          console.log("New notification received:", payload.new);
          setNotifications((prev) => [payload.new, ...prev]);
          
          // Show desktop notification for new notifications
          try {
            // Request permission if not already granted
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
              await showDesktopNotification(payload.new);
            }
          } catch (error) {
            console.error("Error showing desktop notification:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("Notification updated:", payload.new);
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.notification_id === payload.new.notification_id
                ? payload.new
                : notif
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, tableAvailable]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!tableAvailable) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("notification_id", notificationId);

      if (updateError) throw updateError;

      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );

      console.log(`Notification ${notificationId} marked as read`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Refresh notifications manually
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    refreshNotifications,
  };
};
