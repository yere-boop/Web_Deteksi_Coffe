import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { GridPattern } from "@/components/ui/grid-pattern";

export default async function Home() {
  const session = await auth();

  // If user is already authenticated, redirect them to their specific dashboard
  if (session?.user) {
    if (session.user.role === "LECTURER") {
      redirect("/dashboard/lecturer");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F5F5F5] flex flex-col justify-center overflow-hidden selection:bg-[#1E5BFF]/20">
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
        ]}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-[#1E5BFF] animate-pulse"></span>
          <span className="text-[11px] font-semibold tracking-widest text-[#1E5BFF] uppercase">AcadConsult 2.0 is Live</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#1A1A1A] mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
          Academic consultations, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E5BFF] via-[#5A2D82] to-[#1E5BFF] animate-gradient-x">
            intelligently queued.
          </span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
          Experience a frictionless scheduling platform designed for modern universities. 
          Our algorithmic queue prioritizes urgency, eliminates overlap, and respects lecturer availability seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
          <Link
            href="/login"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-[#1E5BFF] px-8 font-medium text-white transition-all duration-300 hover:bg-[#1546CC] hover:ring-2 hover:ring-[#1E5BFF]/50 hover:ring-offset-2 hover:ring-offset-[#F5F5F5] shadow-lg shadow-[#1E5BFF]/25"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-10 bg-white/20" />
            </div>
            <span className="relative text-base font-semibold">Get Started</span>
          </Link>
          <a
            href="#features"
            className="inline-flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:text-[#1A1A1A] shadow-sm"
          >
            View Demo
          </a>
        </div>
      </div>
      
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-[300px] bg-[#1E5BFF]/10 blur-[140px] rounded-full pointer-events-none opacity-70" />
    </div>
  );
}
