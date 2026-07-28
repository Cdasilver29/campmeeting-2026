"use client";

import { useEffect, useState } from "react";

/**
 * Whether the browser currently reports a connection.
 *
 * Starts optimistic and is corrected on mount: the server has no way to
 * know, so assuming online is what keeps the first client render
 * identical to the prerendered HTML. navigator.onLine only promises that
 * a network interface exists, which on the campground can mean one bar
 * and nothing getting through — so this is used to warn early, never as
 * proof that a send will succeed. The submit path still has to handle a
 * request that fails while the browser believes it is online.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
