import { baseApi } from "./baseApi";
import type { Notification } from "../../types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => "/api/notifications",
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/api/notifications/unread-count",
      providesTags: [{ type: "Notification", id: "UNREAD" }],
    }),

    markRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD" },
      ],
    }),

    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: "/api/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
