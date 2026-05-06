"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  UserCog,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Bell,
  ArrowUpRight,
  TrendingUp,
  FileText,
  CheckCircle2
} from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { LogoutButton } from "@/components/LogoutButton";
import { GridPattern } from "@/components/ui/grid-pattern";
import { updateUserRole, deleteUser } from "@/app/actions/admin";
import { useToast } from "@/components/ui/toast-provider";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface AdminDashboardClientProps {
  user: any;
  stats: {
    totalUsers: number;
    totalBookings: number;
    completedBookings: number;
    lecturersCount: number;
  };
  initialUsers: any[];
}

export function AdminDashboardClient({ user, stats, initialUsers }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports">("overview");
  const [users, setUsers] = useState(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  async function handleRoleUpdate(userId: string, currentRole: string) {
    const newRole: Role = currentRole === "STUDENT" ? "LECTURER" : "STUDENT";
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast(`User role updated to ${newRole}`, "success");
    } else {
      toast(result.error || "Failed to update role", "error");
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    const result = await deleteUser(userId);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast("User deleted successfully", "success");
    } else {
      toast(result.error || "Failed to delete user", "error");
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#1A1A1A] selection:bg-[#1E5BFF]/20 overflow-hidden">
      <GridPattern
        squares={[[4, 4], [5, 1], [8, 2], [10, 10], [12, 15]]}
        className="[mask-image:radial-gradient(800px_circle_at_top,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />
      
      <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-[#1E5BFF]/5 blur-[150px] rounded-full pointer-events-none fixed" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tighter text-[#1A1A1A] leading-none uppercase">ADMIN</h1>
                <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">AcadConsult Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <NotificationDropdown />
              <div className="w-px h-6 bg-gray-200" />
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 grid gap-8 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileCard 
              name={user.name || "Admin"} 
              role="ADMIN" 
              department="System Admin" 
              stats={{ total: stats.totalUsers, completed: stats.completedBookings }}
            />
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                  activeTab === "overview" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-white hover:text-gray-900"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Global Overview
              </button>
              <button 
                onClick={() => setActiveTab("users")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                  activeTab === "users" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-white hover:text-gray-900"
                )}
              >
                <Users className="h-4 w-4" />
                User Management
              </button>
              <button 
                onClick={() => setActiveTab("reports")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                  activeTab === "reports" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-white hover:text-gray-900"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                System Reports
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {([
                    { label: "Total Users", val: stats.totalUsers, Icon: Users, color: "blue" },
                    { label: "Bookings", val: stats.totalBookings, Icon: FileText, color: "emerald" },
                    { label: "Completed", val: stats.completedBookings, Icon: CheckCircle2, color: "orange" },
                    { label: "Lecturers", val: stats.lecturersCount, Icon: GraduationCap, color: "purple" },
                  ] as const).map((s) => (
                    <div key={s.label} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 bg-gray-50")}>
                        <s.Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                      <h4 className="text-2xl font-black text-[#1A1A1A] mt-1">{s.val}</h4>
                    </div>
                  ))}
                </div>

                <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">System Activity</h2>
                      <p className="text-xs text-gray-400 mt-1">Overview of recent platform usage and trends.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest">
                      View full report <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="h-48 flex items-end gap-2 px-2">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 60, 85, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 group relative">
                        <div 
                          className="w-full bg-gray-100 rounded-t-lg transition-all duration-500 group-hover:bg-gray-900 group-hover:scale-y-110" 
                          style={{ height: `${h}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md font-bold">
                          {h}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between px-2 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </div>
                </section>
              </>
            )}

            {activeTab === "users" && (
              <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">User Management</h2>
                    <p className="text-xs text-gray-400 mt-1">Total {users.length} users registered in the system.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full md:w-64 pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                        <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-xs uppercase">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-black text-[#1A1A1A]">{u.name}</p>
                                <p className="text-[10px] text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                              u.role === "ADMIN" ? "bg-gray-900 text-white border-gray-900" :
                              u.role === "LECTURER" ? "bg-blue-50 text-blue-700 border-blue-100" :
                              "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-[11px] font-bold text-gray-500">{u.department || "—"}</p>
                          </td>
                          <td className="px-8 py-5 text-[10px] text-gray-400 font-medium" suppressHydrationWarning>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.role !== "ADMIN" && (
                                <>
                                  <button 
                                    onClick={() => handleRoleUpdate(u.id, u.role)}
                                    title={u.role === "STUDENT" ? "Promote to Lecturer" : "Revoke to Student"}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-blue-600 transition-all"
                                  >
                                    <UserCog className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-red-600 transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "reports" && (
              <div className="flex flex-col items-center justify-center p-20 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reporting Module</h3>
                <p className="text-[11px] text-gray-400 mt-1">Analytics and data export tools are being prepared.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
