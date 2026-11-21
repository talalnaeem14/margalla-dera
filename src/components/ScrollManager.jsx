import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll behaviour for page changes (fixes reference-site Problem 3):
//  - opening a new page (PUSH) starts at the top
//  - Back/Forward (POP) returns to where the user was on that page
//  - filter changes use REPLACE, so they never move the page
// The browser's own restoration is switched off because it runs before React
// has drawn the page, which lands in the wrong place.
const savedPositions = new Map(); // location.key -> scrollY

export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    // Record the position of whichever page is current as the user scrolls.
    const onScroll = () => savedPositions.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Layout effect: runs before the browser can fire a scroll event for the new page,
  // so the old page's saved position is never overwritten by a clamped value.
  useLayoutEffect(() => {
    keyRef.current = location.key;
    const pathChanged = pathRef.current !== location.pathname;
    pathRef.current = location.pathname;

    if (navType === "POP") {
      window.scrollTo(0, savedPositions.get(location.key) ?? 0);
    } else if (navType === "PUSH" && pathChanged) {
      window.scrollTo(0, 0);
    }
  }, [location, navType]);

  return null;
}
