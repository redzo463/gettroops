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
      if (sessionUser.email === "rsbredzo@gmail.com") {
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
        role = adminData.name.toLowerCase() === "redzep" ? "master" : "staff";
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
        setCurrentUser(null);
      }
    });

    // Demo Mode Persistence
    if (isDemo) {
      const storedUser = JSON.parse(
        localStorage.getItem("current_user") || "null"
      );
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    }

    return () => subscription.unsubscribe();
  }, [isDemo]);

  return (
    <div className="font-sans text-gray-900 bg-slate-50 min-h-screen flex flex-col">
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
          currentUser &&
          (currentUser.role === "master" || currentUser.role === "staff") && (
            <AdminDashboard
              user={user}
              setPage={setPage}
              adminUser={currentUser} // Use currentUser as adminUser
              setAdminUser={setCurrentUser} // Allow updating currentUser
              isDemo={isDemo}
            />
          )}

        {page === "auth" && (
          <UserAuth
            setCurrentUser={(user) => {
              setCurrentUser(user);
            }}
            setPage={setPage}
            isDemo={isDemo}
          />
        )}

        {page === "dashboard" && currentUser && (
          <CandidateDashboard
            user={currentUser}
            firebaseUser={user}
            setPage={setPage}
            isDemo={isDemo}
          />
        )}

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
