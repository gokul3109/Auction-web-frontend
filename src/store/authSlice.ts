import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Rehydrate from localStorage on app boot
const loadAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }
  try {
    const token = localStorage.getItem("auction_token");
    const user = localStorage.getItem("auction_user");
    if (token && user) {
      return {
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      };
    }
  } catch {
    // ignore
  }
  return { user: null, token: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auction_token", action.payload.token);
        localStorage.setItem("auction_user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auction_token");
        localStorage.removeItem("auction_user");
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("auction_user", JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
