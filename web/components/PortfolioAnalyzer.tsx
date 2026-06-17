'use client';

import { useState } from 'react';

interface PortfolioData {
  address: string;
  totalBalance: string;
  coins: Array<{ symbol: string; amount: string; usdValue?: string }>;
  stakes: Array<{
    validatorAddress: string;
    validatorName?: string;
    amount: string;
    reward?: string;
  }>;
  rewards: string;
  error?: string;
}

export function PortfolioAnalyzer() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!address.trim()) {
      setError('Enter a valid Sui address');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      // Call the Suisei MCP tool to get portfolio
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetch();
    }
  };

  return (
    <div className="min-h-screen bg-paper p-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        {!data && (
          <div className="mb-12">
            <h1 className="mb-3 text-5xl font-bold tracking-tight text-ink sm:text-6xl">
              Portfolio Snapshot
            </h1>
            <p className="text-lg text-muted">
              Paste a Sui mainnet address to see balance, stakes, and rewards in one call.
            </p>
          </div>
        )}

        {/* Input */}
        <div className="mb-12">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0x..."
              className="flex-1 rounded-lg border border-line bg-paper-raised px-4 py-3 font-mono text-sm text-ink placeholder-muted transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 elevate"
              disabled={loading}
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 active:scale-98 disabled:opacity-50 disabled:hover:translate-y-0 elevate-accent btn-shine"
            >
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-accent">{error}</p>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="animate-fadeIn space-y-12">
            {/* Address shown */}
            <p className="text-xs text-faint">
              <span className="font-mono">{data.address.slice(0, 10)}...{data.address.slice(-6)}</span>
            </p>

            {/* Two column layout */}
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Left: Sticky balance section */}
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="space-y-8">
                  {/* Total Balance */}
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-faint">
                      Total Balance
                    </p>
                    <p className="mt-4 font-mono text-6xl font-bold text-accent">
                      {parseFloat(data.totalBalance).toFixed(1)}
                    </p>
                    <p className="mt-2 font-mono text-sm text-muted">SUI</p>
                  </div>

                  {/* Rewards */}
                  {parseFloat(data.rewards) > 0 && (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-faint">
                        Pending Rewards
                      </p>
                      <p className="mt-2 font-mono text-3xl font-bold text-ink">
                        {parseFloat(data.rewards).toFixed(3)}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted">SUI</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Indexed holdings list */}
              <div className="space-y-6 lg:col-span-2">
                {/* Coins */}
                {data.coins && data.coins.length > 0 && (
                  <div>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-faint mb-6">
                      Coins
                    </h2>
                    <div className="space-y-4">
                      {data.coins.map((coin, i) => (
                        <div
                          key={i}
                          className="border-t border-line pt-4 transition-colors hover:bg-paper-raised/50 -mx-4 px-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-mono text-xs text-faint">
                                {String(i + 1).padStart(2, '0')}
                              </p>
                              <p className="mt-2 font-semibold text-ink">
                                {coin.symbol}
                              </p>
                            </div>
                            <p className="font-mono text-sm font-semibold text-ink text-right">
                              {parseFloat(coin.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stakes */}
                {data.stakes && data.stakes.length > 0 && (
                  <div>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-faint mb-6">
                      Stakes
                    </h2>
                    <div className="space-y-4">
                      {data.stakes.map((stake, i) => (
                        <div
                          key={i}
                          className="border-t border-line pt-4 transition-colors hover:bg-paper-raised/50 -mx-4 px-4"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="font-mono text-xs text-faint">
                                {String(i + 1).padStart(2, '0')}
                              </p>
                              <p className="mt-2 font-semibold text-ink">
                                {stake.validatorName || 'Validator'}
                              </p>
                            </div>
                            <p className="font-mono text-sm font-semibold text-ink text-right">
                              {parseFloat(stake.amount).toFixed(2)} SUI
                            </p>
                          </div>
                          {stake.reward && parseFloat(stake.reward) > 0 && (
                            <p className="font-mono text-xs text-accent">
                              +{parseFloat(stake.reward).toFixed(4)} SUI earned
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
