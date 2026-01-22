import React from "react";
import { Briefcase, ArrowRight, Waves, Sun } from "lucide-react";

const Hero = ({ setPage }) => (
  <div className="relative h-screen min-h-[600px] w-full bg-gradient-to-b from-slate-900 via-ocean-900 to-slate-900 overflow-hidden flex items-center justify-center pt-24 md:pt-32">
    {/* Background Image & Overlay */}
    <div className="absolute inset-0 z-0">
      <img
        className="w-full h-full object-cover opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        style={{ animationDuration: "30s" }}
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
        alt="Luxury Hotel Staff"
      />
      {/* Tropical gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-ocean-900/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-sea-900/40 to-sun-900/30" />

      {/* Decorative wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full">
          <path
            d="M0,60 C480,120 960,0 1440,60 L1440,120 L0,120 Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2CB5C9" />
              <stop offset="100%" stopColor="#0099CC" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
      <div className="animate-[fadeInUp_1s_ease-out]">
        <span className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-gradient-to-r from-sea-500/20 to-sun-500/20 border border-sea-400/40 text-white text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm shadow-lg">
          <Sun className="w-4 h-4 text-sun-300" />
          Sezona 2026 je počela
          <Waves className="w-4 h-4 text-sea-300" />
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-2xl">
          Vaša karijera u <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-400 via-ocean-400 to-sun-500">
            UGOSTITELJSTVU
          </span>
        </h1>

        <p className="mt-4 text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed mb-10 font-light drop-shadow-lg">
          Povezujemo vrhunske kafiće i restorane sa talentima poput vas. Siguran
          posao i najbolja zarada na Jadranu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setPage("auth")}
            className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-sun-500 to-sun-400 hover:from-sun-400 hover:to-sun-300 text-slate-900 text-lg font-bold rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(247,148,29,0.4)] hover:shadow-[0_0_35px_rgba(247,148,29,0.6)] hover:-translate-y-1"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Prijavi se za Posao
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              const element = document.getElementById("services");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 hover:border-white/60 text-lg font-semibold rounded-full transition-all backdrop-blur-sm shadow-lg"
          >
            Saznaj više
          </button>
        </div>

        {/* Stats / Social Proof (Mini) */}
        <div className="mt-16 pt-8 border-t border-white/20 flex justify-center gap-8 md:gap-16">
          <div className="text-center">
            <span className="block text-3xl font-bold text-sea-300 drop-shadow-lg">
              50+
            </span>
            <span className="text-sm text-slate-300 uppercase tracking-wider font-medium">
              Zadovoljnih Klijenata
            </span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-ocean-300 drop-shadow-lg">
              3+
            </span>
            <span className="text-sm text-slate-300 uppercase tracking-wider font-medium">
              Uspješnih Sezona
            </span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-sun-300 drop-shadow-lg">
              300+
            </span>
            <span className="text-sm text-slate-300 uppercase tracking-wider font-medium">
              Zaposlenih Kandidata
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
  </div>
);

export default Hero;
