"use client";

import { useAppSelector, useAppDispatch } from "./useAppStore";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logout,
} from "../store/authSlice";
import { useRouter } from "next/navigation";
import { baseApi } from "../store/api/baseApi";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    // Reset all RTK Query cache on logout
    dispatch(baseApi.util.resetApiState());
    router.push("/login");
  };

  return { user, isAuthenticated, logout: handleLogout };
};
