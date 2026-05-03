"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";

import { GridPattern } from "@/components/ui/grid-pattern";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isLogin) {
      startTransition(async () => {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/");
          router.refresh();
        }
      });
    } else {
      startTransition(async () => {
        const res = await registerUser(formData);
        if (res?.error) {
          setError(res.error);
        } else {
          // Auto sign in after registration
          const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (signInRes?.error) {
            setError("Account created, but auto-login failed. Please sign in manually.");
            setIsLogin(true);
          } else {
            router.push("/");
            router.refresh();
          }
        }
      });
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none transition-all focus:border-[#1E5BFF]/50 focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden selection:bg-[#1E5BFF]/20">
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
        ]}
        className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 space-y-8 rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-xl shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#1E5BFF] to-transparent opacity-80" />
        
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E5BFF]/10 text-[#1E5BFF] border border-[#1E5BFF]/20 shadow-[0_0_40px_-10px_rgba(30,91,255,0.2)]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isLogin ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              )}
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AcadConsult</h1>
          <p className="text-sm text-gray-500 font-medium">
            {isLogin ? "Welcome back! Sign in to continue." : "Create a new account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <input name="name" type="text" required className={inputClass} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Role</label>
                  <select name="role" required className={inputClass}>
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Department</label>
                  <input name="department" type="text" className={inputClass} placeholder="e.g. CS" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Email</label>
              <input name="email" type="email" required className={inputClass} placeholder="you@university.edu" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest pl-1">Password</label>
              <input name="password" type="password" required className={inputClass} placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="group relative w-full h-12 flex items-center justify-center overflow-hidden rounded-xl bg-[#1E5BFF] px-4 text-sm font-semibold text-white transition-all hover:bg-[#1546CC] disabled:opacity-50 disabled:cursor-not-allowed hover:ring-2 hover:ring-[#1E5BFF]/30 hover:ring-offset-2 hover:ring-offset-white shadow-md shadow-[#1E5BFF]/20"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <span className="relative">
              {isPending ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Sign Up")}
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-[#5A2D82] hover:text-[#3B1D56] font-semibold hover:underline transition-all underline-offset-4"
            type="button"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>

      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#1E5BFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#FFC107]/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
