import { DarkThemeToggle } from "flowbite-react";
import Navbar from './components/Navbar';
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <Navbar/>
    </main>
  );
}
