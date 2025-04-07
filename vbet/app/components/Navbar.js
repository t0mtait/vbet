import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";


const NavbarComponent = () => {
  return (
    <Navbar fluid rounded>
      <NavbarBrand as={Link} href="/">
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink as={Link} href="/" active>
          Home
        </NavbarLink>
        <NavbarLink as={Link} href="/leaderboard">
          Leaderboard
        </NavbarLink>
        <NavbarLink as={Link} href="/bets">
          Bets
        </NavbarLink>
        <NavbarLink as={Link} href="/releases">
          Releases
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default NavbarComponent;
