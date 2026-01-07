import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  UserPlus,
  LogOut,
  TrendingUp,
  Calendar,
  BarChart2,
  Trash2,
  Search,
  Mail,
  Phone,
  Download,
  Eye,
  Briefcase,
  CheckCircle,
  X,
  LayoutDashboard,
  Users,
  User,
  Menu,
  Clock,
  FileText,
  Building,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const AdminDashboard = ({ user, setPage, setAdminUser, adminUser, isDemo }) => {
  const [apps, setApps] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]); // All registered users (candidates)
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("applications"); // 'dashboard', 'applications', 'team', 'users'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hiring Modal State
  const [hiringApp, setHiringApp] = useState(null);
  const [hireLocation, setHireLocation] = useState("");
  const [hireFee, setHireFee] = useState("");

  // New Admin Form State
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminCode, setNewAdminCode] = useState("");
  const [existingAdmins, setExistingAdmins] = useState([]);

  // Companies State
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: "",
    address: "",
    contactPerson: "",
    email: "",
    phone: "",
    positions: "",
    workerCount: "",
    salaryRange: "",
    notes: "",
  });

  // Stats State
  const [stats, setStats] = useState({ total: 0, year: 0, month: 0, week: 0 });
  const [adminStats, setAdminStats] = useState({});
  const [selectedAdminForView, setSelectedAdminForView] = useState(null);
  const [viewApp, setViewApp] = useState(null); // For Application Detail Modal

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  // Company UI State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // General States
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [confirmModal, setConfirmModal] = useState(null); // { title: '', message: '', onConfirm: () => {} }

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    console.log("AdminDashboard Mounted. AdminUser:", adminUser);
    if (!user && !isDemo) {
      console.warn("No Supabase User session found in AdminDashboard");
      return;
    }
    // ... existing logic ...

    // Safety check for adminUser
    if (!adminUser) {
      console.error("AdminUser prop is missing!");
    }

    // Fetch Applications
    if (isDemo) {
      // 1. Try to load from localStorage
      const storedApps = JSON.parse(
        localStorage.getItem("demo_apps") || "null"
      );

      if (storedApps) {
        setApps(storedApps);
        calculateStats(storedApps);
        setLoading(false);
      } else {
        // 2. Seed default data if nothing in storage
        const demoData = [
          // ... (keeping demo data the same for brevity, but could re-inject if needed. Assuming user has it in local storage or the previous file content block had it)
          {
            id: "1",
            firstName: "Marko",
            lastName: "Marković",
            email: "marko@example.com",
            position: "Konobar",
            status: "new",
            experience: "3-5 godina",
            phone: "061/111-222",
            createdAt: { seconds: Date.now() / 1000 - 8000 },
          },
          // ... (simplified for write, actual content will be preserved as I will rewrite the file carefully)
        ];
        // Re-using the logic from previous read if possible, or just standard init
        // Since I am overwriting, I should include the seed data again to be safe.
        const fullDemoData = [
          {
            id: "1",
            firstName: "Marko",
            lastName: "Marković",
            email: "marko@example.com",
            position: "Konobar",
            status: "new",
            experience: "3-5 godina",
            phone: "061/111-222",
            createdAt: { seconds: Date.now() / 1000 - 8000 },
          },
          {
            id: "2",
            firstName: "Ivan",
            lastName: "Horvat",
            email: "ivan@example.com",
            position: "Kuhar",
            status: "reviewed",
            experience: "5+ godina",
            phone: "062/333-444",
            createdAt: { seconds: Date.now() / 1000 - 86400 },
          },
          {
            id: "3",
            firstName: "Ana",
            lastName: "Anić",
            email: "ana@example.com",
            position: "Recepcioner",
            status: "hired",
            experience: "1-2 godine",
            phone: "063/555-666",
            placementFee: 500,
            placementLocation: "Hotel Grand",
            hiredBy: "Redzep",
            hiredAt: { seconds: Date.now() / 1000 - 100000 },
            createdAt: { seconds: Date.now() / 1000 - 200000 },
          },
          {
            id: "4",
            firstName: "Petra",
            lastName: "Perić",
            email: "petra@example.com",
            position: "Sobarica",
            status: "new",
            experience: "Bez iskustva",
            phone: "064/777-888",
            createdAt: { seconds: Date.now() / 1000 - 3600 },
          },
          {
            id: "5",
            firstName: "Luka",
            lastName: "Lukić",
            email: "luka@example.com",
            position: "Konobar",
            status: "new",
            experience: "1-2 godine",
            phone: "065/999-000",
            createdAt: { seconds: Date.now() / 1000 - 50000 },
          },
        ];
        setApps(fullDemoData);
        calculateStats(fullDemoData);
        localStorage.setItem("demo_apps", JSON.stringify(fullDemoData));
        setLoading(false);
      }
    } else {
      // Supabase logic
      const fetchApps = async () => {
        const { data, error } = await supabase.from("applications").select("*");

        if (error) {
          console.error("Error fetching applications:", error);
        } else {
          // Map to camelCase
          const mappedData = data.map((app) => ({
            ...app,
            firstName: app.first_name,
            lastName: app.last_name,
            createdAt: app.created_at,
            placementFee: app.placement_fee,
            placementLocation: app.placement_location,
            hiredBy: app.hired_by,
            hiredAt: app.hired_at,
          }));

          mappedData.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });

          setApps(mappedData);
          calculateStats(mappedData);
          setLoading(false);
        }
      };

      fetchApps();

      // Simple Polling (optional, every 30s) or Realtime
      // For now, just fetch once.
    }

    // Fetch Registered Users (Candidates) for Master
    if (adminUser.role === "master") {
      if (isDemo) {
        let users = JSON.parse(localStorage.getItem("demo_users") || "[]");

        // Seed users if empty
        if (users.length === 0) {
          users = [
            {
              id: "user-1",
              name: "Marko Marković",
              email: "marko@example.com",
              password: "password123",
              role: "candidate",
              createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 30
              ).toISOString(), // 30 days ago
            },
            {
              id: "user-2",
              name: "Ivan Horvat",
              email: "ivan@example.com",
              password: "password123",
              role: "candidate",
              createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 15
              ).toISOString(), // 15 days ago
            },
            {
              id: "user-3",
              name: "Ana Anić",
              email: "ana@example.com",
              password: "password123",
              role: "candidate",
              createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 60
              ).toISOString(), // 60 days ago
            },
            {
              id: "user-4",
              name: "Petra Perić",
              email: "petra@example.com",
              password: "password123",
              role: "candidate",
              createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 2
              ).toISOString(), // 2 days ago
            },
            {
              id: "user-5",
              name: "Luka Lukić",
              email: "luka@example.com",
              password: "password123",
              role: "candidate",
              createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 5
              ).toISOString(), // 5 days ago
            },
          ];
          localStorage.setItem("demo_users", JSON.stringify(users));
        }

        setRegisteredUsers(users);
      }
      // Supabase Users Fetch
      const fetchUsers = async () => {
        const { data } = await supabase.from("users").select("*");
        if (data) {
          setRegisteredUsers(
            data.map((u) => ({
              ...u,
              createdAt: u.created_at,
            }))
          );
        }
      };
      fetchUsers();
    }

    // Fetch Team (Only if Master)
    let unsubscribeTeam = () => {};
    if (adminUser.role === "master") {
      if (isDemo) {
        // Load from localStorage if in demo mode
        const storedAdmins = JSON.parse(
          localStorage.getItem("demo_admins") || "[]"
        );
        setExistingAdmins(storedAdmins);
      } else {
        const fetchTeam = async () => {
          const { data } = await supabase.from("admins").select("*");
          if (data) {
            setExistingAdmins(
              data.map((admin) => ({
                ...admin,
                createdBy: admin.created_by,
                createdAt: admin.created_at,
              }))
            );
          }
        };
        fetchTeam();
      }
    }

    // Fetch Companies
    // Fetch Companies
    let unsubscribeCompanies = () => {};
    if (isDemo) {
      let storedCompanies = JSON.parse(
        localStorage.getItem("demo_companies") || "null"
      );

      if (!storedCompanies || storedCompanies.length === 0) {
        storedCompanies = [
          {
            id: "comp-1",
            name: "Tech Solutions d.o.o.",
            address: "Zmaja od Bosne 7, Sarajevo",
            contactPerson: "Adnan Hadžić",
            email: "info@techsolutions.ba",
            phone: "+387 33 111 222",
            positions: "Software Engineer, UI Designer",
            workerCount: "50",
            salaryRange: "2000 - 5000 KM",
            notes: "Traže iskusne inženjere.",
            website: "www.techsolutions.ba",
            status: "Active",
            createdAt: { seconds: Date.now() / 1000 - 86400 * 30 },
            createdBy: "System",
          },
          {
            id: "comp-2",
            name: "Hotel Grand",
            address: "Maršala Tita 10, Sarajevo",
            contactPerson: "Lejla Babić",
            email: "hr@hotelgrand.ba",
            phone: "+387 33 333 444",
            positions: "Konobar, Kuhar, Sobarica",
            workerCount: "120",
            salaryRange: "1200 - 2000 KM",
            notes: "Hitno trebaju kuhare.",
            website: "www.hotelgrand.ba",
            status: "Active",
            createdAt: { seconds: Date.now() / 1000 - 86400 * 60 },
            createdBy: "System",
          },
          {
            id: "comp-3",
            name: "Global Logistics",
            address: "Halilovići 5, Sarajevo",
            contactPerson: "Mirza Dedić",
            email: "mirza@global.ba",
            phone: "+387 61 555 666",
            positions: "Vozač, Skladištar",
            workerCount: "30",
            salaryRange: "1500 - 2500 KM",
            notes: "Fleksibilno radno vrijeme.",
            website: "www.global-logistics.ba",
            status: "Inactive",
            createdAt: { seconds: Date.now() / 1000 - 86400 * 10 },
            createdBy: "System",
          },
        ];
        localStorage.setItem("demo_companies", JSON.stringify(storedCompanies));
      }
      setCompanies(storedCompanies);
    } else {
      const fetchCompanies = async () => {
        const { data } = await supabase.from("companies").select("*");
        if (data) {
          setCompanies(
            data.map((c) => ({
              ...c,
              contactPerson: c.contact_person,
              workerCount: c.worker_count,
              salaryRange: c.salary_range,
              createdAt: c.created_at,
              createdBy: c.created_by,
            }))
          );
        }
      };
      fetchCompanies();
    }

    return () => {
      // unsubscribeApps(); // Handled in if/else block above
      unsubscribeTeam();
      unsubscribeCompanies();
    };
  }, [user, adminUser]);

  const calculateStats = (applications) => {
    const now = new Date();
    let total = 0,
      year = 0,
      month = 0,
      week = 0;
    const admStats = {};

    applications.forEach((app) => {
      if (app.status === "hired" && app.placementFee) {
        const fee = parseFloat(app.placementFee) || 0;
        total += fee;

        const hiredAt = app.hiredAt;
        if (hiredAt) {
          const hiredDate = hiredAt.seconds
            ? new Date(hiredAt.seconds * 1000)
            : new Date(hiredAt);

          if (hiredDate.getFullYear() === now.getFullYear()) {
            year += fee;
            if (hiredDate.getMonth() === now.getMonth()) month += fee;
            const oneDay = 24 * 60 * 60 * 1000;
            if (Math.round(Math.abs((now - hiredDate) / oneDay)) <= 7)
              week += fee;
          }
        }
        if (app.hiredBy) {
          const name = app.hiredBy;
          if (!admStats[name])
            admStats[name] = { count: 0, revenue: 0, jobs: [] };
          admStats[name].count++;
          admStats[name].revenue += fee;
          admStats[name].jobs.push(app);
        }
      }
    });
    setStats({ total, year, month, week });
    setAdminStats(admStats);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      if (isDemo) {
        setApps((prev) => {
          const updated = prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          );
          localStorage.setItem("demo_apps", JSON.stringify(updated));
          return updated;
        });
        setToast({ message: `Status ažuriran: ${newStatus}`, type: "success" });
      } else {
        if (isDemo) {
          // ... (Demo logic maps same state) check existing
        }

        await supabase
          .from("applications")
          .update({ status: newStatus })
          .eq("id", id);

        setApps((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!hiringApp || !hireLocation || !hireFee) return;
    try {
      if (isDemo) {
        setApps((prev) => {
          const updated = prev.map((app) =>
            app.id === hiringApp.id
              ? {
                  ...app,
                  status: "hired",
                  placementLocation: hireLocation,
                  placementFee: parseFloat(hireFee),
                  hiredAt: { seconds: Date.now() / 1000 },
                  hiredBy: adminUser.name,
                }
              : app
          );
          localStorage.setItem("demo_apps", JSON.stringify(updated));
          calculateStats(updated);
          return updated;
        });

        setHiringApp(null);
        setHireLocation("");
        setHireFee("");
        setToast({
          message: "Kandidat uspješno angažovan! (Demo)",
          type: "success",
        });
      } else {
        await supabase
          .from("applications")
          .update({
            status: "hired",
            placement_location: hireLocation,
            placement_fee: parseFloat(hireFee),
            hired_at: new Date(),
            hired_by: adminUser.name,
          })
          .eq("id", hiringApp.id);

        setApps((prev) =>
          prev.map((app) =>
            app.id === hiringApp.id
              ? {
                  ...app,
                  status: "hired",
                  placementLocation: hireLocation,
                  placementFee: parseFloat(hireFee),
                  hiredAt: new Date(),
                  hiredBy: adminUser.name,
                }
              : app
          )
        );
        setHiringApp(null);
        setHireLocation("");
        setHireFee("");
        setToast({ message: "Kandidat uspješno angažovan!", type: "success" });
      }
    } catch (err) {
      setToast({ message: "Greška pri snimanju podataka.", type: "error" });
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    const normalizedName = newAdminName.trim().toLowerCase();
    const isMaster = normalizedName === "redzep";
    const exists = existingAdmins.some(
      (admin) => admin.name.trim().toLowerCase() === normalizedName
    );

    if (isMaster || exists) {
      alert("Administrator sa ovim imenom već postoji!");
      return;
    }

    try {
      if (isDemo) {
        // Simulate adding to local state for demo purposes
        const newAdmin = {
          id: `demo-${Date.now()}`,
          name: newAdminName,
          code: newAdminCode,
          role: "standard",
          createdBy: adminUser.name,
          createdAt: { seconds: Date.now() / 1000 },
        };
        setExistingAdmins((prev) => {
          const updated = [...prev, newAdmin];
          localStorage.setItem("demo_admins", JSON.stringify(updated));
          return updated;
        });
        setNewAdminName("");
        setNewAdminCode("");
        setToast({ message: "Kolega uspješno dodan! (Demo)", type: "success" });
      } else {
        const { data, error } = await supabase
          .from("admins")
          .insert([
            {
              name: newAdminName,
              code: newAdminCode,
              created_by: adminUser.name,
              created_at: new Date(),
            },
          ])
          .select();

        if (data) {
          const newAdmin = {
            id: data[0].id,
            name: data[0].name,
            code: data[0].code,
            createdBy: data[0].created_by,
            createdAt: data[0].created_at,
          };
          setExistingAdmins((prev) => [...prev, newAdmin]);
        }

        setNewAdminName("");
        setNewAdminCode("");
        setToast({ message: "Kolega uspješno dodan!", type: "success" });
        setNewAdminName("");
        setNewAdminCode("");
        setToast({ message: "Kolega uspješno dodan!", type: "success" });
      }
    } catch (error) {
      setToast({ message: "Greška pri dodavanju", type: "error" });
    }
  };

  const confirmDeleteAdmin = (id) => {
    setConfirmModal({
      title: "Ukloniti prava administratora?",
      message:
        "Korisnik će biti vraćen na status kandidata ili obrisan iz tima.",
      onConfirm: () => handleDeleteAdmin(id),
    });
  };

  const handleDeleteAdmin = async (id) => {
    setConfirmModal(null);
    try {
      if (isDemo) {
        // 1. Remove from admins list
        setExistingAdmins((prev) => {
          const updated = prev.filter((admin) => admin.id !== id);
          localStorage.setItem("demo_admins", JSON.stringify(updated));
          return updated;
        });

        // 2. Also downgrade the user in registeredUsers if they exist there
        // This ensures they lose "staff" status in their user profile too
        setRegisteredUsers((prevUsers) => {
          const userExists = prevUsers.some((u) => u.id === id);
          if (userExists) {
            const updatedUsers = prevUsers.map((u) =>
              u.id === id ? { ...u, role: "candidate" } : u
            );
            localStorage.setItem("demo_users", JSON.stringify(updatedUsers));
            return updatedUsers;
          }
          return prevUsers;
        });

        setToast({
          message: "Administrator uklonjen/degradiran (Demo)",
          type: "success",
        });
      } else {
        await supabase.from("admins").delete().eq("id", id);
        setExistingAdmins((prev) => prev.filter((a) => a.id !== id));
        setToast({ message: "Administrator obrisan", type: "success" });
        // Firestore logic for downgrading user would go here (updateDoc on user)
        setToast({ message: "Administrator obrisan", type: "success" });
      }
    } catch (err) {
      setToast({ message: "Greška pri brisanju", type: "error" });
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      const companyData = {
        name: newCompany.name,
        address: newCompany.address,
        contactPerson: newCompany.contactPerson,
        email: newCompany.email,
        phone: newCompany.phone,
        positions: newCompany.positions,
        workerCount: newCompany.workerCount,
        salaryRange: newCompany.salaryRange,
        notes: newCompany.notes,
        website: newCompany.website || "",
        status: newCompany.status || "Active",
      };

      if (editingCompany) {
        // UPDATE EXISTING
        if (isDemo) {
          setCompanies((prev) => {
            const updated = prev.map((c) =>
              c.id === editingCompany.id ? { ...c, ...companyData } : c
            );
            localStorage.setItem("demo_companies", JSON.stringify(updated));
            return updated;
          });
          setToast({
            message: "Podaci o firmi ažurirani (Demo)",
            type: "success",
          });
        } else {
          await supabase
            .from("companies")
            .update({
              ...companyData,
              contact_person: companyData.contactPerson,
              worker_count: companyData.workerCount,
              salary_range: companyData.salaryRange,
            })
            .eq("id", editingCompany.id);

          setCompanies((prev) =>
            prev.map((c) =>
              c.id === editingCompany.id ? { ...c, ...companyData } : c
            )
          );
          setToast({ message: "Podaci o firmi ažurirani", type: "success" });
        }
      } else {
        // CREATE NEW
        if (isDemo) {
          const newCo = {
            id: `comp-${Date.now()}`,
            ...companyData,
            createdAt: { seconds: Date.now() / 1000 },
            createdBy: adminUser.name,
          };
          setCompanies((prev) => {
            const updated = [newCo, ...prev];
            localStorage.setItem("demo_companies", JSON.stringify(updated));
            return updated;
          });
          setToast({
            message: "Kompanija uspješno dodana (Demo)",
            type: "success",
          });
        } else {
          const { data, error } = await supabase
            .from("companies")
            .insert([
              {
                ...companyData,
                contact_person: companyData.contactPerson,
                worker_count: companyData.workerCount,
                salary_range: companyData.salaryRange,
                created_at: new Date(),
                created_by: adminUser.name,
              },
            ])
            .select();

          if (data) {
            const newCo = {
              id: data[0].id,
              ...companyData,
              createdAt: data[0].created_at,
              createdBy: data[0].created_by,
            };
            setCompanies((prev) => [newCo, ...prev]);
          }
          setToast({ message: "Kompanija uspješno dodana", type: "success" });
        }
      }

      // Reset and Close
      setNewCompany({
        name: "",
        address: "",
        contactPerson: "",
        email: "",
        phone: "",
        positions: "",
        workerCount: "",
        salaryRange: "",
        notes: "",
        website: "",
        status: "Active",
      });
      setEditingCompany(null);
      setIsCompanyModalOpen(false);
    } catch (error) {
      console.error(error);
      setToast({ message: "Greška pri snimanju podataka", type: "error" });
    }
  };

  const openEditCompany = (company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name || "",
      address: company.address || "",
      contactPerson: company.contactPerson || "",
      email: company.email || "",
      phone: company.phone || "",
      positions: company.positions || "",
      workerCount: company.workerCount || "",
      salaryRange: company.salaryRange || "",
      notes: company.notes || "",
      website: company.website || "",
      status: company.status || "Active",
    });
    setIsCompanyModalOpen(true);
  };

  const openNewCompanyInitial = () => {
    setEditingCompany(null);
    setNewCompany({
      name: "",
      address: "",
      contactPerson: "",
      email: "",
      phone: "",
      positions: "",
      workerCount: "",
      salaryRange: "",
      notes: "",
      website: "",
      status: "Active",
    });
    setIsCompanyModalOpen(true);
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm("Sigurno želite obrisati ovu kompaniju?")) return;
    try {
      if (isDemo) {
        setCompanies((prev) => {
          const updated = prev.filter((c) => c.id !== id);
          localStorage.setItem("demo_companies", JSON.stringify(updated));
          return updated;
        });
        setToast({ message: "Kompanija obrisana (Demo)", type: "success" });
      } else {
        await supabase.from("companies").delete().eq("id", id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setToast({ message: "Kompanija obrisana", type: "success" });
      }
    } catch (error) {
      setToast({ message: "Greška pri brisanju", type: "error" });
    }
  };

  const demoteUser = (user) => {
    confirmDeleteAdmin(user.id);
  };

  const confirmDeleteApp = (id) => {
    setConfirmModal({
      title: "Obrisati prijavu?",
      message: "Da li ste sigurni da želite trajno obrisati ovu aplikaciju?",
      onConfirm: () => deleteApp(id),
    });
  };

  const deleteApp = async (id) => {
    setConfirmModal(null);
    try {
      if (isDemo) {
        setApps((prev) => {
          const updated = prev.filter((app) => app.id !== id);
          localStorage.setItem("demo_apps", JSON.stringify(updated));
          return updated;
        });
        setToast({ message: "Prijava obrisana (Demo)", type: "success" });
      } else {
        await supabase.from("applications").delete().eq("id", id);
        setApps((prev) => prev.filter((a) => a.id !== id));
        setToast({ message: "Prijava obrisana", type: "success" });
        setToast({ message: "Prijava obrisana", type: "success" });
      }
    } catch (err) {
      setToast({ message: "Greška pri brisanju", type: "error" });
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch =
      (app.firstName + " " + app.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportToCSV = () => {
    if (filteredApps.length === 0) {
      setToast({ message: "Nema podataka za export", type: "error" });
      return;
    }
    const headers = [
      "Ime",
      "Prezime",
      "Email",
      "Telefon",
      "Pozicija",
      "Iskustvo",
      "Status",
      "Datum Prijave",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredApps.map((app) =>
        [
          app.firstName,
          app.lastName,
          app.email,
          app.phone,
          app.position,
          app.experience,
          app.status,
          app.createdAt?.seconds
            ? new Date(app.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prijave_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    setToast({ message: "Export uspješan!", type: "success" });
  };

  const makeUserAdmin = (userToPromote) => {
    if (
      !window.confirm(
        `Jeste li sigurni da želite promovirati korisnika ${userToPromote.name} u Admina?`
      )
    )
      return;

    try {
      if (isDemo) {
        // 1. Update local users list
        const updatedUsers = registeredUsers.map((u) =>
          u.id === userToPromote.id ? { ...u, role: "staff" } : u
        );
        setRegisteredUsers(updatedUsers);
        localStorage.setItem("demo_users", JSON.stringify(updatedUsers));

        // 2. Add to team (admins) list if not present, to show in Team tab
        // We use name matching as a simple check since IDs might differ in origin
        const adminExists = existingAdmins.some(
          (a) => a.name === userToPromote.name
        );

        if (!adminExists) {
          const newAdmin = {
            id: userToPromote.id,
            name: userToPromote.name,
            role: "staff",
            code: "LINKED", // Linked to user account
            createdBy: adminUser.name,
            createdAt: { seconds: Date.now() / 1000 },
          };
          const updatedAdmins = [...existingAdmins, newAdmin];
          setExistingAdmins(updatedAdmins);
          localStorage.setItem("demo_admins", JSON.stringify(updatedAdmins));
        }

        setToast({
          message: `${userToPromote.name} je sada član osoblja.`,
          type: "success",
        });
      } else {
        alert("Funkcionalnost dostupna samo u Demo modu.");
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Greška", type: "error" });
    }
  };

  const logout = () => {
    setAdminUser(null);
    setPage("home");
  };
  const allAdmins = [
    { id: "redzep-master", name: "Redzep", role: "master", code: "26f04" },
    ...existingAdmins,
  ];

  // UI Components
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id
          ? "bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={20} />
      {(sidebarOpen || window.innerWidth < 768) && <span>{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-200">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 bg-slate-900/90 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col
          ${
            sidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64 md:translate-x-0 md:w-20"
          }
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {sidebarOpen ? (
            <span className="font-bold text-xl tracking-wider text-white">
              GET <span className="text-amber-500">TROOPS</span>
            </span>
          ) : (
            <div className="hidden md:block">
              <ShieldAlert className="text-amber-500 mx-auto" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-white transition-colors md:block hidden"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-8 px-3 space-y-2 overflow-y-auto">
          <SidebarItem id="applications" icon={Briefcase} label="Prijave" />
          <SidebarItem
            id="dashboard"
            icon={LayoutDashboard}
            label="Statistika"
          />
          {adminUser.role === "master" && (
            <>
              <SidebarItem id="team" icon={Users} label="Tim" />
              <SidebarItem id="users" icon={User} label="Korisnici" />
              <SidebarItem id="companies" icon={Building} label="Firme" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {(sidebarOpen || window.innerWidth < 768) && <span>Odjava</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 relative z-10 
          ${sidebarOpen ? "md:ml-64" : "md:ml-20"} 
          ml-0 w-full
        `}
      >
        {/* Top Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {activeTab === "applications" && "Upravljanje Prijavama"}
              {activeTab === "dashboard" && "Pregled Statistike"}
              {activeTab === "team" && "Upravljanje Timom"}
              {activeTab === "team" && "Upravljanje Timom"}
              {activeTab === "users" && "Registrovani Korisnici"}
              {activeTab === "companies" && "Upravljanje Firmama"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">
                {adminUser?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-amber-500 uppercase font-semibold tracking-wider">
                {adminUser?.role === "master" ? "Master Admin" : "Staff Member"}
              </p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-500/20">
              {adminUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* STATS VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Ukupno Prihod",
                    val: stats.total,
                    icon: TrendingUp,
                    color: "amber",
                  },
                  {
                    label: "Ova Godina",
                    val: stats.year,
                    icon: Calendar,
                    color: "blue",
                  },
                  {
                    label: "Ovaj Mjesec",
                    val: stats.month,
                    icon: Calendar,
                    color: "indigo",
                  },
                  {
                    label: "Zadnjih 7 dana",
                    val: stats.week,
                    icon: Calendar,
                    color: "green",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                          {s.label}
                        </p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {s.val.toLocaleString()} €
                        </h3>
                      </div>
                      <div
                        className={`p-3 rounded-xl bg-slate-800 text-${s.color}-400 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all shadow-lg`}
                      >
                        <s.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics & Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" /> Nedavne
                    Aktivnosti
                  </h3>
                  <div className="space-y-4">
                    {apps.slice(0, 5).map((app, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            app.status === "new"
                              ? "bg-blue-500"
                              : app.status === "hired"
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-bold">
                              {app.firstName} {app.lastName}
                            </span>{" "}
                            aplicirao za poziciju{" "}
                            <span className="text-amber-500">
                              {app.position}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {app.createdAt?.seconds
                              ? new Date(
                                  app.createdAt.seconds * 1000
                                ).toLocaleString()
                              : "Nedavno"}
                          </p>
                        </div>
                        <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {app.status.toUpperCase()}
                        </div>
                      </div>
                    ))}
                    {apps.length === 0 && (
                      <p className="text-slate-500 text-center py-4">
                        Nema nedavnih aktivnosti.
                      </p>
                    )}
                  </div>
                </div>

                {/* Position Stats */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart2 size={20} className="text-amber-500" /> Popularne
                    Pozicije
                  </h3>
                  <div className="space-y-6">
                    {(() => {
                      const posCounts = {};
                      apps.forEach((a) => {
                        posCounts[a.position] =
                          (posCounts[a.position] || 0) + 1;
                      });
                      const usage = Object.entries(posCounts).sort(
                        (a, b) => b[1] - a[1]
                      );
                      const max = usage[0]?.[1] || 1;

                      return usage.slice(0, 5).map(([pos, count], i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-medium">
                              {pos}
                            </span>
                            <span className="text-white font-bold">
                              {count}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                              style={{
                                width: `${(count / max) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ));
                    })()}
                    {apps.length === 0 && (
                      <p className="text-slate-500 text-center py-4">
                        Nema podataka.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED USERS VIEW (Candidates) */}
          {activeTab === "users" && (
            <div className="animate-fadeIn">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Svi Registrovani Korisnici
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Ukupno: {registeredUsers.length}
                    </p>
                  </div>
                  <div className="flex bg-slate-800/50 rounded-lg p-1">
                    <div className="bg-slate-700/50 rounded flex items-center justify-center p-2 text-slate-300">
                      <Users size={18} />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Korisnik</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Datum Registracije</th>
                        <th className="px-6 py-4">Aktivne Prijave</th>
                        {adminUser.role === "master" && (
                          <th className="px-6 py-4">Akcije</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {registeredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            Nema registrovanih korisnika.
                          </td>
                        </tr>
                      ) : (
                        registeredUsers.map((u, i) => {
                          // Count active applications for this user
                          const userApps = apps.filter(
                            (a) =>
                              (a.userId && a.userId === u.id) ||
                              (a.email &&
                                a.email.toLowerCase() === u.email.toLowerCase())
                          );
                          const activeApps = userApps.filter(
                            (a) => a.status === "new" || a.status === "reviewed"
                          ).length;

                          return (
                            <tr
                              key={i}
                              className="hover:bg-white/5 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 group-hover:border-amber-500/50 transition-colors">
                                    {u.name ? u.name[0].toUpperCase() : "?"}
                                  </div>
                                  <span className="font-bold text-white">
                                    {u.name || "Nepoznato"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                                {u.email}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    u.role === "candidate"
                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                      : u.role === "staff"
                                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                      : "bg-slate-700 text-slate-400"
                                  }`}
                                >
                                  {u.role || "candidate"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-sm">
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                {activeApps > 0 ? (
                                  <span className="text-amber-500 font-bold">
                                    {activeApps} Aktivnih
                                  </span>
                                ) : (
                                  <span className="text-slate-600">
                                    Nema aktivnih
                                  </span>
                                )}
                              </td>
                              {adminUser.role === "master" && (
                                <td className="px-6 py-4">
                                  {u.role !== "staff" &&
                                    u.role !== "master" && (
                                      <button
                                        onClick={() => makeUserAdmin(u)}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all text-xs font-bold border border-slate-700 hover:border-amber-500"
                                        title="Promoviraj u Admina"
                                      >
                                        <ShieldAlert size={14} />
                                        Promoviraj
                                      </button>
                                    )}
                                  {u.role === "staff" && (
                                    <button
                                      onClick={() => demoteUser(u)}
                                      className="flex items-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all text-xs font-bold border border-slate-700 hover:border-red-500"
                                      title="Degradiraj u Kandidata"
                                    >
                                      <User size={14} />
                                      Degradiraj
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TEAM VIEW */}
          {activeTab === "team" && (
            <div className="grid grid-cols-1 gap-8 animate-fadeIn">
              <div className="space-y-4">
                {allAdmins.map((admin) => {
                  const perf = adminStats[admin.name] || {
                    count: 0,
                    revenue: 0,
                    jobs: [],
                  };
                  return (
                    <div
                      key={admin.id}
                      className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 text-xl border border-slate-700">
                          {admin.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white flex items-center gap-2">
                            {admin.name}
                            {admin.role === "master" && (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                                MASTER
                              </span>
                            )}
                          </h4>

                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Kod: {admin.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-8 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Angažmani
                          </p>
                          <p className="text-xl font-bold text-white">
                            {perf.count}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Prihod
                          </p>
                          <p className="text-xl font-bold text-amber-500">
                            {perf.revenue} €
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {admin.role !== "master" && (
                          <button
                            onClick={() => confirmDeleteAdmin(admin.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Obriši korisnika"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APPLICATIONS VIEW */}
          {activeTab === "applications" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-96">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Pretraži kandidate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-all border border-slate-700"
                >
                  <Download size={18} /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "all", label: "Sve Prijave" },
                  { id: "new", label: "Nove" },
                  { id: "reviewed", label: "U Obradi" },
                  { id: "hired", label: "Završene" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`p-4 rounded-xl border transition-all text-left group ${
                      filter === f.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p
                      className={`text-xs uppercase font-bold mb-1 ${
                        filter === f.id
                          ? "text-amber-500"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {f.label}
                    </p>
                    <div
                      className={`h-1 w-full rounded-full mt-2 ${
                        filter === f.id ? "bg-amber-500" : "bg-slate-800"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>

              {/* Table List */}
              <div className="space-y-3 mt-6">
                {filteredApps.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                    <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Nema pronađenih prijava
                    </h3>
                    <p className="text-slate-500">
                      Pokušajte promijeniti filtere ili pretragu.
                    </p>
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all flex flex-col md:flex-row gap-6 md:items-center"
                    >
                      {/* Avatar/Initials */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-500 border border-slate-700">
                          {app.firstName[0]}
                          {app.lastName[0]}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <h4 className="font-bold text-white text-lg">
                            {app.firstName} {app.lastName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Mail size={14} /> {app.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Phone size={14} /> {app.phone}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Pozicija
                          </p>
                          <p className="text-white font-medium flex items-center gap-2">
                            <Briefcase size={14} className="text-amber-500" />{" "}
                            {app.position}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {app.experience}
                          </p>
                        </div>

                        <div className="hidden lg:block">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Datum
                          </p>
                          <p className="text-sm text-slate-300">
                            {app.createdAt?.seconds
                              ? new Date(
                                  app.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                            Status
                          </p>
                          <div className="flex items-center gap-2">
                            {app.status === "new" && (
                              <span className="px-3 py-1 rounded-full bg-slate-700 text-white text-xs font-bold border border-slate-600">
                                Novo
                              </span>
                            )}
                            {app.status === "reviewed" && (
                              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                                U Obradi
                              </span>
                            )}
                            {app.status === "hired" && (
                              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                Završeno
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 justify-end">
                        {app.status === "new" && (
                          <button
                            onClick={() => updateStatus(app.id, "reviewed")}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                            title="Označi kao pregledano"
                          >
                            <Eye size={20} />
                          </button>
                        )}

                        <button
                          onClick={() => setViewApp(app)}
                          className="p-2 bg-slate-700/50 text-slate-300 hover:bg-amber-500 hover:text-slate-900 rounded-lg transition-all border border-slate-600 hover:border-amber-500"
                          title="Detalji prijave"
                        >
                          <FileText size={20} />
                        </button>

                        {app.status !== "hired" && (
                          <button
                            onClick={() => setHiringApp(app)}
                            className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                            title="Angažuj kandidata"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}

                        <button
                          onClick={() => confirmDeleteApp(app.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Obriši prijavu"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "companies" && (
            <div className="animate-fadeIn space-y-6">
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Pretraži firme..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
                <button
                  onClick={openNewCompanyInitial}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  <Building size={20} />
                  Nova Firma
                </button>
              </div>

              {/* Companies List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies
                  .filter(
                    (c) =>
                      c.name &&
                      c.name.toLowerCase().includes(companySearch.toLowerCase())
                  )
                  .map((company) => (
                    <div
                      key={company.id}
                      className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all flex flex-col"
                    >
                      {/* Card Header with Pattern */}
                      <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative p-4 flex justify-between items-start">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
                        <div
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider z-10 ${
                            company.status === "Inactive"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {company.status === "Inactive"
                            ? "Neaktivno"
                            : "Aktivno"}
                        </div>
                        <div className="flex gap-2 z-10">
                          <button
                            onClick={() => openEditCompany(company)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            title="Uredi"
                          >
                            <TrendingUp size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="p-1.5 bg-white/10 hover:bg-red-500/20 rounded-lg text-white hover:text-red-400 transition-colors"
                            title="Obriši"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex-1 flex flex-col">
                        {/* Company Icon/Logo Placeholder */}
                        <div className="-mt-10 mb-4 inline-flex">
                          <div className="h-20 w-20 rounded-2xl bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center text-3xl font-bold text-amber-500">
                            {company.name ? company.name[0] : "?"}
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-1">
                          {company.name}
                        </h4>
                        <p className="text-sm text-slate-400 flex items-center gap-2 mb-4">
                          {company.address}
                        </p>

                        <div className="space-y-3 mb-6 bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">
                              Otvorene pozicije
                            </span>
                            <span
                              className="text-white font-medium text-right max-w-[150px] truncate"
                              title={company.positions}
                            >
                              {company.positions || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">
                              Potrebno radnika
                            </span>
                            <span className="text-amber-500 font-bold">
                              {company.workerCount || "0"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Plaća</span>
                            <span className="text-white font-medium">
                              {company.salaryRange || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <User size={16} className="text-slate-500" />
                            <span className="truncate">
                              {company.contactPerson}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Phone size={16} className="text-slate-500" />
                            <span className="truncate">{company.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Mail size={16} className="text-slate-500" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {companies.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                  <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                    <Building size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Nema dodanih kompanija
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Kliknite na dugme "Nova Firma" da dodate partnere.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideUp z-50 ${
            toast.type === "success"
              ? "bg-amber-500 text-slate-900"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <ShieldAlert size={20} />
          )}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-slate-400 mb-6">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 rounded-xl text-slate-400 font-bold hover:bg-white/5 transition-colors"
              >
                Odustani
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiring Modal */}
      {hiringApp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Angažovanje Kandidata
              </h3>
              <button
                onClick={() => setHiringApp(null)}
                className="text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-slate-400">Kandidat</p>
              <h4 className="font-bold text-white text-lg">
                {hiringApp.firstName} {hiringApp.lastName}
              </h4>
              <p className="text-amber-500 text-sm font-bold">
                {hiringApp.position}
              </p>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Lokacija / Hotel
                </label>
                <input
                  required
                  value={hireLocation}
                  onChange={(e) => setHireLocation(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. Hotel Split"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">
                  Iznos Provizije (€)
                </label>
                <input
                  required
                  type="number"
                  value={hireFee}
                  onChange={(e) => setHireFee(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. 500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl mt-4 transition-all"
              >
                Potvrdi Angažman
              </button>
            </form>
          </div>
        </div>
      )}
      {/* View Application Modal */}
      {viewApp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-700" />

            <button
              onClick={() => setViewApp(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl font-bold text-amber-500 border border-slate-700">
                {viewApp.firstName[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {viewApp.firstName} {viewApp.lastName}
                </h3>
                <p className="text-slate-400 flex items-center gap-2">
                  <Briefcase size={14} className="text-amber-500" />
                  {viewApp.position}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500">
                    Kontakt Email
                  </label>
                  <p className="text-white flex items-center gap-2 mt-1">
                    <Mail size={16} className="text-slate-400" />{" "}
                    {viewApp.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500">
                    Telefon
                  </label>
                  <p className="text-white flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-slate-400" />{" "}
                    {viewApp.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500">
                    Iskustvo
                  </label>
                  <p className="text-white mt-1 border-l-2 border-amber-500 pl-3">
                    {viewApp.experience}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500">
                    Kratka Biografija
                  </label>
                  <div className="bg-slate-800/50 rounded-xl p-4 mt-2 text-sm text-slate-300 h-32 overflow-y-auto border border-white/5">
                    {viewApp.about || "Nije navedeno."}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-500">
                    CV Dokument
                  </label>
                  {viewApp.cvFile ? (
                    <a
                      href={viewApp.cvFile}
                      download={viewApp.cvName || "cv.pdf"}
                      className="flex items-center gap-3 mt-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all group cursor-pointer text-amber-500"
                    >
                      <FileText size={20} />
                      <span className="font-bold underline">
                        {viewApp.cvName || "Preuzmi CV"}
                      </span>
                      <Download
                        size={16}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  ) : (
                    <p className="text-slate-500 mt-2 italic">Nije priloženo</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={() => setViewApp(null)}
                className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-bold transition-colors"
              >
                Zatvori
              </button>
              {viewApp.status !== "hired" && (
                <button
                  onClick={() => {
                    setHiringApp(viewApp);
                    setViewApp(null);
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                >
                  Angažuj Kandidata
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Company Modal (Add/Edit) */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-scaleIn h-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building className="text-amber-500" />
                {editingCompany ? "Uredi Firmu" : "Dodaj Novu Firmu"}
              </h3>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSaveCompany}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Naziv Firme
                </label>
                <input
                  required
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, name: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. Hotel Grand"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Kontakt Osoba
                </label>
                <input
                  required
                  value={newCompany.contactPerson}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      contactPerson: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ime i Prezime"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Telefon
                </label>
                <input
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, phone: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. 061 123 456"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, email: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="email@kompanija.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Adresa
                </label>
                <input
                  value={newCompany.address}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, address: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Adresa i Grad"
                />
              </div>

              <div className="md:col-span-2 border-t border-white/5 pt-4 mt-2">
                <p className="text-amber-500 text-sm font-bold mb-3">
                  Informacije o Poslu
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Tražene Pozicije
                </label>
                <input
                  value={newCompany.positions}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, positions: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. Konobar, Kuhar, Sobarica"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Broj Radnika
                </label>
                <input
                  type="number"
                  value={newCompany.workerCount}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      workerCount: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. 10"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Raspon Plaće
                </label>
                <input
                  value={newCompany.salaryRange}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      salaryRange: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="npr. 800€ - 1200€"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={newCompany.status || "Active"}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, status: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Active">Aktivno</option>
                  <option value="Inactive">Neaktivno</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Napomene
                </label>
                <textarea
                  rows={3}
                  value={newCompany.notes}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, notes: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  placeholder="Dodatne informacije..."
                />
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="flex-1 py-3 rounded-xl text-slate-400 font-bold hover:bg-white/5 transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  {editingCompany ? "Sačuvaj Izmjene" : "Kreiraj Firmu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
