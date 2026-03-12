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
  }),
  overrideExisting: false,
});

export const {
  useGetAuctionsQuery,
  useGetAuctionQuery,
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
  useDeleteAuctionMutation,
  useGetAuctionWinnerQuery,
} = auctionApi;
