import ExcelJS from "exceljs";
import type { TestCase } from "@/types";

export async function createWorkbookBuffer(
  functionName: string,
  testCases: TestCase[],
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Test Cases");

  worksheet.columns = [
    { header: "Category", key: "category", width: 16 },
    { header: "Title", key: "title", width: 28 },
    { header: "Input", key: "input", width: 26 },
    { header: "Preconditions", key: "preconditions", width: 24 },
    { header: "Steps", key: "steps", width: 34 },
    { header: "Expected Result", key: "expectedResult", width: 34 },
    { header: "Priority", key: "priority", width: 14 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFF8F5EF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF16423C" },
  };

  testCases.forEach((testCase, index) => {
    const row = worksheet.addRow(testCase);

    row.alignment = {
      vertical: "top",
      wrapText: true,
    };

    if (index % 2 === 1) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF6EEE1" },
      };
    }
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFDCCFB6" } },
        left: { style: "thin", color: { argb: "FFDCCFB6" } },
        bottom: { style: "thin", color: { argb: "FFDCCFB6" } },
        right: { style: "thin", color: { argb: "FFDCCFB6" } },
      };
    });
  });

  workbook.creator = "Pre-Code Unit Test Case Generator";
  workbook.created = new Date();
  workbook.subject = `${functionName} unit test cases`;

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
