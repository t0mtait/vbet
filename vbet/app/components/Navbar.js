import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";


const NavbarComponent = () => {
  return (
    <Navbar fluid rounded className="bg-gray-800">
      <NavbarBrand as={Link} href="/">
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink as={Link} href="/" className="text-white">
          Home
        </NavbarLink>
        <NavbarLink as={Link} href="/leaderboard" className="text-white">
          Leaderboard
        </NavbarLink>
        <NavbarLink as={Link} href="/bets" className="text-white">
          Bets
        </NavbarLink>
        <NavbarLink as={Link} href="/releases" className="text-white">
          Releases
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default NavbarComponent;
