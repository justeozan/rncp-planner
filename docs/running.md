# Running RNCP planner locally

No 42 API key, Redis or environment variable is needed: the site has no
accounts and every page is public.

## With Docker

Prerequisite: [Docker](https://www.docker.com/).

```bash
docker compose up --build
```

Open http://localhost:3000 (it redirects to `/planner`).

## Without Docker

Prerequisite: Node.js 20+.

```bash
npm install
npm run dev
```
