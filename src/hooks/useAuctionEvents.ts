"use client";

import { useEffect } from "react";
import { useAppDispatch } from "./useAppStore";
import { baseApi } from "../store/api/baseApi";
import { auctionApi } from "../store/api/auctionApi";

/**
 * Shape of the SSE payload from the backend BidEventMessage DTO.
 * Java fields: auctionId, bidderId, bidderUsername, amount, timestamp, totalBids
 */
interface SseBidEvent {
  auctionId: string;
  bidderId: string;
  bidderUsername: string;
  amount: number;
  timestamp: string;
  totalBids: number;
}

/**
 * Subscribes to the backend SSE stream for a specific auction.
 * On each `bid` event:
 *   1. Patches `currentPrice` in the RTK Query `getAuction` cache (instant UI update)
 *   2. Invalidates the `Bid` list so RTK Query automatically re-fetches fresh data
 * On `auction-ended`, invalidates both caches so status + winner refresh.
 *
 * Pass null/undefined to skip (e.g. when auction is already completed).
 */
export function useAuctionEvents(auctionId: string | null | undefined) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!auctionId) return;

    const es = new EventSource(
      `http://localhost:8080/api/auctions/${auctionId}/events`,
    );

    es.addEventListener("bid", (e: MessageEvent) => {
      try {
        const event: SseBidEvent = JSON.parse(e.data);

        // 1. Update current price in the auction cache instantly
        dispatch(
          auctionApi.util.updateQueryData("getAuction", auctionId, (draft) => {
            draft.currentPrice = event.amount;
          }),
        );

        // 2. Invalidate bids so the list re-fetches with the new entry
        dispatch(
          baseApi.util.invalidateTags([{ type: "Bid", id: auctionId }]),
        );
      } catch {
        // Ignore malformed events
      }
    });

    es.addEventListener("auction-ended", () => {
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Auction", id: auctionId },
          { type: "Bid", id: auctionId },
        ]),
      );
    });

    es.onerror = () => {
      // EventSource will auto-reconnect; nothing to do here
    };

    return () => {
      es.close();
    };
  }, [auctionId, dispatch]);
}
