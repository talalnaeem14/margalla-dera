import { NavLink, Outlet } from "react-router-dom";
import DemoControls from "./DemoControls.jsx";
import StatusBar from "./StatusBar.jsx";

// Moves focus to the main content without adding a "#main" entry to the history.
function skipToMain(event) {
  event.preventDefault();
  const main = document.getElementById("main");
  main?.focus();
  main?.scrollIntoView();
}

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      {/* After the skip link so it is the first thing a keyboard user reaches. */}
      <StatusBar />
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
