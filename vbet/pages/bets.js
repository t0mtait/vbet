import React from 'react';
import Navbar from '../app/components/Navbar';
import "../app/globals.css"
import B from '../app/components/Bets'
import Settler from '../app/components/BetSettler'
const Bets = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 bg-gray-900">
      <div>
          <Navbar />
          <Settler/>
          <B />

      </div>
    </main>
  );
};

export default Bets;
