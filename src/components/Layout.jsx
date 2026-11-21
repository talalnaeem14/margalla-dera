import { NavLink, Outlet } from "react-router-dom";
import DemoControls from "./DemoControls.jsx";

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            Margalla Dera
          </NavLink>
          <nav aria-label="Main">
            <NavLink to="/" end>
              Menu
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>Margalla Dera is a fictional restaurant. All orders are simulated.</p>
          <DemoControls />
        </div>
      </footer>
    </>
  );
}
