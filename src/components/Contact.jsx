import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Loader2,
  Waves,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase.from("support_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: "new",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-sea-50/30 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeIn">
          <span className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-sea-600 to-sun-500 font-bold uppercase tracking-widest text-sm mb-2">
            <Waves className="w-4 h-4 text-sea-500" />
            Stupite u kontakt
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Tu smo za vaša pitanja
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Imate pitanja o procesu zapošljavanja ili suradnji? Naš tim vam
            stoji na raspolaganju.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6 animate-slideRight">
            {/* Info Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-sea-200 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-sea-50 to-ocean-50 rounded-xl flex items-center justify-center text-sea-600 mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Adresa</h3>
              <p className="text-slate-600">Bosna i Hercegovina</p>
            </div>

            {/* Info Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-sun-200 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-sun-50 to-sun-100 rounded-xl flex items-center justify-center text-sun-600 mb-6">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600 mb-1">mojasezona26@gmail.com</p>
            </div>

            {/* Info Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-ocean-200 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-ocean-50 to-sea-50 rounded-xl flex items-center justify-center text-ocean-600 mb-6">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Telefon</h3>
              <p className="text-slate-600 mb-1">+387 64 411 9251</p>
              <p className="text-slate-500 text-sm">Mon-Fri 9am-5pm</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-slideLeft">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <MessageSquare className="text-sea-500" /> Pošaljite nam poruku
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Ime i Prezime
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-sea-500 focus:border-transparent outline-none transition-all"
                      placeholder="Vaše ime"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email Adresa
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-sea-500 focus:border-transparent outline-none transition-all"
                      placeholder="vas.email@primjer.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Predmet
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-sea-500 focus:border-transparent outline-none transition-all"
                    placeholder="Naslov poruke"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Poruka
                  </label>
                  <textarea
                    required
                    rows="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-sea-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Napišite vašu poruku ovdje..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-gradient-to-r from-sun-500 to-sun-400 hover:from-sun-400 hover:to-sun-300 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-sun-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Šalje se...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> Pošalji Poruku
                    </>
                  )}
                </button>

                {submitStatus === "success" && (
                  <div className="mt-4 p-4 bg-palm-50 border border-palm-200 text-palm-700 rounded-xl">
                    ✓ Hvala na poruci! Kontaktirat ćemo vas uskoro.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    ✗ Došlo je do greške. Molimo pokušajte ponovo.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
