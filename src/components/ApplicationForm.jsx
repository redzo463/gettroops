import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Coffee,
  ChefHat,
  Bed,
  Users,
  FileText,
  CheckCircle,
  Upload,
  ArrowRight,
  Loader,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const ApplicationForm = ({
  user,
  currentUser,
  setPage,
  isDemo,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "Konobar",
    experience: "",
    about: "",
    cvFile: null,
    cvName: "",
  });

  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.name.split(" ");
      const first = parts[0];
      const last = parts.slice(1).join(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: first || "",
        lastName: last || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const fileInputRef = useRef(null);

  const positions = [
    {
      id: "Konobar",
      label: "Konobar",
      icon: Coffee,
      desc: "Posluživanje hrane i pića",
    },
    { id: "Kuhar", label: "Kuhar", icon: ChefHat, desc: "Priprema jela" },
    {
      id: "Sobarica",
      label: "Sobarica",
      icon: Bed,
      desc: "Održavanje čistoće",
    },
    {
      id: "Recepcioner",
      label: "Recepcioner",
      icon: Users,
      desc: "Prijem gostiju",
    },
    { id: "Ostalo", label: "Ostalo", icon: Briefcase, desc: "Druge pozicije" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500000) {
      alert("Molimo priložite manji fajl (max 500KB) ili PDF.");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        cvFile: reader.result,
        cvName: file.name,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Auth Check (skip if Demo Mode)
    if (!user && !isDemo) {
      setSubmitError(
        "Niste povezani na sistem. Provjerite internet konekciju."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isDemo) {
        // Simulate API call and save to LocalStorage for Demo persistence
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newApp = {
          id: `demo-app-${Date.now()}`,
          ...formData,
          status: "new",
          createdAt: { seconds: Date.now() / 1000 },
          userId: currentUser ? currentUser.id : "demo-user",
        };

        const existingApps = JSON.parse(
          localStorage.getItem("demo_apps") || "[]"
        );
        localStorage.setItem(
          "demo_apps",
          JSON.stringify([newApp, ...existingApps])
        );

        console.log("Demo Mode: Application saved to local storage", newApp);
      } else {
        const { error } = await supabase.from("applications").insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            experience: formData.experience,
            about: formData.about,
            cv_name: formData.cvName,
            status: "new",
            user_id: user.id,
            created_at: new Date(),
          },
        ]);
        if (error) throw error;
      }

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "Konobar",
        experience: "",
        about: "",
        cvFile: null,
        cvName: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        if (onSuccess) onSuccess();
        else setPage("home");
      }, 4000);
    } catch (error) {
      console.error("Error submitting:", error);
      setSubmitError(
        "Došlo je do greške: " + (error.message || "Nepoznata greška")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[600px] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 animate-fadeIn">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Prijava Uspješna!
          </h2>
          <p className="text-lg text-slate-500">
            Hvala vam na interesu. Vaša prijava je sigurno pohranjena u našoj
            bazi. Naš HR tim će vas kontaktirati uskoro.
          </p>
          <div className="pt-6">
            <button
              onClick={() => (onSuccess ? onSuccess() : setPage("dashboard"))}
              className="text-amber-600 hover:text-amber-700 font-bold hover:underline"
            >
              {onSuccess ? "Povratak na Dashboard" : "Povratak na početnu"}{" "}
              &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="apply"
      className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-base text-amber-600 font-semibold tracking-wide uppercase">
            Karijera
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Prijavite se za sezonski posao
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            Popunite formu ispod i postanite dio našeg tima. Proces je
            jednostavan i brz.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <FileText className="text-slate-900 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Aplikacijska Forma
                </h3>
                <p className="text-slate-400 text-sm">
                  Podaci su zaštićeni i povjerljivi
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            {/* Personal Info Section */}
            <div>
              <h4 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">
                Osobni Podaci
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ime <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-slate-50"
                    placeholder="Vaše ime"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prezime <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-slate-50"
                    placeholder="Vaše prezime"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-slate-50"
                    placeholder="email@primjer.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefon (Viber/WA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-slate-50"
                    placeholder="+387 61 ..."
                  />
                </div>
              </div>
            </div>

            {/* Position Section */}
            <div>
              <h4 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">
                Pozicija i Iskustvo
              </h4>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Odaberite željenu poziciju
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {positions.map((pos) => {
                  const Icon = pos.icon;
                  const isSelected = formData.position === pos.id;
                  return (
                    <div
                      key={pos.id}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, position: pos.id }))
                      }
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col items-center text-center ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 shadow-md transform scale-[1.02]"
                          : "border-slate-100 bg-white hover:border-amber-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mb-2 ${
                          isSelected ? "text-amber-600" : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`font-bold ${
                          isSelected ? "text-amber-900" : "text-slate-700"
                        }`}
                      >
                        {pos.label}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        {pos.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Experience Detail */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Koliko imate iskustva?
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-white"
                >
                  <option value="">Odaberite...</option>
                  <option value="Bez iskustva">Bez iskustva (Početnik)</option>
                  <option value="1-2 godine">1-2 godine</option>
                  <option value="3-5 godina">3-5 godina</option>
                  <option value="5+ godina">5+ godina (Senior)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  O sebi (Kratka biografija)
                </label>
                <textarea
                  name="about"
                  rows={4}
                  value={formData.about}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3 bg-slate-50"
                  placeholder="Navedite gdje ste prije radili, strane jezike koje govorite..."
                />
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <h4 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">
                Dokumenti
              </h4>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${
                  formData.cvName
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 hover:border-amber-500 bg-slate-50"
                }`}
              >
                <div className="space-y-2 text-center">
                  {formData.cvName ? (
                    <>
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                      <div className="text-sm text-green-700 font-semibold">
                        Spremno za slanje: <br />
                        <span className="font-bold underline">
                          {formData.cvName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            cvFile: null,
                            cvName: "",
                          }))
                        }
                        className="text-xs text-red-500 hover:underline"
                      >
                        Ukloni fajl
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 px-2 py-1 shadow-sm border border-slate-200">
                          <span>Učitaj fajl</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, PDF do 500KB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-slate-900 transition-all duration-300 ${
                  isSubmitting
                    ? "bg-amber-300 cursor-wait"
                    : "bg-amber-500 hover:bg-amber-400 hover:shadow-amber-500/25 hover:-translate-y-1"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Procesiranje...
                  </>
                ) : (
                  "Pošalji Prijavu"
                )}
              </button>
              {submitError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-center font-medium animate-fadeIn">
                  {submitError}
                </div>
              )}
              <p className="mt-4 text-center text-xs text-slate-400">
                Klikom na dugme slažete se sa našim{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="underline hover:text-amber-600"
                >
                  uvjetima korištenja i politikom privatnosti.
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"
            >
              <ArrowRight size={20} className="rotate-180" />{" "}
              {/* Close Icon substitute */}
            </button>
            <div className="prose prose-slate lg:prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Politika Privatnosti i Uvjeti Korištenja
              </h2>

              <h3 className="text-lg font-bold text-slate-800 mt-4">
                1. Prikupljanje Podataka
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Get Troops prikuplja osobne podatke (ime, prezime, email,
                telefon, CV) isključivo u svrhu posredovanja pri zapošljavanju u
                turističkom sektoru. Vaši podaci se čuvaju u sigurnoj bazi
                podataka.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mt-4">
                2. Dijeljenje Podataka
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Vaši podaci mogu biti podijeljeni isključivo sa našim
                partnerskim hotelima i restoranima koji traže zaposlenike vašeg
                profila. Ne prodajemo i ne dijelimo podatke trećim stranama za
                marketing.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mt-4">
                3. Sigurnost
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Poduzimamo sve razumne tehničke mjere zaštite kako bismo
                spriječili neovlašteni pristup ili gubitak vaših podataka.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mt-4">
                4. Vaša Prava
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                U svakom trenutku imate pravo zatražiti uvid, ispravak ili
                brisanje svojih podataka iz naše baze slanjem zahtjeva na
                info@gettroops.com.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-6 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Razumijem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;
