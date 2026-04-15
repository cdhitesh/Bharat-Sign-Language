// frontend/src/components/layout/Navbar.jsx

import { NavLink } from "react-router-dom";
import { useAuth, useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import {
  Home, BookOpen, Search, Brain, Clock, HandMetal,
} from "lucide-react";

const navLinks = [
  { to: "/",        label: "Home",    Icon: Home      },
  { to: "/library", label: "Library", Icon: BookOpen  },
  { to: "/search",  label: "Search",  Icon: Search    },
  { to: "/quiz",    label: "Quiz",    Icon: Brain     },
  { to: "/history", label: "History", Icon: Clock     },
];

const Navbar = () => {
  const { isSignedIn } = useAuth();
  const { user }       = useUser();

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav
        className="hidden md:flex items-center justify-between
                   px-8 h-16 sticky top-0 z-50 animate-fade-in"
        style={{
          background:   "rgba(253,250,244,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid var(--border)",
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center
                       justify-center transition-transform duration-300
                       group-hover:scale-105 group-hover:rotate-3"
            style={{ background: "var(--forest)" }}
          >
            <HandMetal size={18} color="white" strokeWidth={2} />
          </div>
          <span
            className="font-display font-bold text-xl"
            style={{ color: "var(--ink)" }}
          >
            Sign<span style={{ color: "var(--forest)" }}>Learn</span>
          </span>
        </NavLink>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              style={{ animationDelay: `${i * 50}ms` }}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                 font-bold tracking-wide transition-all duration-200
                 animate-fade-in ${
                  isActive
                    ? "nav-active"
                    : "hover:bg-cream-2"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "white" : "var(--ink-muted)",
                animationDelay: `${i * 50}ms`,
              })}
            >
              <link.Icon size={15} strokeWidth={2.5} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-lg"
                style={{
                  background: "var(--cream-2)",
                  color: "var(--ink-muted)",
                }}
              >
                Hi, {user?.firstName || "there"}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-offset-1 ring-forest-500",
                  },
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary animate-fade-in">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{
          background:   "rgba(253,250,244,0.95)",
          backdropFilter: "blur(16px)",
          borderTop:    "1.5px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2
                 rounded-xl min-w-[56px] transition-all duration-200 ${
                  isActive ? "nav-active" : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    color={isActive ? "white" : "var(--ink-faint)"}
                  />
                  <span
                    className="text-[10px] font-bold tracking-wide"
                    style={{
                      color: isActive ? "white" : "var(--ink-faint)",
                      fontFamily: "Lato, sans-serif",
                    }}
                  >
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Auth */}
          <div className="flex flex-col items-center gap-1 px-3 py-2
                          min-w-[56px]">
            {isSignedIn ? (
              <>
                <UserButton afterSignOutUrl="/" />
                <span
                  className="text-[10px] font-bold tracking-wide"
                  style={{ color: "var(--ink-faint)" }}
                >
                  Profile
                </span>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center
                               justify-center"
                    style={{ background: "var(--cream-2)" }}
                  >
                    <HandMetal
                      size={16}
                      color="var(--ink-faint)"
                      strokeWidth={2}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    Sign In
                  </span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;