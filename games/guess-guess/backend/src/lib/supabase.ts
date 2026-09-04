import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test the connection
supabase.auth
  .getSession()
  .then(({ data: { session }, error }) => {
    if (error) {
      console.error("Error connecting to Supabase:", error.message);
    } else if (session) {
      console.log("Successfully connected to Supabase");
    }
  })
  .catch((error) => {
    console.error("Failed to connect to Supabase:", error.message);
  });
