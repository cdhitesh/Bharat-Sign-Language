// frontend/src/components/layout/Layout.jsx

import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import { HandMetal } from "lucide-react";

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      <Navbar />

      <main
        key={pathname}
        className="flex-1 max-w-7xl mx-auto w-full
                   px-4 sm:px-6 lg:px-8 py-8
                   pb-28 md:pb-10 animate-fade-up"
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="hidden md:block mt-auto py-5 px-8"
        style={{ borderTop: "1.5px solid var(--border)",
                 background: "var(--cream-2)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "var(--forest)" }}
            >
              <HandMetal size={13} color="white" strokeWidth={2} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--ink-muted)" }}
            >
              SignLearn — Smart India Hackathon 2024
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;