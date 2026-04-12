# Pre-Code Unit Test Case Generator

This project implements the Phase 2 web application described in `ProjectSummary.docx`.

## Stack

- Next.js 14
- TypeScript 5
- React 18
- Google Gemini API
- Supabase PostgreSQL
- ExcelJS
- Docker Compose

## Features

- Structured form-driven test case generation
- Gemini JSON-only prompting
- Inline editable test case table
- Excel `.xlsx` export with formatted headers and alternating rows
- Automatic Supabase session persistence
- Searchable history library with reload, filter, and delete

## Environment

Copy `.env.example` values into `.env.local` and fill in:

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Schema

Run the SQL in [supabase/schema.sql](supabase/schema.sql) to create the `sessions` table and indexes.

## Run locally

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```
