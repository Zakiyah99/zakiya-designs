import { useState, useMemo } from "react";
import {
  HiOutlineTruck,
  HiOutlineTicket,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { supabase } from "../services/supabase";

const STATUS_FLOW = [
  { key: "pending", label: "Received" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function normalizeStatus(status) {
  const s = (status || "").toLowerCase();
  if (s === "cancelled" || s === "canceled") return { stepIndex: -1, label: "Cancelled", variant: "danger" };
  const idx = STATUS_FLOW.findIndex((x) => x.key === s);
  if (idx >= 0) return { stepIndex: idx, label: STATUS_FLOW[idx].label, variant: "ok" };
  return { stepIndex: 0, label: status || "In progress", variant: "ok" };
}

function StatusTracker({ status }) {
  const { stepIndex, label, variant } = normalizeStatus(status);

  if (variant === "danger") {
    return (
      <div className="rounded-xl border border-red-200/80 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-4 py-3">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Order {label}</p>
        <p className="text-xs text-red-600/90 dark:text-red-400/80 mt-0.5">This order is no longer active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-earth-200/50">Progress</p>
      <div className="flex items-center justify-between gap-1">
        {STATUS_FLOW.map((step, i) => {
          const done = stepIndex > i || (stepIndex === i && i === STATUS_FLOW.length - 1);
          const current = stepIndex === i && i < STATUS_FLOW.length - 1;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center min-w-0">
              <div
                className={`flex size-9 sm:size-10 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                    : current
                      ? "border-primary bg-primary/15 text-primary ring-4 ring-primary/10"
                      : "border-earth-200 dark:border-earth-700 text-slate-300 dark:text-earth-600"
                }`}
              >
                {done ? (
                  <HiOutlineCheckCircle className="w-5 h-5" />
                ) : current ? (
                  <HiOutlineClock className="w-5 h-5 animate-pulse" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 hidden sm:block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-center truncate w-full ${
                  done || current ? "text-slate-800 dark:text-earth-100" : "text-slate-400 dark:text-earth-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-earth-200">
        Current status: <span className="text-primary font-bold capitalize">{label}</span>
      </p>
    </div>
  );
}

export function TrackOrderSection() {
  const [trackNumber, setTrackNumber] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");

  const formattedTotal = useMemo(() => {
    if (!trackResult?.total_amount) return null;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
      Number(trackResult.total_amount),
    );
  }, [trackResult]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackResult(null);
    const num = trackNumber.trim().toUpperCase();
    if (!num) {
      setTrackError("Please enter your order number.");
      return;
    }
    setTrackLoading(true);
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total_amount, created_at")
      .eq("order_number", num)
      .maybeSingle();

    if (error) {
      setTrackError("Could not load order. Try again.");
      setTrackLoading(false);
      return;
    }
    if (!order) {
      setTrackError("No order matches that number. Check the code on your receipt or confirmation email.");
      setTrackLoading(false);
      return;
    }

    const { data: details } = await supabase.from("order_details").select("*").eq("order_id", order.id);
    setTrackResult({ ...order, details: details || [] });
    setTrackLoading(false);
  };

  return (
    <section id="track" className="relative py-20 lg:py-28 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(150,114,89,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(150,114,89,0.12),transparent)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/20">
              <HiOutlineSparkles className="w-4 h-4" />
              Order tracking
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Know exactly{" "}
                <span className="text-primary italic font-light font-serif">where</span> your piece is
              </h2>
              <p className="mt-5 text-lg text-slate-600 dark:text-earth-200/75 leading-relaxed max-w-lg">
                Use the number from your email or receipt to see status and line items. No login required.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                { icon: HiOutlineShieldCheck, text: "Lookup with your order number only." },
                { icon: HiOutlineCube, text: "Full item list and totals." },
                { icon: HiOutlineTruck, text: "Tracking from received to delivered." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-earth-900 shadow-sm ring-1 ring-earth-200/80 dark:ring-earth-800 text-primary">
                    <Icon className="w-5 h-5" />
                  </span>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-earth-200/80 leading-snug pt-2">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <div
                className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-primary/35 via-transparent to-primary/15 opacity-60 dark:opacity-40 blur-sm"
                aria-hidden
              />
              <div className="relative rounded-3xl border border-earth-200/90 dark:border-earth-800 bg-white/90 dark:bg-earth-900/85 backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(42,31,26,0.18)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                      <HiOutlineTruck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Track your order</h3>
                      <p className="text-sm text-slate-500 dark:text-earth-200/60 mt-1">
                        Example format: <span className="font-mono text-slate-700 dark:text-earth-200">ZK-12345</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleTrack} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 group">
                        <HiOutlineTicket className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-earth-50 dark:bg-earth-950/50 border border-earth-200/90 dark:border-earth-700 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono text-sm tracking-wide uppercase"
                          placeholder="ORDER NUMBER"
                          value={trackNumber}
                          onChange={(e) => setTrackNumber(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={trackLoading}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-60 disabled:pointer-events-none min-h-[3.25rem]"
                      >
                        {trackLoading ? (
                          <>
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Searching
                          </>
                        ) : (
                          <>
                            Track now
                            <HiOutlineMagnifyingGlass className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                    {trackError && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 px-4 py-3">
                        <span className="shrink-0 mt-0.5">•</span>
                        {trackError}
                      </p>
                    )}
                  </form>

                  {trackResult && (
                    <div className="mt-10 pt-8 border-t border-earth-200/80 dark:border-earth-800 space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-earth-500">
                            Order reference
                          </p>
                          <p className="font-mono text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {trackResult.order_number}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-earth-200/50 mt-2">
                            Placed{" "}
                            {trackResult.created_at
                              ? new Date(trackResult.created_at).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                        {formattedTotal && (
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-earth-500">
                              Total
                            </p>
                            <p className="text-2xl font-black text-primary mt-1">{formattedTotal}</p>
                          </div>
                        )}
                      </div>

                      <StatusTracker status={trackResult.status} />

                      {trackResult.details?.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-earth-500 mb-3">
                            Items
                          </p>
                          <ul className="rounded-2xl border border-earth-200/80 dark:border-earth-800 divide-y divide-earth-100 dark:divide-earth-800/80 overflow-hidden bg-earth-50/50 dark:bg-earth-950/30">
                            {trackResult.details.map((d) => (
                              <li
                                key={d.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3.5 text-sm"
                              >
                                <span className="text-slate-800 dark:text-earth-100 font-medium">
                                  <span className="text-primary/90 font-semibold">{d.product_type}</span>
                                  {d.description ? (
                                    <span className="text-slate-600 dark:text-earth-200/70 font-normal">
                                      {" "}
                                      · {d.description}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="font-mono text-slate-900 dark:text-white font-semibold tabular-nums">
                                  {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
                                    Number(d.line_total),
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
