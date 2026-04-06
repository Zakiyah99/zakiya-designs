import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-yellow-500/10 text-yellow-500",
  shipped: "bg-primaryDashboard/10 text-primaryDashboard",
  delivered: "bg-primaryDashboard/10 text-primaryDashboard",
  cancelled: "bg-red-500/10 text-red-500",
};

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState("customers");
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({ revenue: 0, expenses: 0, balance: 0 });
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const { data: orders } = await supabase.from("orders").select("id, customer_id, order_number, status, total_amount, created_at");
    const ordersList = orders || [];
    const { data: customers } = await supabase.from("customers").select("id, full_name, email");
    const custMap = Object.fromEntries((customers || []).map((c) => [c.id, c]));

    const byCustomer = {};
    ordersList.forEach((o) => {
      if (o.status === "cancelled") return;
      const cid = o.customer_id;
      if (!byCustomer[cid]) byCustomer[cid] = { customer_id: cid, full_name: custMap[cid]?.full_name || "—", email: custMap[cid]?.email || "—", order_count: 0, total_spent: 0, last_order: null };
      byCustomer[cid].order_count += 1;
      byCustomer[cid].total_spent += Number(o.total_amount || 0);
      if (!byCustomer[cid].last_order || new Date(o.created_at) > new Date(byCustomer[cid].last_order)) {
        byCustomer[cid].last_order = o.created_at;
      }
    });
    setCustomerOrders(Object.values(byCustomer).sort((a, b) => b.total_spent - a.total_spent));

    const byStatus = {};
    ordersList.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });
    setOrdersByStatus(Object.entries(byStatus));

    const revenue = ordersList.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const { data: exp } = await supabase.from("expenses").select("amount");
    const expenses = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    setFinancialSummary({ revenue, expenses, balance: revenue - expenses });

    const { data: expList } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    setExpensesList(expList || []);
    setLoading(false);
  }

  if (loading) return <div className="text-slate-500">Loading...</div>;

  const tabs = [
    { id: "customers", label: "Customers & Orders" },
    { id: "status", label: "Order Status" },
    { id: "financial", label: "Financial Report" },
    { id: "expense", label: "Expense Report" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reports</h2>
      <div className="flex gap-2 border-b border-earth-200 dark:border-earth-800">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === id ? "bg-primaryDashboard text-earth-900" : "text-slate-600 dark:text-earth-200 hover:bg-earth-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "customers" && (
        <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
          <h3 className="p-4 font-bold text-slate-900 dark:text-slate-100">Customer details and orders</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
                <th className="pb-4 px-4">Customer</th>
                <th className="pb-4 px-4">Email</th>
                <th className="pb-4 px-4 text-right">Orders</th>
                <th className="pb-4 px-4 text-right">Total spent</th>
                <th className="pb-4 px-4">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
              {customerOrders.map((c) => (
                <tr key={c.customer_id} className="text-sm">
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">{c.full_name}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{c.email}</td>
                  <td className="py-4 px-4 text-right">{c.order_count}</td>
                  <td className="py-4 px-4 text-right font-bold">${c.total_spent.toFixed(2)}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{c.last_order ? new Date(c.last_order).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "status" && (
        <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
          <h3 className="p-4 font-bold text-slate-900 dark:text-slate-100">Orders by status</h3>
          <div className="p-4 space-y-4">
            {ordersByStatus.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[status] || ""}`}>{status}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Financial report</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 dark:text-earth-200/60 text-sm">Total revenue</p>
              <p className="text-2xl font-bold text-green-600">${financialSummary.revenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-earth-200/60 text-sm">Total expenses</p>
              <p className="text-2xl font-bold text-red-600">${financialSummary.expenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-earth-200/60 text-sm">Balance</p>
              <p className={`text-2xl font-bold ${financialSummary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${financialSummary.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "expense" && (
        <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
          <h3 className="p-4 font-bold text-slate-900 dark:text-slate-100">Expense report</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Description</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
              {expensesList.map((e) => (
                <tr key={e.id} className="text-sm">
                  <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{e.expense_date}</td>
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">{e.description}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{e.category || "—"}</td>
                  <td className="py-4 px-4 text-right font-bold text-red-600">${Number(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 border-t border-earth-200 dark:border-earth-800 font-bold">
            Total expenses: ${expensesList.reduce((s, e) => s + Number(e.amount || 0), 0).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
