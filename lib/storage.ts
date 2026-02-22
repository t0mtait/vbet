import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export interface Bet {
  id: number;
  username: string;
  description: string;
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export interface Prop {
  id: number;
  category: string;
  name: string;
  return: number;
  status: 'active' | 'inactive';
}

export interface User {
  username: string;
  currentBalance: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
}

const betsFile = path.join(dataDir, 'bets.json');
const propsFile = path.join(dataDir, 'props.json');
const usersFile = path.join(dataDir, 'users.json');

// Initialize default data
function initializeData() {
  if (!fs.existsSync(betsFile)) {
    const defaultBets: Bet[] = [
      {
        id: 1,
        username: 'Tom',
        description: 'Team A wins the championship',
        amount: 100,
        odds: 2.5,
        status: 'pending',
        createdAt: '2024-02-20',
      },
      {
        id: 2,
        username: 'CJ',
        description: 'Stock XYZ reaches $150',
        amount: 250,
        odds: 1.8,
        status: 'pending',
        createdAt: '2024-02-19',
      },
      {
        id: 3,
        username: 'Stef',
        description: 'Cryptocurrency rally next month',
        amount: 500,
        odds: 3.2,
        status: 'won',
        createdAt: '2024-02-15',
      },
      {
        id: 4,
        username: 'Chris',
        description: 'Tech stocks surge this quarter',
        amount: 150,
        odds: 1.6,
        status: 'won',
        createdAt: '2024-02-18',
      },
      {
        id: 5,
        username: 'Tom',
        description: 'Market correction expected',
        amount: 75,
        odds: 2.1,
        status: 'lost',
        createdAt: '2024-02-16',
      },
    ];
    fs.writeFileSync(betsFile, JSON.stringify(defaultBets, null, 2));
  }

  if (!fs.existsSync(propsFile)) {
    const defaultProps: Prop[] = [
      { id: 1, category: 'CJ', name: 'CJ Prediction 1', return: 1.5, status: 'active' },
      { id: 2, category: 'CJ', name: 'CJ Prediction 2', return: 2.0, status: 'active' },
      { id: 3, category: 'CJ', name: 'CJ Prediction 3', return: 2.5, status: 'active' },
      { id: 4, category: 'CJ', name: 'CJ Prediction 4', return: 3.0, status: 'active' },
      { id: 5, category: 'Tom', name: 'Tom Prediction 1', return: 1.8, status: 'active' },
      { id: 6, category: 'Tom', name: 'Tom Prediction 2', return: 2.2, status: 'active' },
      { id: 7, category: 'Tom', name: 'Tom Prediction 3', return: 2.8, status: 'active' },
      { id: 8, category: 'Tom', name: 'Tom Prediction 4', return: 3.5, status: 'active' },
      { id: 9, category: 'Stef', name: 'Stef Prediction 1', return: 2.0, status: 'active' },
      { id: 10, category: 'Stef', name: 'Stef Prediction 2', return: 2.5, status: 'active' },
      { id: 11, category: 'Stef', name: 'Stef Prediction 3', return: 3.0, status: 'active' },
      { id: 12, category: 'Stef', name: 'Stef Prediction 4', return: 3.2, status: 'active' },
      { id: 13, category: 'Chris', name: 'Chris Prediction 1', return: 1.7, status: 'active' },
      { id: 14, category: 'Chris', name: 'Chris Prediction 2', return: 2.3, status: 'active' },
      { id: 15, category: 'Chris', name: 'Chris Prediction 3', return: 2.9, status: 'active' },
    ];
    fs.writeFileSync(propsFile, JSON.stringify(defaultProps, null, 2));
  }

  if (!fs.existsSync(usersFile)) {
    const defaultUsers: User[] = [
      { username: 'Tom', currentBalance: 1250, totalBets: 8, totalWins: 5, totalLosses: 1 },
      { username: 'CJ', currentBalance: 890, totalBets: 6, totalWins: 4, totalLosses: 0 },
      { username: 'Stef', currentBalance: 2100, totalBets: 5, totalWins: 4, totalLosses: 0 },
      { username: 'Chris', currentBalance: 450, totalBets: 4, totalWins: 2, totalLosses: 1 },
    ];
    fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
  }
}

initializeData();

// Bet operations
export function getBets(): Bet[] {
  try {
    const data = fs.readFileSync(betsFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addBet(bet: Omit<Bet, 'id'>): Bet {
  const bets = getBets();
  const newBet: Bet = {
    ...bet,
    id: Math.max(0, ...bets.map(b => b.id)) + 1,
  };
  bets.push(newBet);
  fs.writeFileSync(betsFile, JSON.stringify(bets, null, 2));
  return newBet;
}

export function updateBet(id: number, updates: Partial<Bet>): Bet | null {
  const bets = getBets();
  const index = bets.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bets[index] = { ...bets[index], ...updates };
  fs.writeFileSync(betsFile, JSON.stringify(bets, null, 2));
  return bets[index];
}

export function deleteBet(id: number): boolean {
  const bets = getBets();
  const filtered = bets.filter(b => b.id !== id);
  if (filtered.length === bets.length) return false;
  
  fs.writeFileSync(betsFile, JSON.stringify(filtered, null, 2));
  return true;
}

// Prop operations
export function getProps(): Prop[] {
  try {
    const data = fs.readFileSync(propsFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addProp(prop: Omit<Prop, 'id'>): Prop {
  const props = getProps();
  const newProp: Prop = {
    ...prop,
    id: Math.max(0, ...props.map(p => p.id)) + 1,
  };
  props.push(newProp);
  fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
  return newProp;
}

export function updateProp(id: number, updates: Partial<Prop>): Prop | null {
  const props = getProps();
  const index = props.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  props[index] = { ...props[index], ...updates };
  fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
  return props[index];
}

export function deleteProp(id: number): boolean {
  const props = getProps();
  const filtered = props.filter(p => p.id !== id);
  if (filtered.length === props.length) return false;
  
  fs.writeFileSync(propsFile, JSON.stringify(filtered, null, 2));
  return true;
}

// User operations
export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getUser(username: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
}

export function updateUser(username: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return users[index];
}

export function updateUserFromBet(username: string, bet: Bet, oldStatus: string): User | null {
  const user = getUser(username);
  if (!user) return null;

  const updates: Partial<User> = { ...user };

  // Remove old status impact
  if (oldStatus === 'won') {
    updates.totalWins = Math.max(0, (updates.totalWins || 0) - 1);
    updates.currentBalance = (updates.currentBalance || 0) - (bet.amount * bet.odds);
  } else if (oldStatus === 'lost') {
    updates.totalLosses = Math.max(0, (updates.totalLosses || 0) - 1);
    // No balance adjustment needed - it was already deducted when placed
  }

  // Apply new status impact
  if (bet.status === 'won') {
    updates.totalWins = (updates.totalWins || 0) + 1;
    updates.currentBalance = (updates.currentBalance || 0) + (bet.amount * bet.odds);
  } else if (bet.status === 'lost') {
    updates.totalLosses = (updates.totalLosses || 0) + 1;
    // No balance adjustment needed - it was already deducted when placed
  }

  return updateUser(username, updates);
}
