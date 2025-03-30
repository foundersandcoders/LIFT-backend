import type { Database as Supa } from "types/supabaseTypes.ts";
import type { KyselifyDatabase } from "npm:kysely-supabase";

export type Database = KyselifyDatabase<Supa>;