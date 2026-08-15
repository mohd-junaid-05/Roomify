import React from "react";
import Button from "./ui/button";
import { Box } from "lucide-react";
import "../app.css";
import { useOutletContext } from "react-router";
import puter from '@heyputer/puter.js';

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut, refreshAuth } = useOutletContext<AuthContext>()

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut()
      } catch (error) {
        console.log("Puter Signout failed", error)
      }
      return;
    }

    try {
      // Call signIn() synchronously within the click to preserve
      // the browser's user-gesture context — otherwise the popup is blocked
      const signInPromise = puter.auth.signIn();
      await signInPromise;
      await refreshAuth();
    } catch (error) {
      console.log("Puter Signin failed", error)
    }
  };
  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className={"name"}>Roomify</span>
            <ul className="links">
              <a href={"#"}>Product</a>
              <a href={"#"}>Pricing</a>
              <a href={"#"}>Community</a>
              <a href={"#"}>Enterprise</a>
            </ul>
          </div>
        </div>
        <div className="action">
          {isSignedIn ? (
            <>
            <span className="greeting">{userName ? `Hi, ${userName}  ` : 'Signed in'}</span>
            <Button  onClick={handleAuthClick} className="btn">Log Out</Button>
            </>
          ) : (
            <>
              <Button onClick={handleAuthClick} className="login" variant="ghost">
                Log In
              </Button>
              <Button onClick={handleAuthClick} className="cta">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Navbar;
