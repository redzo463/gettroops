import React, { useState, useEffect } from "react";
import {
  Users,
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

const Navbar = ({ setPage, currentPage, currentUser, setCurrentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
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
      ? "bg-slate-900 shadow-lg py-2"
      : "bg-transparent py-4"
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer gap-3 group relative z-50"
            onClick={() => setPage("home")}
          >
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
              <Users className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wider block text-white group-hover:text-amber-400 transition-colors">
                GET TROOPS
              </span>
              <span className="hidden sm:block text-[10px] text-amber-500 tracking-[0.2em] uppercase font-semibold">
                Staffing Agency
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <button
                onClick={() => setPage("home")}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === "home"
                    ? "text-amber-500"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Početna
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${
                    currentPage === "home" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </button>
              <button
                onClick={() => setPage("about")}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === "about"
                    ? "text-amber-500"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                O Nama
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${
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
                    ? "text-amber-500"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Kontakt
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${
                    currentPage === "contact"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </button>
              {/* Call to Action Button */}
              {currentUser ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                  <div className="flex items-center gap-3 bg-slate-800/50 p-1 pl-3 pr-1 rounded-full border border-slate-700 hover:border-amber-500/30 transition-all">
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
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-900 transition-all shadow-lg hover:bg-white bg-amber-500 shadow-amber-500/20"
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
                        currentUser.role === "candidate" ? "dashboard" : "admin"
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-900 transition-all shadow-lg hover:bg-white ${
                      currentUser.role === "candidate"
                        ? "bg-amber-500 shadow-amber-500/20"
                        : "bg-red-500 text-white shadow-red-500/20 hover:text-red-500"
                    }`}
                    title={
                      currentUser.role === "candidate"
                        ? "Moj Dashboard"
                        : "Admin Panel"
                    }
                  >
                    {currentUser.role === "candidate" ? (
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
              className="bg-slate-800 p-2 rounded-lg text-amber-500 hover:text-white hover:bg-amber-500 transition-colors shadow-lg"
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
        className={`md:hidden fixed inset-0 z-40 bg-slate-900 h-[100dvh] flex flex-col justify-center transition-transform duration-300 ease-in-out ${
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
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Phone size={24} /> Kontakt
          </button>
          <div className="border-t border-slate-800 my-4"></div>

          {/* Dashboard Link for Admins (Mobile) */}
          {currentUser &&
            (currentUser.role === "staff" || currentUser.role === "master") && (
              <button
                onClick={() => {
                  setPage("dashboard");
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-4 mb-4 rounded-xl text-lg font-bold bg-amber-600 text-white shadow-lg active:scale-95 transition-all"
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
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl text-lg font-bold bg-amber-600 text-white shadow-lg active:scale-95 transition-all"
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
