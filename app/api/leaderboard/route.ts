import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/storage';

export async function GET() {
  try {
    const users = getUsers();
    
    // Calculate win rate and sort by balance
    const leaderboard = users
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        currentBalance: user.currentBalance,
        totalBets: user.totalBets,
        totalWins: user.totalWins,
        winRate: user.totalBets > 0 
          ? ((user.totalWins / user.totalBets) * 100).toFixed(1)
          : '0.0',
      }))
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
