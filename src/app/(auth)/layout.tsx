import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AuctionWeb — Sign In",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">⚡</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">AuctionWeb</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Live Auctions.
              <br />
              <span className="text-indigo-400">Real Bids.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Discover unique items, place bids in real-time, and win
              exclusive deals — all in one platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: "🔴", text: "Live real-time bidding with instant updates" },
              { icon: "🔒", text: "Secure transactions and verified sellers" },
              { icon: "🏆", text: "Win exclusive items at the best prices" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            "The thrill of the auction, now at your fingertips."
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <span className="text-slate-900 dark:text-white text-lg font-bold">AuctionWeb</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
