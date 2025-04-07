import React from 'react';
import Navbar from '../app/components/Navbar';
import "../.next/static/css/app/layout.css"
import B from "../app/components/Bets"
import "../app/globals.css"

const Bets = () => {
  return (
    <div>
        <Navbar />
        <B/>
    </div>
  );
};

export default Bets;
