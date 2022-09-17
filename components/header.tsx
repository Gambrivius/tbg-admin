import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

function AccountStatus() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    const welcome_string = `Signed in as ${session.user?.name}`;
    return (
      <NavDropdown title={welcome_string} id="collasible-nav-dropdown">
        <NavDropdown.Item onClick={() => signOut()}>Signout</NavDropdown.Item>
      </NavDropdown>
    );
  } else
    return (
      <>
        <Nav.Link onClick={() => signIn()}>Sign in</Nav.Link>
      </>
    );
}

export function Header() {
  const { data: session, status } = useSession();
  return (
    <Navbar bg="dark" variant="dark" className="App-header">
      <Navbar.Brand href="/">
        Xentropy's Spellbook of{" "}
        <span className="magic_glow">World Building</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <NavDropdown title="Builder" id="collasible-nav-dropdown">
            <NavDropdown.Item href="/zones">Zones</NavDropdown.Item>
            <NavDropdown.Item href="/builder/rooms">Rooms</NavDropdown.Item>
            <NavDropdown.Item href="/builder/story">
              Story Objects
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Nav>
          <AccountStatus></AccountStatus>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
