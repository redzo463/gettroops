import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Send,
  FileText,
  ArrowRight,
  User,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import ApplicationForm from "./ApplicationForm";

const CandidateDashboard = ({ user, setPage, isDemo }) => {
  const [myApplications, setMyApplications] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    // Priority 1: Use the Hydrated 'user' object (Auth + DB Profile)
    if (user && user.role === "candidate") {
      if (isDemo) {
        // DEMO MODE
        const allApps = JSON.parse(localStorage.getItem("demo_apps") || "[]");
        const myApps = allApps.filter(
          (app) =>
            (app.userId && app.userId === user.id) ||
            (app.email && app.email.toLowerCase() === user.email.toLowerCase())
        );
        setMyApplications(myApps);
      } else {
        // SUPABASE MODE
        const fetchMyApps = async () => {
          const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching my apps:", error);
          } else {
            console.log("Fetched apps for:", user.email, data);
            setMyApplications(
              data.map((app) => ({
                ...app,
                createdAt: app.created_at,
                placementLocation: app.placement_location,
              }))
            );
          }
        };
        fetchMyApps();
      }
    }
  }, [user, isDemo, showApplyForm]);

  const getStatusStep = (status) => {
    switch (status) {
      case "hired":
        return 3;
      case "reviewed":
        return 2;
      case "new":
        return 1;
      default:
        return 0;
    }
  };

  const steps = [
    { id: 1, label: "Poslato", icon: Send },
    { id: 2, label: "U obradi", icon: Clock },
    { id: 3, label: "Završeno", icon: CheckCircle },
  ];

  if (showApplyForm) {
    return (
      <ApplicationForm
        user={user}
        currentUser={user}
        setPage={setPage}
        isDemo={isDemo}
        onSuccess={() => setShowApplyForm(false)}
        onCancel={() => setShowApplyForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Moj <span className="text-amber-500">Dashboard</span>
            </h1>
            <p className="text-slate-400 mt-2">
              Pratite status vaših prijava u realnom vremenu
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 pr-4 rounded-full border border-white/10">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-bold shadow-lg">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <p className="font-bold text-white text-sm leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                {user?.role === "candidate" ? "Kandidat" : "Osoblje"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {myApplications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
            <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <FileText className="text-slate-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Nemate aktivnih prijava
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Trenutno niste aplicirali ni za jednu poziciju. Ispunite formu za
              prijavu kako biste započeli svoju karijeru sa nama.
            </p>
            <button
              onClick={() => setShowApplyForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all"
            >
              Apliciraj Sada <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {myApplications.map((app) => {
              const currentStep = getStatusStep(app.status);

              return (
                <div
                  key={app.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {app.position}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            app.status === "hired"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : app.status === "reviewed"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-slate-700/50 text-slate-400 border-slate-600"
                          }`}
                        >
                          #{app.id.slice(-4)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Clock size={12} /> Prijavljeno:{" "}
                        {app.createdAt?.seconds
                          ? new Date(
                              app.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "Nedavno"}
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-xs font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 bg-slate-800/50"
                      >
                        Detalji prijave
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative px-2">
                    {/* Connector Line */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-800 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                      ></div>
                    </div>

                    <div className="relative flex justify-between">
                      {steps.map((step) => {
                        const isCompleted = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.id}
                            className="flex flex-col items-center group/step"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 ${
                                isCompleted || isCurrent
                                  ? "bg-amber-500 text-slate-900 border-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                  : "bg-slate-800 text-slate-600 border-slate-900"
                              }`}
                            >
                              <Icon size={16} strokeWidth={3} />
                            </div>
                            <p
                              className={`mt-4 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                                isCompleted || isCurrent
                                  ? "text-amber-500"
                                  : "text-slate-600"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {app.status === "hired" && (
                    <div className="mt-10 bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-4 rounded-r-xl flex gap-4 items-start animate-fadeIn">
                      <div className="bg-green-500/20 p-2 rounded-full">
                        <CheckCircle className="text-green-400" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          Čestitamo! Angažovani ste.
                        </h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Vaš proces prijave je uspješno završen. Naš tim će vas
                          kontaktirati uskoro sa detaljima o vašem novom
                          angažmanu u{" "}
                          <strong>
                            {app.placementLocation || "našem partner hotelu"}
                          </strong>
                          .
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-center mt-12">
              <button
                onClick={() => setShowApplyForm(true)}
                className="text-slate-400 hover:text-amber-500 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <div className="h-8 w-8 rounded-full border border-current flex items-center justify-center border-dashed">
                  +
                </div>
                Nova prijava za drugu poziciju
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Detalji Prijave
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  ID: #{selectedApp.id.slice(-6)}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  selectedApp.status === "hired"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : selectedApp.status === "reviewed"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    selectedApp.status === "hired"
                      ? "bg-green-500/20"
                      : selectedApp.status === "reviewed"
                      ? "bg-blue-500/20"
                      : "bg-amber-500/20"
                  }`}
                >
                  {selectedApp.status === "hired" ? (
                    <CheckCircle size={24} />
                  ) : selectedApp.status === "reviewed" ? (
                    <Clock size={24} />
                  ) : (
                    <Send size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg capitalize">
                    {selectedApp.status === "new"
                      ? "Prijavljeno"
                      : selectedApp.status === "reviewed"
                      ? "U obradi"
                      : "Zavrošeno / Angažovano"}
                  </h4>
                  <p className="text-sm opacity-80">
                    {selectedApp.status === "new"
                      ? "Vaša prijava je uspješno zaprimljena i čeka pregled."
                      : selectedApp.status === "reviewed"
                      ? "Vaša prijava je pregledana i trenutno je u procesu evaluacije."
                      : "Čestitamo! Angažovani ste za ovu poziciju."}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1">Pozicija</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedApp.position}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1">Datum Prijave</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedApp.createdAt?.seconds
                      ? new Date(
                          selectedApp.createdAt.seconds * 1000
                        ).toLocaleDateString("bs-BA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1">Iskustvo</p>
                  <p className="text-white font-semibold">
                    {selectedApp.experience || "Nije navedeno"}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1">Kontakt Telefon</p>
                  <p className="text-white font-semibold">
                    {selectedApp.phone || "Nije navedeno"}
                  </p>
                </div>
              </div>

              {/* About Section */}
              {selectedApp.about && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-2">
                    Biografija / O sebi
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedApp.about}
                  </p>
                </div>
              )}

              {/* CV File */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Priloženi CV</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <FileText size={16} className="text-amber-500" />
                    {selectedApp.cvName || "Moj_CV.pdf"}
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-600"
                  onClick={() =>
                    alert("Preuzimanje fajla nije dostupno u demo verziji.")
                  }
                >
                  Preuzmi
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
