import { ReplitConnectors } from "@replit/connectors-sdk";

type SupabaseRow = Record<string, unknown>;

const connectors = new ReplitConnectors();

export async function querySupabase(
  table: string,
  query = "",
): Promise<SupabaseRow[]> {
  const response = await connectors.proxy(
    "supabase",
    `/rest/v1/${table}${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Supabase request failed (${response.status}) for ${table}: ${detail}`,
    );
  }

  const payload = (await response.json()) as unknown;
  return Array.isArray(payload) ? (payload as SupabaseRow[]) : [];
}

export async function insertSupabaseRow(
  table: string,
  row: SupabaseRow,
): Promise<SupabaseRow> {
  const response = await connectors.proxy(
    "supabase",
    `/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Supabase insert failed (${response.status}) for ${table}: ${detail}`,
    );
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload) || !payload[0]) {
    throw new Error(`Supabase insert returned no row for ${table}`);
  }
  return payload[0] as SupabaseRow;
}