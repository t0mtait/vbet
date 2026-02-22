'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  currentBalance: number;
  totalWins: number;
  totalBets: number;
  winRate: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-lg text-slate-300">See top bettors and compete for the highest earnings</p>
        </div>

        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
            <p className="text-slate-300 text-lg">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 border-b border-slate-700">
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Current Balance
                  </th>
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Total Bets
                  </th>
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-200 ${
                      entry.rank === 1 ? 'bg-yellow-500/5' : entry.rank === 2 ? 'bg-gray-400/5' : entry.rank === 3 ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center w-10 h-10">
                        {entry.rank === 1 && (
                          <span className="text-3xl">🥇</span>
                        )}
                        {entry.rank === 2 && (
                          <span className="text-3xl">🥈</span>
                        )}
                        {entry.rank === 3 && (
                          <span className="text-3xl">🥉</span>
                        )}
                        {entry.rank > 3 && (
                          <span className="text-white font-bold text-lg bg-slate-700/50 rounded-full w-full h-full flex items-center justify-center">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-white font-bold text-lg">
                      {entry.username}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block font-bold text-lg px-4 py-2 rounded-lg border ${
                        entry.currentBalance < 100
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : entry.currentBalance < 500
                          ? 'bg-slate-500/20 text-white border-slate-500/30'
                          : entry.currentBalance < 1000
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : entry.currentBalance < 2000
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          : 'bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 text-transparent bg-clip-text border-purple-500/30'
                      }`}>
                        ${entry.currentBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-300 font-semibold">
                      {entry.totalBets}
                    </td>
                    <td className="px-6 py-5 text-green-400 font-bold text-lg">
                      {entry.totalWins}
                    </td>
                    <td className="px-6 py-5 text-yellow-400 font-bold text-lg">
                      {entry.winRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
  