import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setListError("");
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("email");
    if (error) {
      setListError(error.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setFormError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    const at = trimmed.indexOf("@");
    if (at > 0 && trimmed.slice(at + 1) === "gmail.com" && trimmed.slice(0, at).length < 6) {
      setFormError(
        "Gmail addresses need at least 6 characters before @ (e.g. zakiya.admin@gmail.com). Or use a non-Gmail address.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user: adminBefore },
      } = await supabase.auth.getUser();

      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email: trimmed,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: trimmed.split("@")[0] || "Admin" },
        },
      });

      if (signErr) {
        setFormError(signErr.message);
        return;
      }

      const newUser = signData?.user;
      let successMsg = "If required, ask the new user to confirm their email before signing in.";

      if (newUser?.id) {
        const { error: profileErr } = await supabase.from("profiles").upsert(
          {
            id: newUser.id,
            email: trimmed,
            full_name: trimmed.split("@")[0] || "Admin",
          },
          { onConflict: "id" },
        );
        if (profileErr) {
          successMsg = `User ${trimmed} was created, but the profile was not saved: ${profileErr.message}`;
        } else {
          successMsg = `${trimmed} can sign in at the login page.`;
        }
      }

      const {
        data: { user: adminAfter },
      } = await supabase.auth.getUser();
      if (adminBefore?.id && adminAfter?.id && adminBefore.id !== adminAfter.id) {
        successMsg = "You are now signed in as the new user. Sign out, then sign in with your admin account.";
      }

      setFormSuccess(successMsg);

      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      setFormError(err.message || "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin users</h2>
        <p className="text-slate-500 dark:text-earth-200/60 text-sm mt-1">
          Create logins and keep the team list in sync with profiles. Turn on email confirmation in Auth if you want to stay signed in while inviting others.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 space-y-4 max-w-xl"
      >
        <h3 className="font-bold text-slate-900 dark:text-slate-100">New admin account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-earth-200">Email</span>
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm"
              placeholder="admin@example.com"
              required
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-earth-200">Temporary password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm"
              placeholder="At least 6 characters"
              required
            />
          </label>
        </div>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {formSuccess && <p className="text-sm text-green-600 dark:text-green-400">{formSuccess}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm hover:bg-primaryDashboard/90 disabled:opacity-70"
        >
          {submitting ? "Creating…" : "Create admin"}
        </button>
      </form>

      <div className="rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-earth-200 dark:border-earth-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Team profiles</h3>
          <button
            type="button"
            onClick={load}
            className="text-sm font-semibold text-primaryDashboard hover:underline"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : listError ? (
          <div className="p-6 text-sm text-red-500">{listError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-earth-700 dark:text-earth-200/40 uppercase tracking-widest border-b border-earth-200 dark:border-earth-800">
                  <th className="pb-4 px-4 pt-2">Name</th>
                  <th className="pb-4 px-4">Email</th>
                  <th className="pb-4 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-200 dark:divide-earth-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 px-4 text-sm text-slate-500">
                      No profiles yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="text-sm">
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {u.full_name || "—"}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-earth-200">{u.email}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-earth-200">
                        {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
