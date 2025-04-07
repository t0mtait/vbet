import React from 'react';
import Options from '../app/components/Options';  // Ensure correct path
import Navbar from '../app/components/Navbar';
import "../.next/static/css/app/layout.css"
import { TextInput } from 'flowbite-react';
const Bets = () => {
  return (
    <div>
        <Navbar />
        <TextInput id="username" type="text" placeholder = "enter username here..."/>
        <Options />
    </div>
  );
};

export default Bets;
