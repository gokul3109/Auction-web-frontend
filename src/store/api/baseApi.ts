import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout } from "../authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8080",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Automatically log out when the server returns 401 (expired / invalid token)
const baseQueryWithAutoLogout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAutoLogout,
  // Tag types for cache invalidation
  tagTypes: ["Auction", "Bid", "User", "Watchlist", "Notification"],
  // Endpoints injected from individual slice files
  endpoints: () => ({}),
});
