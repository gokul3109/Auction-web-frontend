import { baseApi } from "./baseApi";
import type { Bid, BidRequest } from "../../types";

export const bidApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBids: builder.query<Bid[], string>({
      query: (auctionId) => `/api/auctions/${auctionId}/bids`,
      providesTags: (_result, _error, auctionId) => [
        { type: "Bid", id: auctionId },
      ],
    }),

    getMyBids: builder.query<Bid[], void>({
      query: () => "/api/bids/my",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Bid" as const, id })), { type: "Bid", id: "MY_LIST" }]
          : [{ type: "Bid", id: "MY_LIST" }],
    }),

    placeBid: builder.mutation<Bid, { auctionId: string; data: BidRequest }>({
      query: ({ auctionId, data }) => ({
        url: `/api/auctions/${auctionId}/bids`,
        method: "POST",
        body: data,
      }),
      // Placing a bid invalidates bids list AND the auction (current price changes)
      invalidatesTags: (_result, _error, { auctionId }) => [
        { type: "Bid", id: auctionId },
        { type: "Auction", id: auctionId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBidsQuery, useGetMyBidsQuery, usePlaceBidMutation } = bidApi;
