import { createClient } from "@supabase/supabase-js";

type SupabaseRow = Record<string, unknown>;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function querySupabase(
  table: string,
  query = "",
): Promise<SupabaseRow[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase not configured");

  // Build a simple select query from the query string params
  const params = new URLSearchParams(query);
  const select = params.get("select") ?? "*";
  const limit = params.get("limit");

  let req = client.from(table).select(select);
  if (limit) req = req.limit(Number(limit));

  const { data, error } = await req;
  if (error) throw new Error(`Supabase query failed for ${table}: ${error.message}`);
  return (data ?? []) as unknown as SupabaseRow[];
}

export async function insertSupabaseRow(
  table: string,
  row: SupabaseRow,
): Promise<SupabaseRow> {
  const client = getClient();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client.from(table).insert(row).select().single();
  if (error) throw new Error(`Supabase insert failed for ${table}: ${error.message}`);
  return data as SupabaseRow;
}