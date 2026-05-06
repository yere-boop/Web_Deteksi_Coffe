"use client";

import { User, MapPin, GraduationCap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  name: string;
  role: string;
  department?: string | null;
  nim?: string;
  stats?: {
    total: number;
    completed: number;
  };
}

export function ProfileCard({ name, role, department, nim = "105022110001", stats }: ProfileCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className={cn(
        "h-20 bg-gradient-to-br",
        role === "LECTURER" ? "from-[#1E5BFF] to-[#1546CC]" : "from-[#5A2D82] to-[#3B1E5A]"
      )} />
      <div className="px-5 pb-5">
        <div className="relative -mt-10 mb-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-1 shadow-lg ring-4 ring-[#F5F5F5]">
            <div className={cn(
              "flex h-full w-full items-center justify-center rounded-xl bg-gray-50",
              role === "LECTURER" ? "text-[#1E5BFF]" : "text-[#5A2D82]"
            )}>
              <User className="h-10 w-10" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black tracking-tight text-[#1A1A1A]">{name}</h3>
          <div className="flex items-center gap-2">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              role === "LECTURER" ? "bg-[#1E5BFF]/10 text-[#1E5BFF]" : "bg-[#5A2D82]/10 text-[#5A2D82]"
            )}>
              {role}
            </span>
            <span className="text-[10px] font-mono text-gray-400">ID: {nim.slice(-8)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50">
              <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <span className="font-medium truncate">{department || "General Department"}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <span className="font-medium">Universitas Klabat</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50">
              <Award className={cn("h-3.5 w-3.5", role === "LECTURER" ? "text-[#1E5BFF]" : "text-[#FFC107]")} />
            </div>
            <span className="font-medium">{role === "LECTURER" ? "Faculty Member" : "Active Student"}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className="text-center border-r border-gray-50">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Semua</p>
            <p className="text-sm font-black text-[#1A1A1A]">{stats?.total ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Selesai</p>
            <p className="text-sm font-black text-emerald-600">{stats?.completed ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
