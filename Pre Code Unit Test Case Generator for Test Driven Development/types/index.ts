export type TestCategory = "happy-path" | "boundary" | "negative" | "edge";

export interface FormInputs {
  functionName: string;
  programmingLanguage: string;
  description: string;
  parameters: string;
  expectedBehavior: string;
  boundaryConditions: string;
  returnType: string;
  notes: string;
}

export interface TestCase {
  id: string;
  category: TestCategory;
  title: string;
  input: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  priority: "High" | "Medium" | "Low";
}

export interface SessionRecord {
  id: string;
  functionName: string;
  createdAt: string;
  formInputs: FormInputs;
  testCases: TestCase[];
}

export interface GenerateResponse {
  session: SessionRecord;
}
