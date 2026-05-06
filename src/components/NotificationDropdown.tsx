"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Clock, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: string;
  type: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NEW_REQUEST";
  message: string;
  time: string;
  isRead: boolean;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching notifications or fetch from an API
  useEffect(() => {
    async function fetchNotifications() {
      // In a real app, this would be an API call
      // For now, let's mock some based on the current context
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "CONFIRMED",
          message: "Sir Matthew has confirmed your thesis consultation.",
          time: "2 mins ago",
          isRead: false,
        },
        {
          id: "2",
          type: "COMPLETED",
          message: "Session completed. View lecturer notes in history.",
          time: "1 hour ago",
          isRead: true,
        },
        {
          id: "3",
          type: "NEW_REQUEST",
          message: "New booking request from Yeremia for Project discussion.",
          time: "3 hours ago",
          isRead: true,
        }
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group">
        <Bell className="h-5 w-5 text-gray-400 group-hover:text-[#5A2D82]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white shadow-2xl rounded-3xl border-none" align="end">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-sm font-black text-[#1A1A1A] tracking-tight">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-red-50 text-[10px] font-black text-red-600 uppercase">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="h-5 w-5 border-2 border-[#5A2D82]/20 border-t-[#5A2D82] rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-8 w-8 text-gray-100 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer",
                    !n.isRead && "bg-blue-50/30"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center",
                    n.type === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" :
                    n.type === "CANCELLED" ? "bg-red-50 text-red-600" :
                    n.type === "COMPLETED" ? "bg-orange-50 text-orange-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {n.type === "CONFIRMED" ? <CheckCircle2 className="h-4 w-4" /> :
                     n.type === "CANCELLED" ? <X className="h-4 w-4" /> :
                     n.type === "COMPLETED" ? <Clock className="h-4 w-4" /> :
                     <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                  </div>
                  {!n.isRead && (
                    <div className="h-2 w-2 rounded-full bg-[#1E5BFF] shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-gray-50">
          <button className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#5A2D82] transition-colors">
            View all activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
