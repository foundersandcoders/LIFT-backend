import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as supabase from "npm:supabase";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_KEY") || "";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

// Create Supabase Options
// Check https://supabase.com/docs/reference/javascript/initializing
// const options = {
//   db: {
//     schema: 'public',
//   },
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   },
//   global: {
//     headers: { 'x-my-custom-header': 'my-app-name' },
//   },
// }

export const supabase = createClient(supabaseUrl, supabaseKey, /* options */);

// Generate Supabase Types
// https://supabase.com/docs/reference/javascript/typescript-support

console.log(Object.keys(supabase));