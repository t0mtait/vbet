import React from 'react';
import Navbar from '../app/components/Navbar';
import "../.next/static/css/app/layout.css"
import { TextInput } from 'flowbite-react';
const Bets = () => {
  return (
    <div>
        <Navbar />
        <TextInput id="username" type="text" placeholder = "enter username here..."/>

    </div>
  );
};

export default Bets;
