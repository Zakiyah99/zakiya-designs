import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PRODUCT_TYPES = ["shirt", "abaya", "shorts", "hijab", "other"];
const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-yellow-500/10 text-yellow-500",
  shipped: "bg-primaryDashboard/10 text-primaryDashboard",
  delivered: "bg-primaryDashboard/10 text-primaryDashboard",
  cancelled: "bg-red-500/10 text-red-500",
};

function generateOrderNumber() {
  return "ZK-" + String(Math.floor(10000 + Math.random() * 90000));
}

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    customer_id: "",
    order_number: "",
    status: "pending",
    notes: "",
    details: [{ product_type: "abaya", description: "", quantity: 1, unit_price: 0, line_total: 0 }],
  });

  useEffect(() => {
    loadOrders();
    supabase.from("customers").select("id, full_name").order("full_name").then(({ data }) => setCustomers(data || []));
  }, []);

  async function loadOrders() {
    const { data } = await supabase.from("orders").select("id, order_number, customer_id, status, total_amount, notes, created_at").order("created_at", { ascending: false });
    const list = data || [];
    const custIds = [...new Set(list.map((o) => o.customer_id))];
    const { data: custs } = await supabase.from("customers").select("id, full_name").in("id", custIds);
    const custMap = Object.fromEntries((custs || []).map((c) => [c.id, c]));
    setOrders(list.map((o) => ({ ...o, customerName: custMap[o.customer_id]?.full_name || "—" })));
    setLoading(false);
  }

  const openCreate = () => {
    setEditing("new");
    setForm({
      customer_id: customers[0]?.id || "",
      order_number: generateOrderNumber(),
      status: "pending",
      notes: "",
      details: [{ product_type: "abaya", description: "", quantity: 1, unit_price: 0, line_total: 0 }],
    });
  };

  const openEdit = async (order) => {
    const { data: details } = await supabase.from("order_details").select("*").eq("order_id", order.id);
    setEditing(order.id);
    setForm({
      customer_id: order.customer_id,
      order_number: order.order_number,
      status: order.status,
      notes: order.notes ?? "",
      details: (details || []).map((d) => ({
        id: d.id,
        product_type: d.product_type,
        description: d.description || "",
        quantity: d.quantity,
        unit_price: Number(d.unit_price),
        line_total: Number(d.line_total),
      })),
    });
    if (!details?.length) {
      setForm((f) => ({ ...f, details: [{ product_type: "abaya", description: "", quantity: 1, unit_price: 0, line_total: 0 }] }));
    }
  };

  const cancel = () => setEditing(null);

  const updateDetail = (index, field, value) => {
    setForm((f) => {
      const details = [...f.details];
      details[index] = { ...details[index], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        const q = field === "quantity" ? value : details[index].quantity;
        const p = field === "unit_price" ? value : details[index].unit_price;
        details[index].line_total = Number(q) * Number(p);
      }
      return { ...f, details };
    });
  };

  const addLine = () => {
    setForm((f) => ({ ...f, details: [...f.details, { product_type: "abaya", description: "", quantity: 1, unit_price: 0, line_total: 0 }] }));
  };

  const removeLine = (index) => {
    if (form.details.length <= 1) return;
    setForm((f) => ({ ...f, details: f.details.filter((_, i) => i !== index) }));
  };

  const totalFromDetails = form.details.reduce((s, d) => s + Number(d.line_total || 0), 0);

  const save = async () => {
    if (!form.customer_id) return;
    const total = totalFromDetails;
    if (editing === "new") {
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert({
          customer_id: form.customer_id,
          order_number: form.order_number,
          status: form.status,
          total_amount: total,
          notes: form.notes || null,
        })
        .select("id")
        .single();
      if (error) {
        alert(error.message);
        return;
      }
      for (const d of form.details) {
        await supabase.from("order_details").insert({
          order_id: newOrder.id,
          product_type: d.product_type,
          description: d.description || null,
          quantity: d.quantity,
          unit_price: d.unit_price,
          line_total: d.quantity * d.unit_price,
        });
      }
    } else {
      await supabase
        .from("orders")
        .update({ customer_id: form.customer_id, status: form.status, total_amount: total, notes: form.notes || null })
        .eq("id", editing);
      const existingIds = form.details.filter((d) => d.id).map((d) => d.id);
      const { data: existing } = await supabase.from("order_details").select("id").eq("order_id", editing);
      const toDelete = (existing || []).filter((r) => !existingIds.includes(r.id)).map((r) => r.id);
      for (const id of toDelete) await supabase.from("order_details").delete().eq("id", id);
      for (const d of form.details) {
        const row = {
          product_type: d.product_type,
          description: d.description || null,
          quantity: d.quantity,
          unit_price: d.unit_price,
          line_total: d.quantity * d.unit_price,
        };
        if (d.id) {
          await supabase.from("order_details").update(row).eq("id", d.id);
        } else {
          await supabase.from("order_details").insert({ ...row, order_id: editing });
        }
      }
    }
    setEditing(null);
    loadOrders();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Orders</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm hover:bg-primaryDashboard/90"
        >
          New Order
        </button>
      </div>

      {editing && (
        <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 space-y-4">
          <h3 className="font-bold">{editing === "new" ? "New Order" : "Edit Order"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order number</label>
              <input
                value={form.order_number}
                onChange={(e) => setForm((f) => ({ ...f, order_number: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
                readOnly={editing !== "new"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Line items</span>
              <button type="button" onClick={addLine} className="text-sm text-primaryDashboard font-bold">+ Add line</button>
            </div>
            <div className="space-y-2">
              {form.details.map((d, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center text-sm">
                  <select
                    value={d.product_type}
                    onChange={(e) => updateDetail(i, "product_type", e.target.value)}
                    className="col-span-2 px-2 py-1.5 rounded border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Description"
                    value={d.description}
                    onChange={(e) => updateDetail(i, "description", e.target.value)}
                    className="col-span-3 px-2 py-1.5 rounded border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
                  />
                  <input
                    type="number"
                    min={1}
                    value={d.quantity}
                    onChange={(e) => updateDetail(i, "quantity", Number(e.target.value) || 0)}
                    className="col-span-1 px-2 py-1.5 rounded border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={d.unit_price || ""}
                    onChange={(e) => updateDetail(i, "unit_price", Number(e.target.value) || 0)}
                    className="col-span-2 px-2 py-1.5 rounded border dark:bg-earth-800 border-earth-200 dark:border-earth-700"
                    placeholder="Price"
                  />
                  <span className="col-span-2 font-medium">${Number(d.line_total || 0).toFixed(2)}</span>
                  <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-red-500">Remove</button>
                </div>
              ))}
            </div>
            <p className="mt-2 font-bold">Total: ${totalFromDetails.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={save} className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm">Save</button>
            <button type="button" onClick={cancel} className="px-4 py-2 rounded-lg border border-earth-200 dark:border-earth-800 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
              <th className="pb-4 px-4">Order</th>
              <th className="pb-4 px-4">Customer</th>
              <th className="pb-4 px-4">Date</th>
              <th className="pb-4 px-4">Amount</th>
              <th className="pb-4 px-4 text-right">Status</th>
              <th className="pb-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
            {orders.map((o) => (
              <tr key={o.id} className="text-sm">
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">#{o.order_number}</td>
                <td className="py-4 px-4 text-slate-700 dark:text-earth-200">{o.customerName}</td>
                <td className="py-4 px-4 text-slate-500 dark:text-earth-200/60">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-4 font-bold">${Number(o.total_amount).toFixed(2)}</td>
                <td className="py-4 px-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button type="button" onClick={() => openEdit(o)} className="text-primaryDashboard font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
