import { Outlet, useLocation } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/react";
import GlobalSidePanel from "../components/GlobalSidePanel";
export default function Layout() {
  const location = useLocation();

  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/*" ||
    location.pathname === "/privacy" ||
    location.pathname === "/condition" ||
    location.pathname === "/admin" ||
    location.pathname === "/account";

  const hideNavbar =
    location.pathname === "/admin" || location.pathname === "/account";

  return (
    <div className="main-layout min-vh-100">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <GlobalSidePanel />
        <Outlet />
        <Analytics />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
