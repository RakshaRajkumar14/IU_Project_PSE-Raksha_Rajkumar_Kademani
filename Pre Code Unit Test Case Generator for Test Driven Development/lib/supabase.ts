import { createClient } from "@supabase/supabase-js";
import type { FormInputs, SessionRecord, TestCase } from "@/types";

type SessionRow = {
  id: string;
  function_name: string;
  created_at: string;
  form_inputs: FormInputs;
  test_cases: TestCase[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSessionsTableName() {
  return process.env.SUPABASE_SESSIONS_TABLE || "sessions";
}

export function mapSessionRow(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    functionName: row.function_name,
    createdAt: row.created_at,
    formInputs: row.form_inputs,
    testCases: row.test_cases,
  };
}
