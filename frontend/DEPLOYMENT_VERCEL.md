# Deploy EverRise DEX frontend to Vercel

The app lives in this directory (`frontend/`). Production hosting uses [Vercel](https://vercel.com) (Next.js is supported out of the box).

## 1. Create the Vercel project

1. In the [Vercel dashboard](https://vercel.com/dashboard), **Add New** → **Project** and import this Git repository.
2. Under **Project Settings** → **General** → **Root Directory**, set **Root Directory** to `frontend` (this repo is a monorepo: programs and frontend share the same repo).
3. **Framework Preset** should be **Next.js** (auto-detected). Build command defaults to `next build` and output is handled by Vercel.
4. The `engines` field in `package.json` requires **Node 20+**; in **Settings** → **General** you can pin **Node.js Version** to 20.x if you want an explicit version.

`vercel.json` in this folder pins the framework to Next.js; no custom `start` command is used (unlike long-running `npm start` on Render).

## 2. Environment variables (parity with Render / production)

In **Settings** → **Environment Variables**, add every variable you use in production. Copy values from the Render service dashboard and from [`../environment-variables.md`](../environment-variables.md) (or from [`frontend/.env.example`](.env.example) as a checklist).

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | e.g. `mainnet-beta` |
| `NEXT_PUBLIC_RPC_URL` | Helius or other RPC; set in Vercel only, do not commit real keys to git |
| `NEXT_PUBLIC_PROGRAM_ID` | Program ID |
| `NEXT_PUBLIC_BONDING_CURVE_SEED` | e.g. `bonding_curve` |
| `NEXT_PUBLIC_EVER_MINT` / `NEXT_PUBLIC_USDC_MINT` | Mints |
| `NEXT_PUBLIC_TREASURY_WALLET` | Treasury wallet |
| `NEXT_PUBLIC_PROGRAM_EVER_ACCOUNT` / `NEXT_PUBLIC_PROGRAM_USDC_ACCOUNT` | Program token accounts |
| `NEXT_PUBLIC_TREASURY_USDC_ACCOUNT` | **Optional** but required for some Squad setups (see `contractService.ts`) |

`NEXT_PUBLIC_*` values are exposed to the browser; treat RPC URLs with API keys as non-secret only in the sense that they are still visible in client bundles—rotate keys if they leak.

`PORT` and `npm start` are **not** required on Vercel.

## 3. Validate a preview deploy

1. **Local build (same command Vercel runs):** from `frontend/`, `npm install` then `npm run build` should complete with exit code 0. Fix any build errors before relying on a remote deploy.
2. **Preview on Vercel:** after the Git repository is connected, open a pull request or push a branch; Vercel will create a **Preview** deployment.
3. Smoke test on the preview URL: connect a wallet, confirm `NEXT_PUBLIC_SOLANA_NETWORK` and RPC behavior, and run a read-only or small test transaction if appropriate. Production should set `NEXT_PUBLIC_RPC_URL` in Vercel (the app falls back to the public mainnet endpoint only if that variable is unset).

## 4. Custom domain and DNS cutover

1. In the Vercel project, **Settings** → **Domains** → add your production hostname (e.g. `app.example.com` or apex `example.com`).
2. Add the records Vercel shows (A/CNAME) at your DNS provider. Wait for propagation.
3. When the Vercel deployment is live and correct on the new domain, **decommission the Render.com web service** (or point DNS away from Render) so you do not run two production hosts. Revoke/rotate any Render-only secrets if applicable.

## 5. After migration

- Keep [`render.yaml`](../render.yaml) only if a team still uses it for a mirror/staging; otherwise you may remove or archive that service from Render to avoid duplicate deploys and billing.
