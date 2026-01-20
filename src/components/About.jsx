import React from "react";
import {
  Users,
  Award,
  ShieldCheck,
  TrendingUp,
  Waves,
  Sun,
} from "lucide-react";

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-sun-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sea-500/30 rounded-full blur-[100px]"></div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-full">
            <path
              d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
              fill="url(#aboutWave)"
            />
            <defs>
              <linearGradient id="aboutWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2CB5C9" />
                <stop offset="50%" stopColor="#0099CC" />
                <stop offset="100%" stopColor="#F7941D" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-sea-400 font-bold uppercase tracking-widest text-sm mb-4 animate-fadeIn">
            <Waves className="w-4 h-4" />
            Naša Priča
            <Sun className="w-4 h-4 text-sun-400" />
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 animate-slideUp">
            Gradimo mostove između <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-400 via-ocean-400 to-sun-500">
              Talenta i Prilika
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed animate-slideUp delay-100">
            <span className="uppercase font-bold text-sea-400">Moja</span>
            <span className="uppercase font-bold text-sun-400">sezona</span> je
            osnovan s jednostavnom misijom: revolucionirati zapošljavanje u
            turizmu. Spajamo vrhunske poslodavce s ambicioznim pojedincima koji
            žele graditi karijeru.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                label: "Zadovoljnih Klijenata",
                val: "50+",
                icon: Users,
                color: "sea",
              },
              {
                label: "Uspješnih Sezona",
                val: "3+",
                icon: Award,
                color: "sun",
              },
              {
                label: "Zaposlenih Kandidata",
                val: "300+",
                icon: TrendingUp,
                color: "ocean",
              },
              {
                label: "Sigurnost Isplate",
                val: "100%",
                icon: ShieldCheck,
                color: "palm",
              },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div
                  className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={24} />
                </div>
                <h3
                  className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${
                    stat.color === "sea"
                      ? "from-sea-500 to-ocean-500"
                      : stat.color === "sun"
                        ? "from-sun-500 to-sun-400"
                        : stat.color === "ocean"
                          ? "from-ocean-500 to-sea-500"
                          : "from-palm-500 to-palm-400"
                  } mb-1`}
                >
                  {stat.val}
                </h3>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-600 to-sun-500 font-bold uppercase tracking-widest text-sm mb-2 block">
              Naša Misija
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Postavljamo nove standarde u industriji
            </h2>
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                Vjerujemo da svaki pojedinac zaslužuje priliku za rad u
                poticajnom okruženju. Naš tim stručnjaka pažljivo bira partnere
                kako bismo osigurali najbolje uvjete za naše kandidate.
              </p>
              <p>
                Fokusirani smo na transparentnost, integritet i dugoročne
                odnose. Nismo samo agencija – mi smo karijerni savjetnici koji
                vas prate na svakom koraku vašeg profesionalnog puta.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-sea-500 via-ocean-400 to-sun-400 rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-ocean-900 p-8 rounded-3xl text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sea-400 to-sun-400">
                Zašto mi?
              </h3>
              <ul className="space-y-4">
                {[
                  "Personalizirani pristup svakom kandidatu",
                  "Odgovor na prijavu u roku od 24h",
                  "Uz vas do kraja sezone",
                  "Besplatna usluga pronalaska posla",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sea-500/20 to-sun-500/20 text-sea-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={14} />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-ocean-900 to-slate-900 py-24 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sun-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sea-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">
            Spremni za promjenu karijere?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Pridružite se stotinama zadovoljnih kandidata koji su svoje
            povjerenje poklonili <span className="text-sea-400">Moja</span>
            <span className="text-sun-400">sezona</span> agenciji.
          </p>
          <button className="bg-gradient-to-r from-sun-500 to-sun-400 hover:from-sun-400 hover:to-sun-300 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg shadow-sun-500/20 transform hover:-translate-y-1">
            Kontaktirajte Nas
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
