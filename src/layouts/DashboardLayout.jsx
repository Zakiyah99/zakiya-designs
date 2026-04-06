import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineSquares2X2, HiOutlineUserGroup, HiOutlineShoppingBag, HiOutlineCreditCard, HiOutlineChartBar, HiOutlineUserPlus, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineMagnifyingGlass, HiOutlineBell } from "react-icons/hi2";
import { supabase } from "../services/supabase";
import brandLogo from "../images/white_on_trans.png";

const navItems = [
  { to: "/dashboard", label: "Dashboard", Icon: HiOutlineSquares2X2 },
  { to: "/dashboard/customers", label: "Customers", Icon: HiOutlineUserGroup },
  { to: "/dashboard/orders", label: "Orders", Icon: HiOutlineShoppingBag },
  { to: "/dashboard/financial", label: "Financial", Icon: HiOutlineCreditCard },
  { to: "/dashboard/reports", label: "Reports", Icon: HiOutlineChartBar },
  { to: "/dashboard/admin-users", label: "Admin users", Icon: HiOutlineUserPlus },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data || {}));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <aside className="w-64 flex-shrink-0 bg-earth-900 border-r border-earth-800 hidden md:flex flex-col">
        <div className="relative border-b border-earth-800/90 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_-20%,rgba(150,114,89,0.22),transparent)]"
            aria-hidden
          />
          <div className="relative px-5 pt-7 pb-6 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[9.5rem] mx-auto">
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-16 bg-primary/20 blur-2xl rounded-full opacity-70"
                aria-hidden
              />
              <img
                src={brandLogo}
                alt="Zakiya Design"
                className="relative w-full h-11 object-contain object-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              />
            </div>
            <div
              className="mt-5 h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-primaryDashboard/70 to-transparent opacity-90"
              aria-hidden
            />
            <p className="mt-3.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-earth-200/50">
              Admin Console
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-primaryDashboard text-earth-900 font-semibold" : "text-earth-200 hover:bg-earth-800"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
          <div className="pt-4 pb-2">
            <p className="px-3 text-[10px] uppercase tracking-wider text-earth-200/40 font-bold">Preferences</p>
          </div>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? "bg-primaryDashboard text-earth-900" : "text-earth-200 hover:bg-earth-800"
              }`
            }
          >
            <HiOutlineCog6Tooth className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-earth-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-earth-800/50">
            <div className="size-8 rounded-full bg-primaryDashboard/20 flex items-center justify-center text-primaryDashboard text-xs font-bold">
              {(profile?.full_name || "A")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{profile?.full_name || "Admin"}</p>
              <p className="text-[10px] text-earth-200/60 truncate">{profile?.email || ""}</p>
            </div>
            <button type="button" onClick={handleLogout} className="text-earth-200/40 hover:text-earth-200">
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-earth-200/10 dark:border-earth-800 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden text-slate-600 dark:text-slate-400"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <HiOutlineMagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-10 pr-4 py-2 bg-earth-100 dark:bg-earth-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primaryDashboard w-64"
                placeholder="Search..."
                type="text"
              />
            </div>
            <button type="button" className="p-2 rounded-full hover:bg-earth-200/50 dark:hover:bg-earth-800 text-slate-600 dark:text-slate-400">
              <HiOutlineBell className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
