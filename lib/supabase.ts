import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jsortsesejesilbjaeky.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3J0c2VzZWplc2lsYmphZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyNzU5MjgsImV4cCI6MjA0Mjg1MTkyOH0.7JuS6UrPEOxtP7Pz5za7us4X75AO39oe8HWXOG5nPoQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
