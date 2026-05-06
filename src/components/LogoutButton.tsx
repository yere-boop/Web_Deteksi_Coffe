"use client";

import { logoutUser } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutUser()}
      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-[#1A1A1A] hover:border-gray-300 flex items-center gap-2 shadow-sm"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Log Out
    </button>
  );
}
