"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth-context";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.87 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  const { user, loading, googleLoginUrl, loginWithPassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/profile");
  }, [loading, user, router]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError(null);
    try {
      await loginWithPassword(email, password);
      router.replace("/profile");
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[440px] flex-col justify-center px-6 py-14">
      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-8">
        <div className="mb-7 text-center">
          <div className="font-display text-2xl font-extrabold text-purple-700">Shop Hemu</div>
          <h1 className="mt-3 text-xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-[13px] text-gray-500">Log in to continue shopping</p>
        </div>

        <a
          href={googleLoginUrl}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E4F4] py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#F8F8FC]"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <button
          type="button"
          onClick={() => setShowStaffLogin((v) => !v)}
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-purple-700"
        >
          Staff login
          <ChevronDown size={14} className={`transition-transform ${showStaffLogin ? "rotate-180" : ""}`} />
        </button>

        {showStaffLogin && (
          <form onSubmit={handleStaffLogin} className="mt-4 flex flex-col gap-4 border-t border-[#EFEDF8] pt-5">
            <p className="text-[12px] text-gray-400">
              For sub-admin accounts created by the master admin. Customers should use Google above.
            </p>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5">
                <Mail size={16} className="text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Password</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5">
                <Lock size={16} className="text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>
            {staffError && <p className="text-[12.5px] text-red-500">{staffError}</p>}
            <Button className={`w-full justify-center ${staffLoading ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
              {staffLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
