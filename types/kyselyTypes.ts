import type { Database as Supabase } from "types/supabaseTypes.ts";
import type { KyselifyDatabase } from "ky-supa";

export type Database = KyselifyDatabase<Supabase>;
