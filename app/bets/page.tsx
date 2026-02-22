'use client';

import { useEffect, useState } from 'react';

interface Bet {
  id: number;
  username: string;
  description: string;
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{ betId: number; action: 'cancel' | 'won' | 'lost' } | null>(null);

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    try {
      const response = await fetch('/api/bets');
      const data = await response.json();
      setBets(data);
    } catch (error) {
      console.error('Failed to fetch bets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    setConfirmingAction(null);
    setProcessing(id);
    setError(null);
    setSuccess(null);
    try {
      const bet = bets.find(b => b.id === id);
      const response = await fetch('/api/bets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to cancel bet');
      await fetchBets();
      setSuccess(`✅ Bet cancelled. ${bet?.username}'s balance updated.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel bet';
      setError(errorMsg);
      console.error('Failed to cancel bet:', error);
    } finally {
      setProcessing(null);
    }
  }

  async function handleMarkAsWon(id: number) {
    setConfirmingAction(null);
    setProcessing(id);
    setError(null);
    setSuccess(null);
    try {
      const bet = bets.find(b => b.id === id);
      const winnings = (bet?.amount ?? 0) * (bet?.odds ?? 1) - (bet?.amount ?? 0);
      const response = await fetch('/api/bets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'won' }),
      });
      if (!response.ok) throw new Error('Failed to mark bet as won');
      await fetchBets();
      setSuccess(`✅ Bet won! ${bet?.username} earned $${winnings.toFixed(2)}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to mark bet as won';
      setError(errorMsg);
      console.error('Failed to mark as won:', error);
    } finally {
      setProcessing(null);
    }
  }

  async function handleMarkAsLost(id: number) {
    setConfirmingAction(null);
    setProcessing(id);
    setError(null);
    setSuccess(null);
    try {
      const bet = bets.find(b => b.id === id);
      const response = await fetch('/api/bets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'lost' }),
      });
      if (!response.ok) throw new Error('Failed to mark bet as lost');
      await fetchBets();
      setSuccess(`❌ Bet lost. ${bet?.username} lost $${bet?.amount}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to mark bet as lost';
      setError(errorMsg);
      console.error('Failed to mark as lost:', error);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-6">
          <h3 className="text-2xl sm:text-6xl font-bold text-white mb-2">Placed Bets</h3>
        </div>

        {/* Stats Card */}
        {!loading && bets.length > 0 && (() => {
          // Get current month and year
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          // Filter bets by current month
          const monthlyBets = bets.filter(b => {
            const betDate = new Date(b.createdAt);
            return betDate.getMonth() === currentMonth && betDate.getFullYear() === currentYear;
          });
          
          const wonBets = monthlyBets.filter(b => b.status === 'won');
          const lostBets = monthlyBets.filter(b => b.status === 'lost');
          
          const biggestWin = wonBets.length > 0 
            ? wonBets.reduce((max, b) => b.odds > max.odds ? b : max)
            : null;
          
          const biggestLoss = lostBets.length > 0
            ? lostBets.reduce((min, b) => b.odds < min.odds ? b : min)
            : null;
          
          const mostMoneyWon = wonBets.length > 0
            ? wonBets.reduce((max, b) => {
                const profit = (b.amount * b.odds) - b.amount;
                const maxProfit = (max.amount * max.odds) - max.amount;
                return profit > maxProfit ? b : max;
              })
            : null;
          
          const mostMoneyLost = lostBets.length > 0
            ? lostBets.reduce((max, b) => b.amount > max.amount ? b : max)
            : null;

          return (
            <div className="mb-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">📊 {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-700/30 rounded-xl p-4 border border-green-500/30">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Biggest Win (By Odds)</p>
                  {biggestWin ? (
                    <>
                      <p className="text-2xl font-bold text-green-400 mb-1">{biggestWin.odds}x</p>
                      <p className="text-slate-300 text-xs mb-2">{biggestWin.description}</p>
                      <p className="text-slate-400 text-xs mb-1">👤 {biggestWin.username}</p>
                      <p className="text-slate-500 text-xs">{new Date(biggestWin.createdAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">N/A</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-red-500/30">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Biggest Loss (By Odds)</p>
                  {biggestLoss ? (
                    <>
                      <p className="text-2xl font-bold text-red-400 mb-1">{biggestLoss.odds}x</p>
                      <p className="text-slate-300 text-xs mb-2">{biggestLoss.description}</p>
                      <p className="text-slate-400 text-xs mb-1">👤 {biggestLoss.username}</p>
                      <p className="text-slate-500 text-xs">{new Date(biggestLoss.createdAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">N/A</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-green-500/30">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Biggest Win (By $)</p>
                  {mostMoneyWon ? (
                    <>
                      <p className="text-2xl font-bold text-green-400 mb-1">${(mostMoneyWon.amount * mostMoneyWon.odds - mostMoneyWon.amount).toFixed(2)}</p>
                      <p className="text-slate-300 text-xs mb-2">{mostMoneyWon.description}</p>
                      <p className="text-slate-400 text-xs mb-1">👤 {mostMoneyWon.username}</p>
                      <p className="text-slate-500 text-xs">{new Date(mostMoneyWon.createdAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">N/A</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-red-500/30">
                  <p className="text-slate-300 text-sm font-semibold mb-2">Biggest Loss (By $)</p>
                  {mostMoneyLost ? (
                    <>
                      <p className="text-2xl font-bold text-red-400 mb-1">${mostMoneyLost.amount.toFixed(2)}</p>
                      <p className="text-slate-300 text-xs mb-2">{mostMoneyLost.description}</p>
                      <p className="text-slate-400 text-xs mb-1">👤 {mostMoneyLost.username}</p>
                      <p className="text-slate-500 text-xs">{new Date(mostMoneyLost.createdAt).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">N/A</p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-300">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-green-300">
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
            <p className="text-slate-300 text-lg">Loading bets...</p>
          </div>
        ) : bets.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
            <p className="text-slate-300 text-lg">No bets yet. Start by placing your first bet!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {[...bets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((bet) => (
              <div
                key={bet.id}
                className={`backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-5 border transition-all duration-200 group ${
                  bet.status === 'won' 
                    ? 'bg-green-900/30 border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/20 hover:shadow-2xl' 
                    : bet.status === 'lost'
                    ? 'bg-red-900/30 border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/20 hover:shadow-2xl'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/50 hover:shadow-2xl'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3 items-start lg:items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-400 font-bold">{bet.username}</span>
                    </div>
                    <p className="text-white font-bold text-base group-hover:text-red-300 transition-colors">{bet.description}</p>
                    <p className="text-slate-400 text-xs mt-1">📅 {new Date(bet.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-1">STAKE</p>
                    <p className="text-white font-bold">${bet.amount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-1">ODDS</p>
                    <p className="text-red-400 font-bold">{bet.odds}x</p>
                  </div>
                  <div className="flex items-end justify-between sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-stretch">
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-1">POTENTIAL</p>
                      <p className="text-green-400 font-bold">
                        ${(bet.amount * bet.odds).toFixed(2)} <span className="text-slate-300 text-sm">({'+' + ((bet.amount * bet.odds) - bet.amount).toFixed(2)})</span>
                      </p>
                    </div>
                    <div className="mt-2">
                      <StatusBadge status={bet.status} />
                    </div>
                  </div>
                </div>
                
                {bet.status === 'pending' && (
                  <>
                    {confirmingAction?.betId === bet.id ? (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-slate-300 text-sm mb-3 font-semibold">
                          {confirmingAction.action === 'cancel' && '⚠️ Are you sure you want to cancel this bet?'}
                          {confirmingAction.action === 'won' && '⚠️ Mark this bet as won?'}
                          {confirmingAction.action === 'lost' && '⚠️ Mark this bet as lost?'}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              if (confirmingAction.action === 'cancel') handleCancel(bet.id);
                              if (confirmingAction.action === 'won') handleMarkAsWon(bet.id);
                              if (confirmingAction.action === 'lost') handleMarkAsLost(bet.id);
                            }}
                            disabled={processing === bet.id}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">
                            {processing === bet.id ? '⏳ Processing...' : 'Confirm'}
                          </button>
                          <button 
                            onClick={() => setConfirmingAction(null)}
                            disabled={processing === bet.id}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => setConfirmingAction({ betId: bet.id, action: 'cancel' })}
                          disabled={processing === bet.id}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">
                          ❌ Cancel Bet
                        </button>
                        <button 
                          onClick={() => setConfirmingAction({ betId: bet.id, action: 'won' })}
                          disabled={processing === bet.id}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">
                          ✅ Mark as Won
                        </button>
                        <button 
                          onClick={() => setConfirmingAction({ betId: bet.id, action: 'lost' })}
                          disabled={processing === bet.id}
                          className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">
                          ❌ Mark as Lost
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    won: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', emoji: '✅' },
    lost: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', emoji: '❌' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', emoji: '⏳' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span>{config.emoji}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
