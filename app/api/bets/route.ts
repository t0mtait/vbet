import { NextRequest, NextResponse } from 'next/server';
import { getBets, addBet, updateBet, deleteBet, getUser, updateUserFromBet } from '@/lib/storage';

export async function GET() {
  try {
    const bets = getBets();
    return NextResponse.json(bets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newBet = addBet(body);
    
    // Update user's total bets count and deduct balance
    const user = getUser(body.username);
    if (user) {
      const updates = { 
        ...user, 
        totalBets: (user.totalBets || 0) + 1,
        currentBalance: (user.currentBalance || 0) - body.amount
      };
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(process.cwd(), 'data', 'users.json');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const userIndex = users.findIndex((u: any) => u.username === body.username);
      if (userIndex !== -1) {
        users[userIndex] = updates;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      }
    }
    
    return NextResponse.json(newBet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const oldBet = getBets().find(b => b.id === id);
    
    if (!oldBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    const updatedBet = updateBet(id, updates);
    if (!updatedBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    // Update user stats if status changed
    if (updates.status && updates.status !== oldBet.status) {
      updateUserFromBet(oldBet.username, updatedBet, oldBet.status);
    }

    return NextResponse.json(updatedBet);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const bet = getBets().find(b => b.id === id);
    
    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    const deleted = deleteBet(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    // Refund user based on bet status
    if (bet.status === 'pending') {
      // Pending bets: refund the wager amount
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(process.cwd(), 'data', 'users.json');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const userIndex = users.findIndex((u: any) => u.username === bet.username);
      if (userIndex !== -1) {
        users[userIndex].totalBets = Math.max(0, users[userIndex].totalBets - 1);
        users[userIndex].currentBalance += bet.amount;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      }
      return NextResponse.json({ success: true });
    } else if (bet.status === 'won') {
      // Won bets: refund the full payout
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(process.cwd(), 'data', 'users.json');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const userIndex = users.findIndex((u: any) => u.username === bet.username);
      if (userIndex !== -1) {
        users[userIndex].totalWins = Math.max(0, users[userIndex].totalWins - 1);
        users[userIndex].totalBets = Math.max(0, users[userIndex].totalBets - 1);
        users[userIndex].currentBalance -= (bet.amount * bet.odds - bet.amount);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      }
      return NextResponse.json({ success: true });
    } else if (bet.status === 'lost') {
      // Lost bets: already deducted, just update stats
      const fs = require('fs');
      const path = require('path');
      const usersFile = path.join(process.cwd(), 'data', 'users.json');
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const userIndex = users.findIndex((u: any) => u.username === bet.username);
      if (userIndex !== -1) {
        users[userIndex].totalLosses = Math.max(0, users[userIndex].totalLosses - 1);
        users[userIndex].totalBets = Math.max(0, users[userIndex].totalBets - 1);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bet' }, { status: 500 });
  }
}
