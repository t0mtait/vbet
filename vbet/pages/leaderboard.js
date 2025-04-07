import React from 'react';
import Navbar from '../app/components/Navbar';
import Lb from '../app/components/Leaderboard'
import "../app/globals.css"

export default function Leaderboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 bg-white dark:bg-gray-900">
      <Navbar/>
      <Lb/>
    </main>
  );
}

