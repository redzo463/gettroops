import React, { useState } from "react";
import { Users, User, Lock, ArrowLeft, Loader } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";

const Login = ({ setPage, setAdminUser, db, appId, isDemo }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 1. Check Master Admin (Redzep)
    if (name.trim().toLowerCase() === "redzep" && code.trim() === "26f04") {
      setAdminUser({ name: "Redzep", role: "master" });
      setPage("admin");
      setIsLoading(false);
      return;
    }

    // 2. Check Other Admins (LocalStorage for Demo / Firestore for Real)
    try {
      let foundUser = null;

      if (isDemo) {
        // Check sessionStorage
        const storedAdmins = JSON.parse(
          sessionStorage.getItem("demo_admins") || "[]",
        );
        foundUser = storedAdmins.find(
          (admin) =>
            admin.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            admin.code === code.trim(),
        );
      } else {
        // Check Firestore
        const q = collection(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "admins",
        );
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            data.code === code.trim()
          ) {
            foundUser = { name: data.name, role: "standard", id: doc.id };
          }
        });
      }

      if (foundUser) {
        setAdminUser(foundUser);
        setPage("admin");
      } else {
        setError("Pogrešno ime ili kod! (Ako ste Redzep, koristite kod 26f04)");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Greška pri povezivanju sa bazom.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-xl shadow-amber-500/20">
            <Users className="h-10 w-10 text-slate-900" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Pristup za osoblje
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Samo za autorizovane agente Mojasezona
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300"
              >
                Vaše Ime
              </label>
              <div className="mt-1 relative rounded-md shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-white placeholder-slate-500 transition-all font-medium"
                  placeholder="npr. Redzep"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-300"
              >
                Pristupni Kod
              </label>
              <div className="mt-1 relative rounded-md shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="password"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-white placeholder-slate-500 transition-all font-medium"
                  placeholder="Unesite kod..."
                />
              </div>
              {error && (
                <div className="mt-2 bg-red-500/10 border border-red-500/50 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-wait transition-all hover:shadow-amber-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Provjera...
                  </>
                ) : (
                  "Prijavi se"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setPage("home")}
              className="text-sm text-slate-500 hover:text-white flex items-center justify-center gap-2 w-full transition-colors"
            >
              <ArrowLeft size={14} /> Povratak na početnu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
