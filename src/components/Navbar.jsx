import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShieldAlert,
  LogIn,
  Briefcase,
  Home,
  User,
  LogOut,
  Info,
  Phone,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const Navbar = ({ setPage, currentPage, currentUser, setCurrentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    // Clear Supabase session
    await supabase.auth.signOut();
    // Clear local storage
    localStorage.removeItem("current_user");
    setCurrentUser(null);
    setPage("home");
  };

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const isHome = currentPage === "home";
  const navClasses = `fixed w-full z-50 transition-all duration-300 ${
    scrolled || !isHome || isOpen
      ? "bg-gradient-to-r from-slate-900 via-ocean-900 to-slate-900 shadow-lg py-2"
      : "bg-transparent py-4"
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group relative z-50"
            onClick={() => setPage("home")}
          >
            <img
              src="/logo.png"
              alt="MOJA SEZONA"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
            />
            <span className="font-bold text-xl tracking-wider hidden sm:block">
              <span className="text-white">MOJA</span>{" "}
              <span className="text-sun-400">SEZONA</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <button
                onClick={() => setPage("home")}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === "home"
                    ? "text-sea-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Početna
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-sea-400 to-sun-500 transition-all duration-300 ${
                    currentPage === "home" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </button>
              <button
                onClick={() => setPage("about")}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === "about"
                    ? "text-sea-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                O Nama
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-sea-400 to-sun-500 transition-all duration-300 ${
                    currentPage === "about"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </button>
              <button
                onClick={() => setPage("contact")}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === "contact"
                    ? "text-sea-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Kontakt
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-sea-400 to-sun-500 transition-all duration-300 ${
                    currentPage === "contact"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </button>
              {/* Call to Action Button */}
              {currentUser ? (
                <div className="flex items-center gap-3 pl-4 border-l border-ocean-700/50">
                  <div className="flex items-center gap-3 bg-slate-800/50 p-1 pl-3 pr-1 rounded-full border border-ocean-700 hover:border-sea-500/30 transition-all">
                    <span className="text-sm font-bold text-slate-300">
                      {currentUser.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-full bg-slate-700 text-slate-400 hover:bg-red-500 hover:text-white transition-all"
                      title="Odjavi se"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>

                  {/* Dashboard Link for Admins */}
                  {(currentUser.role === "staff" ||
                    currentUser.role === "master") && (
                    <button
                      onClick={() => setPage("dashboard")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all shadow-lg hover:bg-sea-400 bg-sea-500 shadow-sea-500/20"
                      title="Moj Dashboard"
                    >
                      <User size={18} />
                      <span>Dashboard</span>
                    </button>
                  )}

                  {/* Dashboard/Admin Link */}
                  <button
                    onClick={() =>
                      setPage(
                        currentUser.role === "candidate" &&
                          (!currentUser.email ||
                            currentUser.email.toLowerCase() !==
                              "rsbredzo@gmail.com")
                          ? "dashboard"
                          : "admin",
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg hover:opacity-90 ${
                      currentUser.role === "candidate" &&
                      (!currentUser.email ||
                        currentUser.email.toLowerCase() !==
                          "rsbredzo@gmail.com")
                        ? "bg-gradient-to-r from-sea-500 to-sun-500 text-white shadow-sea-500/20"
                        : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-400"
                    }`}
                    title={
                      currentUser.role === "candidate" &&
                      (!currentUser.email ||
                        currentUser.email.toLowerCase() !==
                          "rsbredzo@gmail.com")
                        ? "Moj Dashboard"
                        : "Admin Panel"
                    }
                  >
                    {currentUser.role === "candidate" &&
                    (!currentUser.email ||
                      currentUser.email.toLowerCase() !==
                        "rsbredzo@gmail.com") ? (
                      <>
                        <User size={18} />
                        <span>Dashboard</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={18} />
                        <span>Admin Panel</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPage("auth")}
                  className="ml-4 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LogIn size={18} />{" "}
                  <span className="text-sm font-medium">Prijava</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden relative z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-800 p-2 rounded-lg text-sea-400 hover:text-white hover:bg-gradient-to-r hover:from-sea-500 hover:to-sun-500 transition-colors shadow-lg"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-gradient-to-b from-slate-900 via-ocean-900 to-slate-900 h-[100dvh] flex flex-col justify-center transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 space-y-4">
          <button
            onClick={() => {
              setPage("home");
              setIsOpen(false);
            }}
            className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl text-xl font-bold transition-all ${
              currentPage === "home"
                ? "bg-sea-500/10 text-sea-400 border border-sea-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Home size={24} /> Početna
          </button>

          <button
            onClick={() => {
              setPage("about");
              setIsOpen(false);
            }}
            className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl text-xl font-bold transition-all ${
              currentPage === "about"
                ? "bg-sea-500/10 text-sea-400 border border-sea-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Info size={24} /> O Nama
          </button>
          <button
            onClick={() => {
              setPage("contact");
              setIsOpen(false);
            }}
            className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl text-xl font-bold transition-all ${
              currentPage === "contact"
                ? "bg-sea-500/10 text-sea-400 border border-sea-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Phone size={24} /> Kontakt
          </button>
          <div className="border-t border-ocean-800 my-4"></div>

          {/* Dashboard Link for Admins (Mobile) */}
          {currentUser &&
            (currentUser.role === "staff" || currentUser.role === "master") && (
              <button
                onClick={() => {
                  setPage("dashboard");
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-4 mb-4 rounded-xl text-lg font-bold bg-gradient-to-r from-sea-500 to-sea-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <User size={20} /> Moj Dashboard
              </button>
            )}

          <button
            onClick={() => {
              if (
                currentUser &&
                (currentUser.role === "staff" || currentUser.role === "master")
              )
                setPage("admin");
              else if (currentUser) setPage("dashboard");
              else setPage("auth");
              setIsOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-sun-500 to-sun-600 text-white shadow-lg active:scale-95 transition-all"
          >
            {currentUser &&
            (currentUser.role === "staff" || currentUser.role === "master") ? (
              <>
                <ShieldAlert size={20} /> Admin Panel
              </>
            ) : currentUser ? (
              <>
                <User size={20} /> Moj Dashboard
              </>
            ) : (
              <>
                <LogIn size={20} /> Registracija / Prijava
              </>
            )}
          </button>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl text-lg font-medium text-slate-400 hover:bg-slate-800 transition-all mt-2"
            >
              <LogOut size={20} /> Odjavi se
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
