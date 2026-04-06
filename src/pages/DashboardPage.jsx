import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HiOutlineShoppingCart, HiOutlineCreditCard, HiOutlineUserGroup, HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { supabase } from "../services/supabase";

const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-yellow-500/10 text-yellow-500",
  shipped: "bg-primaryDashboard/10 text-primaryDashboard",
  delivered: "bg-primaryDashboard/10 text-primaryDashboard",
  cancelled: "bg-red-500/10 text-red-500",
};

const CHART_STROKE = "#13ec5b";

function monthlyNewCustomersSeries(rows, monthsBack = 12) {
  const now = new Date();
  const labels = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    });
  }
  const counts = new Map(labels.map((l) => [l.key, 0]));
  for (const row of rows) {
    if (!row?.created_at) continue;
    const dt = new Date(row.created_at);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (counts.has(key)) counts.set(key, counts.get(key) + 1);
  }
  return labels.map(({ key, label }) => ({ label, newCustomers: counts.get(key) }));
}

export function DashboardPage() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, avgOrder: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [growthSeries, setGrowthSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, customersRes, customerDatesRes, detailsRes] = await Promise.all([
        supabase.from("orders").select("id, total_amount, created_at").neq("status", "cancelled"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("created_at"),
        supabase.from("order_details").select("product_type"),
      ]);
      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const customerCount = customersRes.count ?? 0;
      const avgOrder = orders.length ? totalRevenue / orders.length : 0;

      const byType = {};
      (detailsRes.data || []).forEach((d) => {
        byType[d.product_type] = (byType[d.product_type] || 0) + 1;
      });
      const totalDetails = Object.values(byType).reduce((a, b) => a + b, 0);
      const categories = Object.entries(byType)
        .map(([name, count]) => ({ name, pct: totalDetails ? (count / totalDetails) * 100 : 0 }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 4);

      setStats({
        orders: orders.length,
        revenue: totalRevenue,
        customers: customerCount,
        avgOrder,
      });
      setCategoryCounts(categories);
      setGrowthSeries(monthlyNewCustomersSeries(customerDatesRes.data || [], 12));

      const { data: recent } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, customer_id")
        .order("created_at", { ascending: false })
        .limit(5);
      const customerIds = [...new Set((recent || []).map((o) => o.customer_id))];
      const { data: custs } = await supabase.from("customers").select("id, full_name").in("id", customerIds);
      const custMap = Object.fromEntries((custs || []).map((c) => [c.id, c]));
      setRecentOrders(
        (recent || []).map((o) => ({
          ...o,
          customerName: custMap[o.customer_id]?.full_name || "—",
        })),
      );
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Orders", value: stats.orders, Icon: HiOutlineShoppingCart },
          { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, Icon: HiOutlineCreditCard },
          { label: "Active Customers", value: stats.customers, Icon: HiOutlineUserGroup },
          { label: "Avg. Order Value", value: `$${stats.avgOrder.toFixed(2)}`, Icon: HiOutlineArrowTrendingUp },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-primaryDashboard/10 text-primaryDashboard">
                <Icon className="w-5 h-5" />
              </span>
            </div>
            <p className="text-slate-500 dark:text-earth-200/60 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Customer Growth</h3>
          <p className="text-slate-500 dark:text-earth-200/60 text-sm mb-2">New customers per month (last 12 months)</p>
          <div className="h-72 w-full min-w-0 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_STROKE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_STROKE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.25)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "rgb(148 163 184)" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgb(148 163 184 / 0.35)" }}
                />
                <YAxis
                  allowDecimals={false}
                  width={36}
                  tick={{ fontSize: 11, fill: "rgb(148 163 184)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "rgb(148 163 184 / 0.35)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid rgb(226 232 240)",
                    backgroundColor: "rgb(255 255 255 / 0.96)",
                  }}
                  formatter={(value) => [value, "New customers"]}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="newCustomers"
                  name="New customers"
                  stroke={CHART_STROKE}
                  strokeWidth={2}
                  fill="url(#growthFill)"
                  dot={{ fill: CHART_STROKE, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-slate-100">Top Categories</h3>
          <div className="space-y-6">
            {categoryCounts.map(({ name, pct }) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-earth-200">{name}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-earth-100 dark:bg-earth-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryDashboard" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-earth-200 dark:border-earth-800">
            <Link
              to="/dashboard/reports"
              className="block w-full py-2.5 rounded-lg border border-earth-200 dark:border-earth-800 text-sm font-bold text-slate-700 dark:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors text-center"
            >
              View Full Report
            </Link>
          </div>
        </div>
      </section>

      <section className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Orders</h3>
          <Link to="/dashboard/orders" className="text-sm font-bold text-primaryDashboard hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
                <th className="pb-4 px-2">Order ID</th>
                <th className="pb-4 px-2">Customer</th>
                <th className="pb-4 px-2">Date</th>
                <th className="pb-4 px-2">Amount</th>
                <th className="pb-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
              {recentOrders.map((o) => (
                <tr key={o.id} className="text-sm">
                  <td className="py-4 px-2 font-bold text-slate-900 dark:text-slate-100">#{o.order_number}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primaryDashboard/20 flex items-center justify-center text-[10px] font-bold text-primaryDashboard">
                        {(o.customerName || "?")[0]}
                      </div>
                      <span className="text-slate-700 dark:text-earth-200">{o.customerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-slate-500 dark:text-earth-200/60">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-2 font-bold text-slate-900 dark:text-slate-100">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="py-4 px-2 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
