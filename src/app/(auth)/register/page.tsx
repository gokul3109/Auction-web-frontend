"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Loader2, AtSign } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useRegisterMutation, useGoogleLoginMutation } from "../../../store/api/authApi";
import { useAppDispatch } from "../../../hooks/useAppStore";
import { setCredentials } from "../../../store/authSlice";

interface FormState {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
}

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: "Too weak", color: "bg-red-400" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Good", color: "bg-blue-400" },
    { label: "Strong", color: "bg-green-500" },
  ];
  return { score, ...map[score] };
};

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const [register, { isLoading }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

  const passwordStrength = getPasswordStrength(form.password);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) newErrors.username = "Only letters, numbers, underscores";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      const user = await register({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
      }).unwrap();
      dispatch(setCredentials(user));
      router.push("/");
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || "Registration failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setServerError("");
    try {
      const user = await googleLogin({ googleToken: credentialResponse.credential }).unwrap();
      dispatch(setCredentials(user));
      router.push("/");
    } catch {
      setServerError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Join thousands of bidders on AuctionWeb
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <InputField
          label="Full Name"
          type="text"
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="John Doe"
          icon={<User className="w-4 h-4 text-slate-400" />}
          error={errors.fullName}
        />

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4 text-slate-400" />}
          error={errors.email}
        />

        {/* Username */}
        <InputField
          label="Username"
          type="text"
          value={form.username}
          onChange={handleChange("username")}
          placeholder="johndoe"
          icon={<AtSign className="w-4 h-4 text-slate-400" />}
          error={errors.username}
        />

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all
                ${errors.password
                  ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {form.password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= passwordStrength.score ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">{passwordStrength.label}</p>
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400 bg-white dark:bg-slate-950 px-2 w-fit mx-auto">
          or sign up with
        </div>
      </div>

      {/* Google */}
      <div className={`flex justify-center transition-opacity ${isGoogleLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError("Google sign-up failed. Please try again.")}
          theme="outline"
          size="large"
          width="100%"
          text="signup_with"
          shape="rectangular"
        />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Reusable Input Field ─────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
}

function InputField({ label, type, value, onChange, placeholder, icon, error }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all
            ${error
              ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
              : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            }`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
