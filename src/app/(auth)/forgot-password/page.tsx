"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useForgotPasswordMutation } from "@/store/api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const validate = () => {
    if (!email) { setEmailError("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Enter a valid email"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!validate()) return;
    try {
      await forgotPassword({ email }).unwrap();
    } catch {
      // Swallow — always show success to avoid email enumeration
    }
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Forgot password?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {submitted ? (
        /* ── Success state ── */
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <p className="text-sm text-center text-slate-700 dark:text-slate-300 max-w-xs">
              If <span className="font-semibold">{email}</span> is registered, you&apos;ll receive
              a password reset link shortly. Check your inbox (and spam folder).
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      ) : (
        /* ── Form ── */
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all
                  ${emailError
                    ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                  }`}
              />
            </div>
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
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
      )}
    </div>
  );
}
