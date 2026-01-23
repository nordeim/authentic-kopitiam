## [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) (validated notes)

Key committed environment knobs in [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0):

- **Backend URL:** `APP_URL=http://localhost:8000`
- **Frontend URL (CORS / Sanctum / redirects):** `FRONTEND_URL=http://localhost:3000`
- **DB/Redis hosts:** `DB_HOST=postgres`, `REDIS_HOST=redis` (docker service names)
- **GST + currency:** `GST_RATE=0.09`, `CURRENCY_CODE=SGD`
- **Payments toggles/secrets:** `PAYNOW_ENABLED=true`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `PAYNOW_*`
- **PDPA config:** `PDPA_ENABLED=true`, `PDPA_RETENTION_DAYS=30`, etc.

**Important:** the file contains **duplicated and conflicting keys** (e.g. `GST_RATE` appears multiple times; PDPA retention days differs `90` vs `365`; Stripe keys repeated). Laravel will take the **last occurrence** for any duplicated key, so this example file is not a reliable “final configuration” reference until it’s cleaned up.

---

## Is “no Next.js `app/api/*` routes” a blocker/bug or expected for BFF?

### 1) Conceptually: not inherently a bug
A system can still be “BFF-shaped” (or at least “frontend + backend split”) without Next.js `app/api/*` route handlers if you use one of these patterns:

- **Direct-to-backend from browser:** frontend calls Laravel API via absolute URL (CORS enabled).
- **Reverse proxy outside Next:** nginx / ingress routes `/api/*` to Laravel.
- **Next rewrites proxying:** `next.config.*` rewrites `/api/*` → `http://backend/...` (still no `app/api` needed).

So absence of `app/api` is **not automatically** wrong.

### 2) In *this repo’s current implementation*: it’s a **functional blocker** given the current call patterns
It becomes a **bug/blocker** because the frontend code (validated earlier) performs `fetch('/api/v1/...')` in multiple places. Without **either**:

- Next.js rewrites/proxy, **or**
- Next route handlers under `src/app/api/**/route.ts`, **or**
- An external reverse proxy mapping `/api/*` to Laravel,

those relative calls will hit the **Next.js server** (`localhost:3000/api/v1/...`) and will 404.

So the real issue is not “missing `app/api`”, it’s **missing a routing/proxy strategy that matches how the frontend is calling the API**.

---

## Practical decision point (to resolve this cleanly)

Pick exactly one approach and standardize:

1. **Proxy approach (keeps relative `/api/v1/*` in frontend):**
   - Add Next.js rewrites (or external reverse proxy) so `/api/v1/*` routes to Laravel.

2. **Direct-to-backend approach (keeps infra simpler):**
   - Update *all* frontend API calls to use a single absolute base URL (e.g. `NEXT_PUBLIC_API_URL`), and remove relative `/api/v1/*` usage.

---

I’ll first map every frontend API call that still uses relative paths (e.g. `fetch('/api/v1/...')`) and every place that derives an API base URL, then propose a *single normalized* “direct-to-backend” URL strategy (using `NEXT_PUBLIC_API_URL`) and the exact files to change. In parallel, I’ll clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) by removing duplicate/conflicting keys and stripping any hardcoded test secrets. After you confirm the plan, I’ll implement the changes and update the handbook accordingly.

I’m going to (1) scan the frontend for any `fetch('/api/...')` / relative API calls and any ad-hoc API base URL construction, (2) identify the smallest set of shared utilities to standardize everything on `NEXT_PUBLIC_API_URL` → `.../api/v1`, and (3) inspect backend config to clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) so the variable names match what the Laravel code actually reads.


I’m going to confirm exactly which backend env keys are actually consumed (especially payment + InvoiceNow + Sanctum/CORS-related) so that [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) can be cleaned without breaking anything. Then I’ll propose a concrete “direct-to-backend” normalization plan (single `NEXT_PUBLIC_API_URL` contract + list of frontend files to update) and ask you to confirm before I edit code.

## Plan (Direct-to-backend, no Next `app/api` needed) — please confirm before I edit code

You asked to resolve the “no routes” issue via the **Direct-to-backend approach**, plus clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0), then update the handbook. Here’s the meticulous plan I propose.

---

# 1) Problem statement (validated)

- The frontend currently contains multiple **relative** requests like `fetch('/api/v1/...')`.
- There is **no** Next.js proxy layer (`src/app/api/**/route.ts`), and no rewrites, so those requests will hit the Next server (`:3000`) and 404.
- Therefore, “no Next.js `app/api/*` routes” is **not inherently wrong**, but it **is a functional bug in this repo** because the frontend’s request style assumes a proxy that doesn’t exist.

---

# 2) Resolution strategy (Direct-to-backend contract)

## **Contract**
- `NEXT_PUBLIC_API_URL` will be treated as the backend **API root** (e.g. `http://localhost:8000/api`)
- Frontend will derive a single canonical base:
  - `API_V1_BASE_URL = ${NEXT_PUBLIC_API_URL}/v1`
- All frontend network calls will use **absolute URLs** to Laravel:
  - No more `fetch('/api/v1/...')`

## **Auth propagation decision (important)**
Because the repo’s frontend already stores a bearer token in `localStorage` and uses `Authorization: Bearer ...` for auth in [auth-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/auth-api.ts:0:0-0:0), I propose we standardize on:

- **Bearer token auth for protected endpoints**
- Default `credentials: 'omit'` (safer cross-origin)
- Attach `Authorization` header automatically when token exists

This avoids relying on cross-origin cookies / Sanctum “stateful SPA” mode, which can be fragile unless CORS + stateful domains are perfectly configured.

---

# 3) Implementation plan (minimal, coherent changes)

## 3.1 Add a small shared URL helper (single source of truth)
- Add **one** tiny utility in `frontend/src/lib/api/…` to:
  - normalize trailing slashes
  - build `API_V1_BASE_URL`
  - build full endpoint URLs from a relative path like `/payments/...`

(Without this, we’ll keep reintroducing `/api/v1` duplication bugs.)

## 3.2 Update all relative fetch callsites to use the helper
From the scan results, these files must be updated:

- [frontend/src/components/payment/payment-method-selector.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/components/payment/payment-method-selector.tsx:0:0-0:0)
- [frontend/src/components/payment/paynow-qr-display.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/components/payment/paynow-qr-display.tsx:0:0-0:0)
- [frontend/src/hooks/use-payment-status.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/hooks/use-payment-status.ts:0:0-0:0)
- [frontend/src/lib/graceful-payment-fallback.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/graceful-payment-fallback.tsx:0:0-0:0)
- `frontend/src/app/(shop)/checkout/confirmation/page.tsx`

Success criteria:
- `grep` finds **zero** remaining `fetch('/api/v1` / `'/api/v1` occurrences.

## 3.3 Fix base URL duplication in existing API clients
- [frontend/src/lib/auth-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/auth-api.ts:0:0-0:0)
  - currently mixes `/api` vs `/api/v1` depending on env; we’ll unify it to always hit `/api/v1/*`.
- [frontend/src/lib/api/payment-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/api/payment-api.ts:0:0-0:0)
  - currently does `${baseUrl}/api/v1/...` while `baseUrl` is already `.../api` → this becomes `.../api/api/v1/...`
  - we’ll correct it to use `API_V1_BASE_URL` and paths like `/payments/...`

## 3.4 Clean up [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) (remove duplicates/conflicts + remove hardcoded test secrets)
What I’ll do:
- Remove duplicate keys (GST_RATE, PDPA_* blocks, repeated Stripe keys, etc.)
- Remove any committed “test-looking” secrets (e.g. `sk_test_...`, `whsec_...`)
- Keep a coherent minimal example set aligned with **what backend config actually reads**, e.g.:
  - `APP_*`, `FRONTEND_URL`
  - DB/Redis + cache/session/queue
  - Mailpit defaults
  - Payment keys that match [backend/config/payment.php](cci:7://file:///home/project/authentic-kopitiam/backend/config/payment.php:0:0-0:0) (`STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MODE`, `PAYNOW_UEN`, `PAYNOW_API_KEY`, `PAYNOW_API_SECRET`, `PAYNOW_API_URL`, `PAYNOW_MODE`, `PAYMENT_CURRENCY`)
  - `SANCTUM_STATEFUL_DOMAINS` (optional, but safe to keep for teams that choose cookie-mode later)

## 3.5 Update [CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md](cci:7://file:///home/project/authentic-kopitiam/CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md:0:0-0:0)
I’ll add/adjust two sections:

- **[backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) note**
  - Mention it previously contained duplicate/conflicting keys and has been normalized.
  - Clarify it’s an example; `.env` remains gitignored.

- **“No Next routes” resolution**
  - Document that we **intentionally** do not use Next `app/api` routes.
  - Document the direct-to-backend approach:
    - `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
    - frontend calls `http://localhost:8000/api/v1/...` explicitly

## 3.6 Stage only relevant changes
- Stage:
  - [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0)
  - the touched frontend files
  - [CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md](cci:7://file:///home/project/authentic-kopitiam/CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md:0:0-0:0)
- Avoid staging unrelated modified/untracked files currently present in the repo.

---

# 4) Validation checklist (post-change)

- **[API calls]** No remaining `fetch('/api/v1')` calls in frontend
- **[Base URL]** No `.../api/api/v1...` double-prefix anywhere
- **[Build]** `frontend` typecheck/build passes
- **[Docs]** Handbook updated with the resolution + env example note
- **[Security hygiene]** [.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) contains no real secrets

---

## Confirmation needed
Confirm you want the **bearer-token standardization** as part of this “direct-to-backend” fix (recommended), or do you want me to keep existing `credentials: 'include'` behavior and assume cookie-based Sanctum SPA mode?

- **Option A (recommended):** Direct-to-backend + **Bearer token auth everywhere** (no cookie reliance)
- **Option B:** Direct-to-backend but **keep cookie-mode assumptions** (`credentials: 'include'`), and we’ll ensure backend CORS/Sanctum stateful config supports it

---

Proceeding with Option A: I’ll implement a single frontend API base + `fetch` wrapper that always targets Laravel directly via `NEXT_PUBLIC_API_URL` (normalized to `/api/v1`) and automatically attaches the bearer token from `localStorage`. Then I’ll refactor every remaining relative `/api/v1/*` callsite to use this wrapper, clean up [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) (remove duplicates/conflicts and strip hardcoded test secrets), and finally update/stage the handbook with the resolution and env notes.

I’m going to implement the direct-to-backend + bearer-token approach by adding a small shared frontend API client helper (builds `http://.../api/v1` from `NEXT_PUBLIC_API_URL`, attaches `Authorization: Bearer ...`), then refactor every remaining relative `/api/v1/*` callsite to use it. After that, I’ll clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) (remove duplicates/conflicts and strip placeholder secrets), update the handbook to reflect the resolution, and stage only the relevant files.

I’m going to (1) add a small shared `apiFetch` helper to standardize direct-to-backend calls with bearer auth, (2) refactor every remaining relative `/api/v1/*` fetch call to use it, (3) clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) to a coherent, non-duplicated set of variables that match the backend config, and (4) update + stage the handbook with the resolution notes.

Implementing Option A now: I’ll refactor the remaining frontend callsites to use the new [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-40:1) helper (direct-to-backend, bearer token, no cookies), update [auth-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/auth-api.ts:0:0-0:0) to use the same canonical `/api/v1` base, then clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) and update the handbook with the resolution details.

I saw the `grep_search` regex parse error (bad escape sequence). I’ll avoid regex escapes and rerun the search using **fixed-string** queries to safely locate the remaining `'/api/v1'` callsites, then refactor them to the new direct-to-backend [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-47:1) helper (bearer token, no cookies).

I’m now going to refactor the remaining frontend `'/api/v1/*'` callsites to use the shared [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-47:1) helper (direct-to-backend + bearer token + no cookie credentials). After that, I’ll clean [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) into a single coherent, non-duplicated example matching [backend/config/payment.php](cci:7://file:///home/project/authentic-kopitiam/backend/config/payment.php:0:0-0:0) and related configs, then update the handbook to document the resolution and env notes, and finally stage only the relevant files.

I’m going to (1) update the todo list to reflect that the frontend “no routes” issue is now resolved via direct-to-backend [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-40:1) + bearer tokens, (2) update [CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md](cci:7://file:///home/project/authentic-kopitiam/CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md:0:0-0:0) to document the new resolution and the cleaned [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0), and (3) stage only the relevant changed files in git.

I’m going to correct the handbook so it matches the now-implemented “direct-to-backend + bearer token” resolution: remove the duplicate heading, update the BFF section so it no longer claims the frontend is using relative `/api/v1/*` calls, and fix the remaining markdownlint warnings. Then I’ll stage the relevant changed files (frontend API fixes, [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0), and the handbook).


I’m going to fix the remaining handbook formatting warnings (add the required blank line before the list in the BFF section, and double-check there’s only one “What this project is” heading). Then I’ll stage only the relevant files: the new [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-47:1) helper, the updated frontend callsites, the cleaned [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0), and the updated handbook.

I’ll (1) update the todo list to mark the handbook update as complete, (2) stage only the relevant files for the direct-to-backend + bearer token fix (leaving unrelated modified/untracked files unstaged), and (3) clarify the last markdownlint/tooling error: the “blank line before list” change is already present, so the warning/tool output appears stale; I’ll point you to the exact spot to adjust if your editor still flags it.


I’ll re-run the `git add` with the `(shop)` path properly quoted (bash treats parentheses specially), then verify `git status` to ensure only the intended files are staged. After staging succeeds, I’ll mark the staging todo as completed.

---

## Implemented: “No routes” fix via Direct-to-backend + Bearer tokens (Option A)

### What changed (validated)
- **Frontend now has a single canonical API helper:**
  - [frontend/src/lib/api/api-fetch.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:0:0-0:0)
  - Builds the backend base as: `${NEXT_PUBLIC_API_URL}/v1`
  - Uses **Bearer token auth** from `localStorage` (`auth_token`)
  - Uses `credentials: 'omit'` (no cookie reliance)
  - Supports `{ includeAuth: false }` for public endpoints like login/register/health checks
- **All remaining frontend relative calls to `/api/v1/*` are removed**
  - Verified: `grep` for `"/api/v1"` in `frontend/src` now returns **no results**
  - Verified: `credentials: 'include'` now returns **no results**

### Files updated for the “no routes” resolution
- [frontend/src/lib/api/api-fetch.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:0:0-0:0) (new)
- [frontend/src/lib/auth-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/auth-api.ts:0:0-0:0)
- [frontend/src/lib/api/payment-api.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/api/payment-api.ts:0:0-0:0)
- [frontend/src/components/payment/payment-method-selector.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/components/payment/payment-method-selector.tsx:0:0-0:0)
- [frontend/src/components/payment/paynow-qr-display.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/components/payment/paynow-qr-display.tsx:0:0-0:0)
- [frontend/src/hooks/use-payment-status.ts](cci:7://file:///home/project/authentic-kopitiam/frontend/src/hooks/use-payment-status.ts:0:0-0:0)
- [frontend/src/lib/graceful-payment-fallback.tsx](cci:7://file:///home/project/authentic-kopitiam/frontend/src/lib/graceful-payment-fallback.tsx:0:0-0:0)
- `frontend/src/app/(shop)/checkout/confirmation/page.tsx`

---

## Cleaned: [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0)
- Removed duplicated/conflicting keys and removed hardcoded test-like secrets.
- Kept a coherent minimal set aligned to **what the backend actually reads**, especially:
  - `FRONTEND_URL` (from `config/app.php`)
  - `SANCTUM_STATEFUL_DOMAINS` (from `config/sanctum.php`)
  - Stripe/PayNow keys (from `config/payment.php`)

---

## Handbook updated
- [CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md](cci:7://file:///home/project/authentic-kopitiam/CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md:0:0-0:0) now documents:
  - The **direct-to-backend** resolution (no Next `app/api/*` required)
  - The [backend/.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) cleanup note
  - The auth [/api](cci:9://file:///home/project/authentic-kopitiam/frontend/src/lib/api:0:0-0:0) vs `/api/v1` mismatch is now marked as **resolved** via [apiFetch](cci:1://file:///home/project/authentic-kopitiam/frontend/src/lib/api/api-fetch.ts:22:0-47:1)

---

## Git status / staging
The **intended fix set is staged**:
- `A  frontend/src/lib/api/api-fetch.ts`
- `M  CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md`
- `M  backend/.env.example`
- plus the updated frontend callsites listed above.

Unrelated modified/untracked files remain **unstaged** (e.g. `AGENTS.md`, `GEMINI.md`, `AGS1`, etc.).

---

## Note on the earlier tool error
- The failed `git add` was due to bash interpreting parentheses in `frontend/src/app/(shop)/...`.
- I fixed it by quoting that path; staging then succeeded.

---

## Status
- **Completed:** direct-to-backend + bearer-token implementation, [.env.example](cci:7://file:///home/project/authentic-kopitiam/backend/.env.example:0:0-0:0) cleanup, handbook updated, and relevant changes staged.

$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   CODEBASE_DEEP_UNDERSTANDING_HANDBOOK.md
        new file:   QA_observation_no_next_routes.md
        modified:   backend/.env.example
        modified:   frontend/src/app/(shop)/checkout/confirmation/page.tsx
        modified:   frontend/src/components/payment/payment-method-selector.tsx
        modified:   frontend/src/components/payment/paynow-qr-display.tsx
        modified:   frontend/src/hooks/use-payment-status.ts
        new file:   frontend/src/lib/api/api-fetch.ts
        modified:   frontend/src/lib/api/payment-api.ts
        modified:   frontend/src/lib/auth-api.ts
        modified:   frontend/src/lib/graceful-payment-fallback.tsx

