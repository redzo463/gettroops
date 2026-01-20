import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader, Waves, Sun } from "lucide-react";
import { supabase } from "../lib/supabase";

const UserAuth = ({ setCurrentUser, setPage, isDemo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isDemo) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem("demo_users") || "[]");

        if (isLogin) {
          // LOGIN LOGIC

          // 1. Check Master User
          if (
            formData.email.toLowerCase() === "rsbredzo@gmail.com" &&
            formData.password === "Cikrb_4002"
          ) {
            const masterUser = {
              id: "master-admin",
              name: "Redzep",
              email: "rsbredzo@gmail.com",
              role: "master",
              code: "Cikrb_4002",
            };
            localStorage.setItem("current_user", JSON.stringify(masterUser));
            setCurrentUser(masterUser);
            setPage("admin");
            return;
          }

          // 2. Check Standard Users
          const user = users.find(
            (u) =>
              u.email.toLowerCase() === formData.email.toLowerCase() &&
              u.password === formData.password,
          );
          if (user) {
            const userData = { ...user, isLoggedIn: true };

            // FORCE MASTER for Owner in Demo Mode (even if stored as user)
            if (userData.email.toLowerCase() === "rsbredzo@gmail.com") {
              userData.role = "master";
              userData.name = "Redzep";
            }

            localStorage.setItem("current_user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Redirect based on role
            // Important: If a regular user was somehow given 'staff' or 'master' role in storage,
            // the system will still respect it, but the PRIMARY entry point for the owner is the hardcode above.
            setPage(
              userData.role === "staff" || userData.role === "master"
                ? "admin"
                : "dashboard",
            );
          } else {
            setError(
              "DEMO MODE: Korisnik nije pronađen. Za admin pristup koristite: rsbredzo@gmail.com / Cikrb_4002",
            );
          }
        } else {
          // DEMO REGISTER LOGIC
          if (users.some((u) => u.email === formData.email)) {
            setError("Korisnik sa ovim emailom već postoji (Local Storage).");
          } else {
            const newUser = {
              id: `user-${Date.now()}`,
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: "candidate",
              createdAt: new Date().toISOString(),
            };

            console.log("Saving new Demo User:", newUser);
            const updatedUsers = [...users, newUser];
            localStorage.setItem("demo_users", JSON.stringify(updatedUsers));
            localStorage.setItem("current_user", JSON.stringify(newUser));
            setCurrentUser(newUser);
            alert("Registracija uspješna (Demo Mode)! Sada ste prijavljeni.");
            setPage("dashboard");
          }
        }
      } else {
        // SUPABASE LOGIC (Mode: !isDemo)
        if (isLogin) {
          // LOGIN
          let authData = { user: null, session: null };
          let authError = null;

          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });
            authData = data;
            authError = error;
          } catch (err) {
            authError = err;
          }

          // FAILSAFE: If Supabase fails but credentials match Super Admin, allow bypass
          if (
            authError &&
            formData.email.toLowerCase() === "rsbredzo@gmail.com" &&
            formData.password === "Cikrb_4002"
          ) {
            console.warn("Supabase Auth failed, using Superadmin Fallback");
            authData.user = {
              id: "master-admin-bypass",
              email: "rsbredzo@gmail.com",
              role: "authenticated",
            };
            authData.session = {
              access_token: "mock-token",
              user: authData.user,
            };
            // Manually persist to local storage for BYPASS persistance on refresh
            localStorage.setItem("current_user", JSON.stringify(authData.user));
            authError = null; // Clear error to proceed
          }

          if (authError) throw authError;

          const data = authData; // Compatibility alias
          console.log("Login successful:", formData.email);

          // Role Check
          let role = "candidate";
          let userProfile = null;

          const { data: adminData } = await supabase
            .from("admins")
            .select("*")
            .eq("email", formData.email.toLowerCase())
            .single();

          if (adminData) {
            // STRICT RULE: Only 'rsbredzo@gmail.com' can be 'master'.
            role =
              adminData.email.toLowerCase() === "rsbredzo@gmail.com"
                ? "master"
                : "staff";
            userProfile = adminData;
          } else if (formData.email.toLowerCase() === "rsbredzo@gmail.com") {
            role = "master";
            userProfile = {
              name: "Redzep",
              email: "rsbredzo@gmail.com",
              role: "master",
            };
          } else {
            const { data: candidateData } = await supabase
              .from("users")
              .select("*")
              .eq("email", formData.email)
              .single();
            if (candidateData) userProfile = candidateData;
          }

          const userData = {
            ...data.session.user,
            ...userProfile,
            role: role,
            email: formData.email,
          };
          setCurrentUser(userData);
          setPage(
            role === "master" || role === "staff" ? "admin" : "dashboard",
          );
        } else {
          // REGISTER
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: { full_name: formData.name } },
          });

          if (error) throw error;

          console.log("Supabase SignUp Result:", data);

          // Check Email Confirmation
          if (data.user && !data.session) {
            alert(
              "Registracija uspješna! Molimo provjerite svoj email i potvrdite račun prije prijave.",
            );
            setIsLogin(true);
            return;
          }

          // Auto-login logic
          // Ensure new standard signups are treated as 'candidate'
          const finalRole = "candidate";

          const newUser = {
            ...data.user,
            name: formData.name,
            role: finalRole,
          };

          setCurrentUser(newUser);
          // Redirect strictly to dashboard for new candidates
          setPage("dashboard");
          alert("Registracija uspješna! Dobrodošli.");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-sun-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-sea-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full h-full">
          <path
            d="M0,50 C480,100 960,0 1440,50 L1440,100 L0,100 Z"
            fill="url(#authWave)"
          />
          <defs>
            <linearGradient id="authWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2CB5C9" />
              <stop offset="100%" stopColor="#0099CC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-ocean-500/20 p-8 rounded-3xl shadow-2xl relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="w-6 h-6 text-sea-400" />
            <Sun className="w-6 h-6 text-sun-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Dobrodošli nazad" : "Kreirajte račun"}
          </h2>
          <p className="text-slate-400">
            {isLogin
              ? "Prijavite se da pratite status prijave"
              : "Registrujte se za početak karijere"}
          </p>
        </div>

        {isDemo && (
          <div className="mb-6 bg-sun-500/10 border border-sun-500/20 rounded-xl p-4 text-center">
            <p className="text-sun-200 text-sm font-semibold">
              ⚠️ DEMO MODE ACTIVE
            </p>
            <p className="text-sun-500/70 text-xs mt-1">
              Database connection missing. Using local memory only.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-sm font-bold mb-2">
                Ime i Prezime
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-ocean-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-sea-500 focus:border-sea-500 outline-none transition-all"
                  placeholder="Vaše ime"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Email Adresa
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-slate-500"
                size={20}
              />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-ocean-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-sea-500 focus:border-sea-500 outline-none transition-all"
                placeholder="primjer@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Lozinka
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-500"
                size={20}
              />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-ocean-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-sea-500 focus:border-sea-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sun-500 to-sun-400 hover:from-sun-400 hover:to-sun-300 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-sun-500/20"
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : isLogin ? (
              "Prijavi se"
            ) : (
              "Registruj se"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-sea-400 text-sm transition-colors"
          >
            {isLogin
              ? "Nemate račun? Registrujte se"
              : "Već imate račun? Prijavite se"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-ocean-700/50 text-center">
          <button
            onClick={() => setPage("home")}
            className="text-slate-500 hover:text-sea-400 text-xs transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Nazad na početnu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
