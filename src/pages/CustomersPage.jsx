import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("customers").select("*").order("full_name");
    setCustomers(data || []);
    setLoading(false);
  }

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing("new");
    setForm({ full_name: "", email: "", phone: "", address: "" });
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      full_name: c.full_name || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
    });
  };

  const cancel = () => {
    setEditing(null);
  };

  const save = async () => {
    if (!form.full_name?.trim() || !form.email?.trim()) return;
    if (editing === "new") {
      await supabase.from("customers").insert(form);
    } else {
      await supabase.from("customers").update(form).eq("id", editing);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setEditing(null);
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customers</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm w-48"
          />
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm hover:bg-primaryDashboard/90"
          >
            Add Customer
          </button>
        </div>
      </div>

      {editing && (
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800">
          <h3 className="font-bold mb-4">{editing === "new" ? "New Customer" : "Edit Customer"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700 sm:col-span-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={save} className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm">
              Save
            </button>
            <button type="button" onClick={cancel} className="px-4 py-2 rounded-lg border border-earth-200 dark:border-earth-800 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
              <th className="pb-4 px-4">Name</th>
              <th className="pb-4 px-4">Email</th>
              <th className="pb-4 px-4">Phone</th>
              <th className="pb-4 px-4">Address</th>
              <th className="pb-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
            {filtered.map((c) => (
              <tr key={c.id} className="text-sm">
                <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">{c.full_name}</td>
                <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{c.email}</td>
                <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{c.phone || "—"}</td>
                <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{c.address || "—"}</td>
                <td className="py-4 px-4 text-right">
                  <button type="button" onClick={() => openEdit(c)} className="text-primaryDashboard font-medium mr-2">Edit</button>
                  <button type="button" onClick={() => remove(c.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
