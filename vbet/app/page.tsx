import Navbar from './components/Navbar';
import Options from './components/Options';  // Ensure correct path

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 bg-gray-900">
      <Navbar/>
      <Options />
    </main>
  );
}
