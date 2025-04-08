import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";


const NavbarComponent = () => {
  return (
    <Navbar fluid rounded className="bg-gray-800">
      <NavbarBrand as={Link} href="/">
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink as={Link} href="/" className="custom-navbar-link">
          Home
        </NavbarLink>
        <NavbarLink as={Link} href="/leaderboard" className="custom-navbar-link">
          Leaderboard
        </NavbarLink>
        <NavbarLink as={Link} href="/bets" className="custom-navbar-link">
          Bets
        </NavbarLink>
        <NavbarLink as={Link} href="https://github.com/t0mtait/vbet-v2/releases" className="custom-navbar-link-2">
          Whats new
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default NavbarComponent;
