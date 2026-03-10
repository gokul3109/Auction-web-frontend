import { baseApi } from "./baseApi";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  UpdateProfileRequest,
} from "../../types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<User, RegisterRequest>({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<User, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),

    googleLogin: builder.mutation<User, GoogleAuthRequest>({
      query: (body) => ({
        url: "/api/auth/google",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => "/api/users/me",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: "/api/users/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
} = authApi;
