"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayed, setDisplayed] = useState(children);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const t = setTimeout(() => {
      setDisplayed(children);
      setFade(true);
    }, 120);
    return () => clearTimeout(t);
  }, [pathname, children]);

  return (
    <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.18s ease", minHeight: "100vh" }}>
      {displayed}
    </div>
  );
}
