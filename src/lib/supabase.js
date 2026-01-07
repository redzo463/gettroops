import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseKey;

if (!isConfigured) {
  console.warn(
    "Supabase URL or Key is missing. App running in restricted/demo mode."
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: () =>
          Promise.reject(new Error("Supabase not configured")),
        signUp: () => Promise.reject(new Error("Supabase not configured")),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase not configured"),
          }),
        update: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase not configured"),
          }),
        delete: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase not configured"),
          }),
      }),
    };
