import { baseApi } from "./baseApi";
import type { Auction, AuctionRequest, AuctionFilters, AuctionWinnerInfo } from "../../types";

export const auctionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuctions: builder.query<Auction[], AuctionFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.status) params.set("status", filters.status);
        if (filters?.category) params.set("category", filters.category);
        const queryString = params.toString();
        return `/api/auctions${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Auction" as const, id })),
              { type: "Auction", id: "LIST" },
            ]
          : [{ type: "Auction", id: "LIST" }],
    }),

    getMyAuctions: builder.query<Auction[], void>({
      query: () => "/api/auctions/my",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Auction" as const, id })),
              { type: "Auction", id: "MY_LIST" },
            ]
          : [{ type: "Auction", id: "MY_LIST" }],
    }),

    getAuction: builder.query<Auction, string>({
      query: (id) => `/api/auctions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Auction", id }],
    }),

    createAuction: builder.mutation<Auction, AuctionRequest>({
      query: (body) => ({
        url: "/api/auctions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Auction", id: "LIST" }],
    }),

    updateAuction: builder.mutation<Auction, { id: string; data: AuctionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/auctions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Auction", id },
        { type: "Auction", id: "LIST" },
      ],
    }),

    deleteAuction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/auctions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Auction", id },
        { type: "Auction", id: "LIST" },
      ],
    }),

    getAuctionWinner: builder.query<AuctionWinnerInfo, string>({
      query: (id) => `/api/auctions/${id}/winner`,
    }),

    getWatchlist: builder.query<Auction[], void>({
      query: () => "/api/watchlist",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Auction" as const, id })),
              { type: "Watchlist", id: "LIST" },
            ]
          : [{ type: "Watchlist", id: "LIST" }],
    }),

    addToWatchlist: builder.mutation<{ message: string }, string>({
      query: (auctionId) => ({
        url: `/api/watchlist/${auctionId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Watchlist", id: "LIST" },
        { type: "Auction", id },
        { type: "Auction", id: "LIST" },
        { type: "Auction", id: "MY_LIST" },
      ],
    }),

    removeFromWatchlist: builder.mutation<void, string>({
      query: (auctionId) => ({
        url: `/api/watchlist/${auctionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Watchlist", id: "LIST" },
        { type: "Auction", id },
        { type: "Auction", id: "LIST" },
        { type: "Auction", id: "MY_LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAuctionsQuery,
  useGetMyAuctionsQuery,
  useGetAuctionQuery,
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
  useDeleteAuctionMutation,
  useGetAuctionWinnerQuery,
  useGetWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} = auctionApi;
