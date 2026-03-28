import type { FormInputs, SessionRecord, TestCase, TestCategory } from "@/types";
import { getSessionsTableName, getSupabaseAdmin, mapSessionRow } from "@/lib/supabase";

export async function saveSession(payload: {
  functionName: string;
  formInputs: FormInputs;
  testCases: TestCase[];
}) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { data, error } = await supabase
    .from(table)
    .insert({
      function_name: payload.functionName,
      form_inputs: payload.formInputs,
      test_cases: payload.testCases,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSessionRow(data);
}

export async function searchSessions(params: {
  query: string;
  category: string;
  sort: string;
}) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  let request = supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: params.sort === "oldest" ? true : false });

  if (params.query) {
    request = request.ilike("function_name", `%${params.query}%`);
  }

  const { data, error } = await request.limit(50);

  if (error) {
    throw new Error(error.message);
  }

  let sessions = data.map(mapSessionRow);

  if (params.category) {
    sessions = sessions.filter((session) =>
      session.testCases.some(
        (testCase) => testCase.category === params.category,
      ),
    );
  }

  return sessions;
}

export async function deleteSession(id: string) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSessionById(id: string) {
  const supabase = getSupabaseAdmin();
  const table = getSessionsTableName();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSessionRow(data);
}

export function countCategories(testCases: TestCase[]) {
  return testCases.reduce<Record<TestCategory, number>>(
    (accumulator, testCase) => {
      accumulator[testCase.category] += 1;
      return accumulator;
    },
    {
      "happy-path": 0,
      boundary: 0,
      negative: 0,
      edge: 0,
    },
  );
}
