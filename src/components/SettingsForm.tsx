"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { User, Building, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    department?: string | null;
  };
}

import { useToast } from "@/components/ui/toast-provider";

export function SettingsForm({ user }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
      toast(result.error, "error");
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      toast("Profile updated successfully!", "success");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">Account Settings</h2>
        <p className="text-xs text-gray-500">Update your profile information and preferences</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-xs font-bold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5A2D82] transition-colors">
                <User className="h-4 w-4" />
              </div>
              <input
                name="name"
                defaultValue={user.name || ""}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#5A2D82] focus:ring-4 focus:ring-[#5A2D82]/5 outline-none transition-all text-xs font-semibold"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <input
                value={user.email || ""}
                disabled
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-200 outline-none text-xs font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5A2D82] transition-colors">
                <Building className="h-4 w-4" />
              </div>
              <input
                name="department"
                defaultValue={user.department || ""}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#5A2D82] focus:ring-4 focus:ring-[#5A2D82]/5 outline-none transition-all text-xs font-semibold"
                placeholder="Your department"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#5A2D82] hover:bg-[#4A246B] text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-[#5A2D82]/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
