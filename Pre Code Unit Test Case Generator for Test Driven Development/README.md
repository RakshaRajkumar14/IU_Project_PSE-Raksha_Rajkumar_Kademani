# Pre Code Unit Test Case Generator for Test Driven Development
In modern software engineering many organizations require developers to create unit test cases before implementing actual code as part of Test-Driven Development. This process is often done manually with excel sheets. This approach is repetitive takes a lot of time and is prone to human errors. Developers will spend a lot of time documenting inputs and expected across edge cases instead of concentrating on system design and implementation. This leads to decreased productivity and inconsistencies across teams. Before implementing code, the suggested system's Pre-Code Unit Test Case Generator generates organized unit test cases. Through a user-friendly web interface, developers provide the planned function or method details, such as name, input parameters, expected behavior, and boundary conditions. Following then, the system uses predefined guidelines to generate suitable unit test cases, which are then saved in a standard Excel sheet format for corporate use. The system aims to improve developer productivity, maintain documentation consistency, and promote test-driven development practices by accelerating the pre-coding test case generation process. The expected outcome will be a standardized and time-saving solution that accelerates development process, enhances software quality overall, and makes it easier to prepare of unit test cases.

## Goals
- Design an intelligent system capable of automatically creating pre-code unit test cases from function and behavior descriptions provided by the user.
- Eliminate manual effort in writing the test cases in Excel by auto generating structured and standardized test sheets.
- Support multiple programming languages, including Python, Java and JavaScript, with customizable test case templates.
- Improve TDD workflows by enabling developers to define tests before implementing code.
- Integrate AI assistance for suggesting boundary conditions, edge cases and potential failure scenarios.
- Export generated unit test cases in Excel format for easy sharing and inclusion in corporate testing workflows.
- Web-based interface to simplify input collection, preview and download of generated test cases.
- Implement DevOps CI/CD pipeline integrations to enable automation of validation and provide version-controlled test case management.

## Technology Stack
| **Component**                      | **Technologies**                                   |
| ---------------------------------- | -------------------------------------------------- |
| **Frontend Interface**             | React.js / Angular, TypeScript, Tailwind CSS       |
| **Backend API**                    | Python (FastAPI / Flask)                           |
| **Test Case Generation Engine**    | Python, Pandas, openpyxl                           |
| **Database Layer**                 | PostgreSQL                                         |
| **Excel/Report Export Module**     | openpyxl / xlsxwriter                              |
| **DevOps & CI/CD Pipeline**        | GitHub Actions, Docker, Docker Compose             |
| **Version Control & Repository**   | Git, GitHub                                        |
| **Authentication & Security**      | JWT                                                |
| **Deployment Layer**               | AWS                                                |

## Phase Status
1. Conception Phase – Done  
2. Development Phase – In Progress
