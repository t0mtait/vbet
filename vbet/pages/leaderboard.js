import React from 'react';
import Navbar from '../app/components/Navbar';
import Lb from '../app/components/Leaderboard';
import "../app/globals.css";

export default function Leaderboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 bg-gray-900">
      <div className="w-full max-w-4xl"> {/* Shared container for consistent width */}
        <Navbar />
        <Lb />
      </div>
    </main>
  );
}