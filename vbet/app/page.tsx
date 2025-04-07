import Navbar from './components/Navbar';
import Options from './components/Options';  // Ensure correct path
import { TextInput } from 'flowbite-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <Navbar/>
      <TextInput id="username" type="text" placeholder = "enter username here..."/>
      <Options />
    </main>
  );
}
