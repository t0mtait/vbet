'use client';

import { useState, useEffect } from 'react';

interface Prop {
  id: number;
  category: string;
  name: string;
  return: number;
  status: 'active' | 'inactive';
}

interface User {
  username: string;
  currentBalance: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
}

export default function PlaceBetPage() {
  const [props, setProps] = useState<Prop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const categories = ['CJ', 'Tom', 'Stef', 'Chris', 'Other Player', 'Match'];
  const [formData, setFormData] = useState({
    selectedProps: {
      'CJ': '',
      'Tom': '',
      'Stef': '',
      'Chris': '',
      'Other Player': '',
      'Match': '',
    },
    username: '',
    amount: '',
  });
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchProps();
    fetchUsers();
  }, []);

  async function handleUsernameChange(username: string) {
    setFormData({...formData, username});
    
    if (!username.trim()) {
      setUserBalance(null);
      return;
    }

    // Normalize username
    const validUsernames = ['Tom', 'CJ', 'Stef', 'Chris'];
    const normalizedUsername = validUsernames.find(
      u => u.toLowerCase() === username.toLowerCase()
    );

    if (!normalizedUsername) {
      setUserBalance(null);
      return;
    }

    try {
      const response = await fetch(`/api/users?username=${encodeURIComponent(normalizedUsername)}`);
      if (response.ok) {
        const user = await response.json();
        setUserBalance(user.currentBalance);
      } else {
        setUserBalance(null);
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
      setUserBalance(null);
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch('/api/bets');
      const bets = await response.json();
      // Extract unique usernames from bets
      const uniqueUsernames = [...new Set(bets.map((b: any) => b.username))];
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }

  async function fetchProps() {
    try {
      const response = await fetch('/api/props');
      const data = await response.json();
      setProps(data);
    } catch (error) {
      console.error('Failed to fetch props:', error);
      setError('Failed to load propositions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Get selected props
    const selectedPropIds = Object.values(formData.selectedProps).filter(id => id !== '');
    
    if (selectedPropIds.length === 0 || !formData.username || !formData.amount) {
      setError('Please select at least one proposition, enter your name, and an amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if user has sufficient balance
    if (userBalance === null) {
      setError('Unable to verify your balance');
      return;
    }

    if (amount > userBalance) {
      setError(`Insufficient balance. You have $${userBalance.toFixed(2)} but are trying to bet $${amount.toFixed(2)}`);
      return;
    }

    // Get the selected props and calculate parlay odds
    const selectedProps = selectedPropIds.map(id => 
      props.find(p => p.id === parseInt(id as string))
    ).filter(Boolean) as Prop[];

    const parlayOdds = selectedProps.reduce((acc, prop) => acc * prop.return, 1);

    // Normalize username capitalization
    const validUsernames = ['Tom', 'CJ', 'Stef', 'Chris'];
    const normalizedUsername = validUsernames.find(
      u => u.toLowerCase() === formData.username.toLowerCase()
    );

    if (!normalizedUsername) {
      setError(`Invalid username. Please use one of: ${validUsernames.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      // Create bet for each selected proposition
      const betPromises = selectedProps.map(prop =>
        fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: normalizedUsername,
            description: prop.name,
            amount: amount,
            odds: prop.return,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }),
        })
      );

      const responses = await Promise.all(betPromises);
      const allOk = responses.every(r => r.ok);

      if (!allOk) {
        throw new Error('Failed to create one or more bets');
      }

      const newBalance = userBalance - amount;
      setUserBalance(newBalance);
      const propNames = selectedProps.map(p => p.name).join(', ');
      setSuccess(`🎉 Parlay placed! ${selectedProps.length} prop(s) at ${parlayOdds.toFixed(2)}x combined odds`);
      setFormData({
        selectedProps: {
          'CJ': '',
          'Tom': '',
          'Stef': '',
          'Chris': '',
          'Other Player': '',
          'Match': '',
        },
        username: '',
        amount: '',
      });

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to place bet';
      setError(errorMsg);
      console.error('Failed to place bet:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2">Build a Parlay</h1>
            <p className="text-lg text-slate-300">Select propositions from each category to multiply your odds</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-300">
              <p className="font-semibold">Error: {error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-green-300">
              <p className="font-semibold">✅ {success}</p>
            </div>
          )}
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 border border-slate-700/50">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Category Selects */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Select Propositions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((category) => {
                    const categoryProps = props.filter(p => p.category === category);
                    const selectedPropId = formData.selectedProps[category as keyof typeof formData.selectedProps];
                    const selectedProp = selectedPropId ? props.find(p => p.id === parseInt(selectedPropId)) : null;
                    
                    return (
                      <div key={category}>
                        <label className="block text-white font-bold text-sm mb-2">
                          {category}
                        </label>
                        <select
                          value={selectedPropId}
                          onChange={(e) => setFormData({
                            ...formData,
                            selectedProps: {
                              ...formData.selectedProps,
                              [category]: e.target.value
                            }
                          })}
                          className="w-full bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                        >
                          <option value="">Skip</option>
                          {categoryProps.map((prop) => (
                            <option key={prop.id} value={prop.id}>
                              {prop.name} ({prop.return}x)
                            </option>
                          ))}
                        </select>
                        {selectedProp && (
                          <p className="text-red-400 text-xs font-semibold mt-1">{selectedProp.return}x</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parlay Odds Display */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm mb-1">Combined Parlay Odds</p>
                    <p className={`transition-all duration-300 ${(() => {
                      const selectedPropIds = Object.values(formData.selectedProps).filter(id => id !== '');
                      if (selectedPropIds.length === 0) return 'text-4xl font-bold text-white';
                      const odds = selectedPropIds.reduce((acc, id) => {
                        const prop = props.find(p => p.id === parseInt(id as string));
                        return acc * (prop?.return || 1);
                      }, 1);
                      
                      if (odds >= 50) {
                        return 'text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-400 animate-glow animate-bounce drop-shadow-2xl';
                      } else if (odds >= 20) {
                        return 'text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 animate-glow animate-sizePulse drop-shadow-2xl';
                      } else if (odds >= 10) {
                        return 'text-5xl font-bold text-yellow-300 drop-shadow-lg';
                      } else if (odds >= 5) {
                        return 'text-4xl font-bold text-green-400';
                      } else if (odds >= 3) {
                        return 'text-4xl font-bold text-blue-400';
                      } else {
                        return 'text-4xl font-bold text-white';
                      }
                    })()}`}>
                      {(() => {
                        const selectedPropIds = Object.values(formData.selectedProps).filter(id => id !== '');
                        if (selectedPropIds.length === 0) return '1.00x';
                        const odds = selectedPropIds.reduce((acc, id) => {
                          const prop = props.find(p => p.id === parseInt(id as string));
                          return acc * (prop?.return || 1);
                        }, 1);
                        return `${odds.toFixed(2)}x`;
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-sm mb-1">Propositions Selected</p>
                    <p className="text-4xl font-bold text-white">
                      {Object.values(formData.selectedProps).filter(id => id !== '').length} / 6
                    </p>
                  </div>
                </div>

                {/* Possible Profit Display */}
                {formData.amount && (
                  <div className="mt-6 pt-6 border-t border-red-500/30">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-slate-300 text-sm mb-1">Possible Profit</p>
                        <p className="text-3xl font-bold text-green-400">
                          ${(() => {
                            const selectedPropIds = Object.values(formData.selectedProps).filter(id => id !== '');
                            const amount = parseFloat(formData.amount) || 0;
                            if (selectedPropIds.length === 0 || amount <= 0) return '0.00';
                            const odds = selectedPropIds.reduce((acc, id) => {
                              const prop = props.find(p => p.id === parseInt(id as string));
                              return acc * (prop?.return || 1);
                            }, 1);
                            const profit = (amount * odds) - amount;
                            return profit.toFixed(2);
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm mb-1">Total Payout</p>
                        <p className="text-3xl font-bold text-blue-400">
                          ${(() => {
                            const selectedPropIds = Object.values(formData.selectedProps).filter(id => id !== '');
                            const amount = parseFloat(formData.amount) || 0;
                            if (selectedPropIds.length === 0 || amount <= 0) return '0.00';
                            const odds = selectedPropIds.reduce((acc, id) => {
                              const prop = props.find(p => p.id === parseInt(id as string));
                              return acc * (prop?.return || 1);
                            }, 1);
                            const payout = amount * odds;
                            return payout.toFixed(2);
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Username and Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-bold text-lg mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tom, CJ, Stef, Chris"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="w-full bg-slate-700/50 text-white rounded-xl px-5 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder-slate-400"
                  />
                  {userBalance !== null && (
                    <p className="text-slate-300 text-sm font-semibold mt-2">
                      Balance: ${userBalance.toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-bold text-lg mb-3">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-700/50 text-white rounded-xl px-5 py-3 border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder-slate-400"
                  />
                  {formData.amount && userBalance !== null && (
                    <p className={`text-sm font-semibold mt-2 ${parseFloat(formData.amount) > userBalance ? 'text-red-500' : 'text-green-400'}`}>
                      {parseFloat(formData.amount) > userBalance ? '❌ Insufficient balance' : `✅ ${(userBalance - parseFloat(formData.amount)).toFixed(2)} remaining`}
                    </p>
                  )}
                </div>
              </div>

              
              <button
                type="submit"
                disabled={submitting || loading || (userBalance !== null && parseFloat(formData.amount) > userBalance)}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-600/50 disabled:to-pink-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] text-lg"
              >
                {submitting ? '⏳ Placing Parlay...' : '🎲 Place Parlay'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }
