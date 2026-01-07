import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase Connection...");

  // Try to sign up a fake user
  const email = `test.user.${Math.floor(Math.random() * 10000)}@gmail.com`;
  const password = "password123";

  console.log(`Attempting to sign up user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Connection Failed or Error:", error.message);
    if (error.message.includes("API key")) {
      console.error(
        'NOTE: The API Key format looks suspicious. Standard Supabase keys are JWTs starting with "ey...".'
      );
    }
  } else {
    console.log("Success! User created:", data.user?.email);
    console.log("Connection Verified.");
  }
}

testConnection();
