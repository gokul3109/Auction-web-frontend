"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../hooks/useAppStore";
import { selectIsAuthenticated } from "../../store/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps protected pages. Redirects to /login if not authenticated.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
