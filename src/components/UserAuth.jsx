import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
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
            formData.password === "26f04"
          ) {
            const masterUser = {
              id: "master-admin",
              name: "Redzep",
              email: "rsbredzo@gmail.com",
              role: "master",
              code: "26f04",
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
              u.password === formData.password
          );
          if (user) {
            const userData = { ...user, isLoggedIn: true };
            localStorage.setItem("current_user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Redirect based on role
            // Important: If a regular user was somehow given 'staff' or 'master' role in storage,
            // the system will still respect it, but the PRIMARY entry point for the owner is the hardcode above.
            setPage(
              userData.role === "staff" || userData.role === "master"
                ? "admin"
                : "dashboard"
            );
          } else {
            setError("Pogrešan email ili lozinka.");
          }
        } else {
          // REGISTER LOGIC
          if (users.some((u) => u.email === formData.email)) {
            setError("Korisnik sa ovim emailom već postoji.");
          } else {
            const newUser = {
              id: `user-${Date.now()}`,
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: "candidate", // Default role
              createdAt: new Date().toISOString(),
            };
            const updatedUsers = [...users, newUser];
            localStorage.setItem("demo_users", JSON.stringify(updatedUsers));
            localStorage.setItem("current_user", JSON.stringify(newUser));
            setCurrentUser(newUser);
            setPage("dashboard");
          }
        }
      } else {
        // SUPABASE LOGIC
        if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) throw error;

          // Fetch user details (Role)
          // Try to find in Admins first
          let role = "candidate";
          let userProfile = null;

          // Check if Admin
          const { data: adminData } = await supabase
            .from("admins")
            .select("*")
            .eq("email", formData.email)
            .single();

          if (adminData) {
            role =
              adminData.name.toLowerCase() === "redzep" ? "master" : "staff";
            userProfile = adminData;
          } else {
            // Check if Candidate
            const { data: candidateData } = await supabase
              .from("users")
              .select("*")
              .eq("email", formData.email)
              .single(); // Assuming 'users' table holds candidates

            if (candidateData) {
              userProfile = candidateData;
            }
          }

          const userData = {
            ...data.session.user,
            ...userProfile,
            role: role, // Default to candidate if not found in admins
            email: formData.email, // Ensure email is present
          };

          setCurrentUser(userData);
          setPage(
            role === "master" || role === "staff" ? "admin" : "dashboard"
          );
        } else {
          // Register
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
              },
            },
          });

          if (error) throw error;

          // Create base user profile in 'users' table
          // Note: Ideally this is done via Trigger, but for simplicity:
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              email: formData.email,
              name: formData.name,
              role: "candidate",
              created_at: new Date(),
            },
          ]);

          if (profileError)
            console.error("Error creating profile:", profileError);

          const newUser = {
            ...data.user,
            name: formData.name,
            role: "candidate",
          };
          setCurrentUser(newUser);
          setPage("dashboard");

          alert(
            "Registracija uspješna! Molimo provjerite email za potvrdu računa (ako je omogućeno)."
          );
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Dobrodošli nazad" : "Kreirajte račun"}
          </h2>
          <p className="text-slate-400">
            {isLogin
              ? "Prijavite se da pratite status prijave"
              : "Registrujte se za početak karijere"}
          </p>
        </div>

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
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
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
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            {isLogin
              ? "Nemate račun? Registrujte se"
              : "Već imate račun? Prijavite se"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <button
            onClick={() => setPage("home")}
            className="text-slate-500 hover:text-white text-xs transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Nazad na početnu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
