import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Footer from "./components/Footer";
import ApplicationForm from "./components/ApplicationForm";
import AdminDashboard from "./components/AdminDashboard";
import UserAuth from "./components/UserAuth";
import CandidateDashboard from "./components/CandidateDashboard";

import About from "./components/About";
import Contact from "./components/Contact";
import { Loader } from "lucide-react";

export default function App() {
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(null); // Supabase User (Technical)
  const [currentUser, setCurrentUser] = useState(null); // Registered User (Application User)

  // Detect if we are using the placeholder config
  const isDemo =
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === "your-project-url";

  useEffect(() => {
    // Function to hydrate user profile from DB
    const hydrateUser = async (sessionUser) => {
      if (!sessionUser) {
        setCurrentUser(null);
        return;
      }

      console.log("Hydrating user:", sessionUser.email);
      let userProfile = null;
      let role = "candidate";

      // 1. Check Master Admin Fallback (Safety Net)
      if (sessionUser?.email?.toLowerCase() === "rsbredzo@gmail.com") {
        console.log("Owner hydration detected via fallback.");
        setCurrentUser({
          ...sessionUser,
          name: "Redzep",
          email: "rsbredzo@gmail.com",
          role: "master",
        });
        return;
      }

      // 2. Check Admins Table
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("email", sessionUser.email)
        .single();

      if (adminData) {
        // STRICT RULE: Only 'rsbredzo@gmail.com' can be 'master'.
        // Even if DB says 'master' for others, we demote them to 'staff' here.
        role =
          adminData.email.toLowerCase() === "rsbredzo@gmail.com"
            ? "master"
            : "staff";
        userProfile = adminData;
      } else {
        // 3. Check Users Table (Candidates)
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", sessionUser.email)
          .single();

        if (userData) {
          userProfile = userData;
        }
      }

      setCurrentUser({
        ...sessionUser,
        ...userProfile,
        role: role,
        email: sessionUser.email,
      });
    };

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && !isDemo) {
        hydrateUser(session.user);
      } else {
        // Fallback: Check LocalStorage for manual bypass user (Superadmin)
        const stored = localStorage.getItem("current_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email === "rsbredzo@gmail.com") {
              console.log("Restoring Superadmin from LocalStorage (Bypass)");
              setCurrentUser({ ...parsed, role: "master", name: "Redzep" });
            }
          } catch (e) {
            console.error("Error parsing stored user", e);
          }
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !isDemo) {
        hydrateUser(session.user);
      } else if (!session?.user) {
        // Fallback: Check if we are using the BYPASS login before clearing
        const stored = localStorage.getItem("current_user");
        let isBypass = false;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email === "rsbredzo@gmail.com") {
              // We found the bypass user, so we KEEP them logged in
              isBypass = true;
              console.log("Keeping Superadmin logged in (Bypass active)");
              // Ensure they are set in state if not already
              setCurrentUser((prev) =>
                prev?.email === "rsbredzo@gmail.com"
                  ? prev
                  : { ...parsed, role: "master", name: "Redzep" },
              );
            }
          } catch (e) {}
        }

        if (!isBypass) {
          setCurrentUser(null);
        }
      }
    });

    // Demo Mode Persistence
    if (isDemo) {
      const storedUser = JSON.parse(
        localStorage.getItem("current_user") || "null",
      );
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    }

    return () => subscription.unsubscribe();
  }, [isDemo]);

  return (
    <div className="font-sans text-gray-900 bg-gradient-to-b from-slate-50 to-sea-50/20 min-h-screen flex flex-col">
      {/* Navbar always visible except on Login */}
      {page !== "login" && page !== "admin" && page !== "auth" && (
        <Navbar
          setPage={setPage}
          currentPage={page}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}

      {/* Page Content */}
      <div className="flex-grow">
        {page === "home" && (
          <>
            <Hero setPage={setPage} />
            <Services />
          </>
        )}

        {/* Login Component Removed */}

        {page === "admin" &&
          (currentUser &&
          (currentUser.role === "master" ||
            currentUser.role === "staff" ||
            (currentUser.email &&
              currentUser.email.toLowerCase() === "rsbredzo@gmail.com")) ? (
            <AdminDashboard
              user={user}
              setPage={setPage}
              adminUser={currentUser}
              setAdminUser={setCurrentUser}
              isDemo={isDemo}
            />
          ) : (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 text-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Učitavanje Dashboarda...
                </h2>
                {currentUser ? (
                  <div className="text-red-400">
                    <p>Pristup nije dozvoljen ili se podaci učitavaju.</p>
                    <p>Vaša uloga: {currentUser.role || "Nema uloge"}</p>
                    <p>Email: {currentUser.email}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
                    >
                      Osvježi Stranicu
                    </button>
                  </div>
                ) : (
                  <p>Provjera autorizacije...</p>
                )}
              </div>
            </div>
          ))}

        {page === "auth" && (
          <UserAuth
            setCurrentUser={(user) => {
              setCurrentUser(user);
            }}
            setPage={setPage}
            isDemo={isDemo}
          />
        )}

        {page === "dashboard" &&
          (currentUser ? (
            <CandidateDashboard
              user={currentUser}
              setPage={setPage}
              isDemo={isDemo}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 text-white">
              <Loader className="animate-spin h-8 w-8 text-sun-500 mb-4" />
              <p>Učitavanje korisničkog profila...</p>
            </div>
          ))}

        {page === "about" && <About />}
        {page === "contact" && <Contact />}
      </div>

      {/* Footer always visible except on Admin/Login */}
      {page !== "admin" && page !== "login" && page !== "auth" && (
        <Footer setPage={setPage} />
      )}
    </div>
  );
}
