import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export function SettingsPage() {
  const [accountEmail, setAccountEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setAccountEmail(user.email);
    });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPwError("New password must be different from the current one.");
      return;
    }

    setPwSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setPwError("Could not read your account email.");
        return;
      }

      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signErr) {
        setPwError("Current password is incorrect.");
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) {
        setPwError(updateErr.message || "Could not update password.");
        return;
      }

      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="text-slate-500 dark:text-earth-200/60 text-sm mt-1">Account and security</p>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 max-w-xl space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">Signed in as</h3>
        <p className="text-sm text-slate-600 dark:text-earth-200">{accountEmail || "Loading…"}</p>
      </div>

      <form
        onSubmit={handlePasswordChange}
        className="p-6 rounded-xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 max-w-xl space-y-4"
      >
        <h3 className="font-bold text-slate-900 dark:text-slate-100">Change password</h3>
        <p className="text-sm text-slate-500 dark:text-earth-200/60">
          For accounts that sign in with email and password only.
        </p>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-earth-200">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-earth-200">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-earth-200">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-2 rounded-lg bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-sm"
            required
          />
        </label>

        {pwError && <p className="text-sm text-red-500">{pwError}</p>}
        {pwSuccess && <p className="text-sm text-green-600 dark:text-green-400">{pwSuccess}</p>}

        <button
          type="submit"
          disabled={pwSubmitting}
          className="px-4 py-2 rounded-lg bg-primaryDashboard text-earth-900 font-bold text-sm hover:bg-primaryDashboard/90 disabled:opacity-70"
        >
          {pwSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
