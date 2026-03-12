// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  token: string; // JWT returned from backend
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  googleToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  password?: string;
}

// ─── Auction ─────────────────────────────────────────────────────────────────

export type AuctionStatus = "active" | "completed";

export interface Auction {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startingPrice: number;
  currentPrice: number;
  category: string | null;
  status: AuctionStatus;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionRequest {
  title: string;
  description?: string;
  startingPrice: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
}

export interface AuctionFilters {
  status?: AuctionStatus;
  category?: string;
}

// ─── Bid ─────────────────────────────────────────────────────────────────────

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  bidAmount: number;
  createdAt: string;
}

export interface BidRequest {
  bidAmount: number;
}

// ─── SSE Events ───────────────────────────────────────────────────────────────

export interface BidEventMessage {
  auctionId: string;
  bidderId: string;
  bidderUsername: string;
  bidAmount: number;
  bidTime: string;
  totalBids: number;
}

export interface AuctionEndedEvent {
  auctionId: string;
  hasWinner: boolean;
  winnerId?: string;
  winningBidAmount?: number;
}

// ─── Winner ──────────────────────────────────────────────────────────────────

export interface AuctionWinnerInfo {
  auctionId: string;
  bidId?: string;
  winnerId?: string;
  winningBidAmount?: number;
  winTime?: string;
  hasWinner: boolean;
}
