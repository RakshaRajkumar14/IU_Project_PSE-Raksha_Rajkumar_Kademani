import type { FormInputs, TestCase, TestCategory } from "@/types";
import { getSessionsTableName, getSupabaseAdmin, mapSessionRow } from "@/lib/supabase";

export async function saveSession(payload: {
  userId: string;
  functionName: string;
  formInputs: FormInputs;
  testCases: TestCase[];
}) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { data, error } = await supabase
    .from(table)
    .insert({
      user_id: payload.userId,
      function_name: payload.functionName,
      form_inputs: payload.formInputs,
      test_cases: payload.testCases,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSessionRow(data);
}

export async function searchSessions(params: {
  userId: string;
  query: string;
  category: string;
  sort: string;
}) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  let request = supabase
    .from(table)
    .select("*")
    .eq("user_id", params.userId)
    .order("created_at", { ascending: params.sort === "oldest" });

  if (params.query) {
    request = request.ilike("function_name", `%${params.query}%`);
  }

  const { data, error } = await request.limit(50);
  if (error) throw new Error(error.message);

  let sessions = data.map(mapSessionRow);

  if (params.category) {
    sessions = sessions.filter((session) =>
      session.testCases.some((tc) => tc.category === params.category)
    );
  }

  return sessions;
}

export async function getSessionById(id: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return mapSessionRow(data);
}

export async function deleteSession(id: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export function countCategories(testCases: TestCase[]) {
  return testCases.reduce<Record<TestCategory, number>>(
    (accumulator, testCase) => {
      accumulator[testCase.category] += 1;
      return accumulator;
    },
    { "happy-path": 0, boundary: 0, negative: 0, edge: 0 }
  );
}
