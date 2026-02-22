'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full sticky top-0 z-50 bg-gradient-to-r from-red-700 via-red-600 to-red-500 shadow-2xl">
      <div className="w-full max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-4xl font-bold text-white hover:text-red-100 transition-colors whitespace-nowrap"
          >
            vBet
          </Link>
          <div className="flex gap-2 md:gap-4">
            <NavLink href="/place-bet" label="Place Bet" isActive={isActive('/place-bet')} />
            <NavLink href="/bets" label="View Bets" isActive={isActive('/bets')} />
            <NavLink href="/manage-props" label="Manage Props" isActive={isActive('/manage-props')} />
            <NavLink href="/leaderboard" label="Leaderboard" isActive={isActive('/leaderboard')} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 whitespace-nowrap ${
        isActive
          ? 'bg-red-900 text-white shadow-lg'
          : 'text-red-50 hover:bg-red-600 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
