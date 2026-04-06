import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";
import { supabase } from "../services/supabase";
import whiteOnTrans from "../images/white_on_trans.png";
import transBg from "../images/trans_bg.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message || "Invalid credentials.");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primaryDashboard/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primaryDashboard/5 rounded-full blur-[120px]" />
      </div>
      <div className="z-10 w-full max-w-[480px] flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <img
            src={whiteOnTrans}
            alt="Zakiya Design Logo"
            className="hidden dark:block h-20 w-auto object-contain drop-shadow-lg"
          />
          <img
            src={transBg}
            alt="Zakiya Design Logo"
            className="block dark:hidden h-20 w-auto object-contain drop-shadow-lg"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Admin</p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Welcome Back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please enter your credentials to access your dashboard.</p>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</span>
                <div className="relative">
                  <HiOutlineEnvelope className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-4 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primaryDashboard focus:ring-1 focus:ring-primaryDashboard text-slate-900 dark:text-slate-100"
                    placeholder="name@zakiya.design"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</span>
                <div className="relative flex items-stretch">
                  <HiOutlineLockClosed className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primaryDashboard focus:ring-1 focus:ring-primaryDashboard text-slate-900 dark:text-slate-100"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center rounded-lg h-12 px-5 bg-primaryDashboard hover:bg-primaryDashboard/90 text-earth-900 text-base font-bold transition-all shadow-lg shadow-primaryDashboard/20 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Need access? <span className="text-primaryDashboard font-bold">Contact your admin</span>
        </p>
      </div>
    </div>
  );
}
