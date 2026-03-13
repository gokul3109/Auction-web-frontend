"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useResetPasswordMutation } from "@/store/api/authApi";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (form.newPassword.length < 6) errs.newPassword = "Must be at least 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      await resetPassword({ token, newPassword: form.newPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || "Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 py-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-center text-slate-700 dark:text-slate-300">
            Invalid reset link. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="flex items-center justify-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
        <p className="text-sm text-center text-slate-700 dark:text-slate-300">
          Password updated! Redirecting to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* New password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          New password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showNew ? "text" : "password"}
            value={form.newPassword}
            onChange={(e) => {
              setForm({ ...form, newPassword: e.target.value });
              if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: "" });
            }}
            placeholder="Min. 6 characters"
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all
              ${fieldErrors.newPassword
                ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.newPassword && <p className="text-xs text-red-500">{fieldErrors.newPassword}</p>}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Confirm password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => {
              setForm({ ...form, confirmPassword: e.target.value });
              if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
            }}
            placeholder="Repeat your password"
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all
              ${fieldErrors.confirmPassword
                ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update password"
        )}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Set new password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Choose a strong password for your account.
        </p>
      </div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
