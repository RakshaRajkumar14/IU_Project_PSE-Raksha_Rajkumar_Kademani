# Pre-Code Unit Test Case Generator

In modern software engineering, many organizations require developers to create unit test cases before implementing actual code as part of Test-Driven Development (TDD). This project implements the Phase 2 web application described in the university project guidelines, providing an intelligent system capable of automatically creating pre-code unit test cases from function and behavior descriptions.

## Technology Stack
| **Component**                      | **Technologies**                                   |
| ---------------------------------- | -------------------------------------------------- |
| **Framework**                      | Next.js 14, TypeScript 5, React 18                 |
| **AI Engine**                      | Google Gemini API                                  |
| **Database Layer**                 | Supabase PostgreSQL                                |
| **Excel Export Module**            | ExcelJS (.xlsx with formatted headers)             |
| **Authentication**                 | Supabase Auth                                      |
| **DevOps & CI/CD**                 | Docker, Docker Compose                             |
| **Deployment**                     | Render (Optimized Standalone Build)               |

## Key Features
- **Intelligent Generation**: Uses Google Gemini to construct comprehensive testing suites including edge cases and boundary conditions.
- **Structured Workspace**: Inline editable test case tables for late-stage refinements.
- **Excel Professional Export**: Formatted `.xlsx` exports with alternating row colors and professional headers.
- **Session Persistence**: Automatic Supabase persistence for all test generation sessions.
- **History Library**: Search, filter, reload, and manage your past test suites on demand.
- **Premium UI**: Multi-page navigation with high-performance QA-themed canvas animations and glassmorphism.

## Goals
- Eliminate manual effort in writing test cases in Excel by auto-generating structured and standardized test sheets.
- Support multiple development flows by enabling developers to define tests before implementing code.
- Provide a standardized and time-saving solution that accelerates the development process and enhances software quality overall.

## Environment Setup
Copy `.env.example` values into `.env.local` and fill in:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Run Locally
```bash
npm install
npm run dev
```

## Docker Deployment
```bash
docker compose up --build
```

## Project Status
1. Conception Phase – Done  
2. Development Phase – Complete (Academic Submission Ready)
