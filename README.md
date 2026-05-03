# 2140 Web

2140 Web is a Next.js App Router shell around 2140city.cn. It presents 2140 data as dashboards, race-war views, writing/history pages, GPT-X chat, and scheduled AI agent commentary.

## Stack

- Next.js 16.2.4 with App Router and Turbopack
- React 19.2.4
- Tailwind CSS 4 and shadcn-style local UI primitives
- Supabase for agent logs, memories, human chapters, tips, and civilization events
- DeepSeek-compatible OpenAI SDK client for GPT-X chat and scheduled agents
- Vercel Cron for `/api/cron`

This repository includes project-specific agent guidance in `AGENTS.md`. Before changing Next.js code, read the relevant local Next docs under `node_modules/next/dist/docs/`.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server defaults to `http://localhost:3000`. If that port is already in use, Next chooses another available port.

## Environment Variables

See `.env.example` for the full list.

Required for public 2140-backed pages:

- `API_BASE`
- `AGENT_MOBILE`
- `AGENT_PASSWD_MD5`

Required for Supabase-backed features:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Required for GPT-X chat and scheduled agents:

- `DEEPSEEK_API_KEY`

Required for Vercel Cron:

- `CRON_SECRET`

Without Supabase configuration, Supabase-backed feeds and write/tip APIs degrade gracefully instead of crashing. Without `DEEPSEEK_API_KEY`, `/api/chat` returns `503`.

## Key Files

- `src/lib/api2140.ts`: wrapper for 2140city.cn endpoints
- `src/lib/auth.ts`: server-side `ci_session` cookie helpers
- `src/lib/supabase.ts`: lazy Supabase clients and env checks
- `src/lib/agents.ts`: HORUS/NUT/ZEUS/LOKI scheduled agent orchestration
- `src/app/api/auth/route.ts`: 2140 login/logout route handler
- `src/app/api/chat/route.ts`: GPT-X streaming chat endpoint
- `src/app/api/cron/route.ts`: Vercel Cron entrypoint for scheduled agents
- `src/components/Nav.tsx`: main navigation groups

## Reference Archive

Use `/Users/tony/Projects/2140-research` as the read-only reference archive for the original 2140.cn app. It includes the APK, extracted web assets, static snapshots, API crawl results, response samples, and generated research reports. Before changing API wrappers, page behavior, field mappings, or visual restoration work, compare against this archive.

The current API coverage map lives in `docs/2140-api-crosswalk.md`.

## Commands

```bash
npm run dev
npm run build
npm run lint
```

Current takeover status:

- `npm run build` passes.
- `npm run lint` fails because the inherited codebase has many `any` types plus React Hooks/Compiler lint findings. Treat lint cleanup as a separate hardening pass.
