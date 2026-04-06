import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export function FinancialPage() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "", expense_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: orders } = await supabase.from("orders").select("total_amount").neq("status", "cancelled");
    const rev = (orders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0);
    setRevenue(rev);

    const { data: exp } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    setExpenses(exp || []);
    const totExp = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    setTotalExpenses(totExp);
    setLoading(false);
  }

  const openCreate = () => {
    setEditing("new");
    setForm({ description: "", amount: "", category: "", expense_date: new Date().toISOString().slice(0, 10) });
  };

  const openEdit = (e) => {
    setEditing(e.id);
    setForm({
      description: e.description || "",
      amount: e.amount,
      category: e.category || "",
      expense_date: e.expense_date || new Date().toISOString().slice(0, 10),
    });
  };

  const cancel = () => setEditing(null);

  const save = async () => {
    if (!form.description?.trim() || form.amount === "" || Number(form.amount) < 0) return;
    const row = {
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category?.trim() || null,
      expense_date: form.expense_date,
    };
    if (editing === "new") {
      await supabase.from("expenses").insert(row);
    } else {
      await supabase.from("expenses").update(row).eq("id", editing);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    setEditing(null);
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  const balance = revenue - totalExpenses;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Financial</h2>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
          <p className="text-slate-500 dark:text-earth-200/60 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100 text-green-600">${revenue.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
          <p className="text-slate-500 dark:text-earth-200/60 text-sm font-medium">Total Expenses</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100 text-red-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-sm">
          <p className="text-slate-500 dark:text-earth-200/60 text-sm font-medium">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>${balance.toFixed(2)}</p>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">Expenses</h3>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm hover:bg-primaryDashboard/90"
        >
          Add Expense
        </button>
      </div>

      {editing && (
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800">
          <h3 className="font-bold mb-4">{editing === "new" ? "New Expense" : "Edit Expense"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700 sm:col-span-2"
            />
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={save} className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm">Save</button>
            <button type="button" onClick={cancel} className="px-4 py-2 rounded-lg border border-earth-200 dark:border-earth-800 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
              <th className="pb-4 px-4">Date</th>
              <th className="pb-4 px-4">Description</th>
              <th className="pb-4 px-4">Category</th>
              <th className="pb-4 px-4 text-right">Amount</th>
              <th className="pb-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
            {expenses.map((e) => (
              <tr key={e.id} className="text-sm">
                <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{e.expense_date}</td>
                <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">{e.description}</td>
                <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{e.category || "—"}</td>
                <td className="py-4 px-4 text-right font-bold text-red-600">${Number(e.amount).toFixed(2)}</td>
                <td className="py-4 px-4 text-right">
                  <button type="button" onClick={() => openEdit(e)} className="text-primaryDashboard font-medium mr-2">Edit</button>
                  <button type="button" onClick={() => remove(e.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
