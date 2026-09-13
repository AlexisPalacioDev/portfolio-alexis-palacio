# Deploy (permanent, free)

Two pieces: the **web** (static, → Vercel) and the **signaling server**
(always-on WebSocket, → Render). Both have free tiers with no credit card.
TURN is already configured (free OpenRelay) in `packages/client/src/net/config.ts`.

## 0. Push to GitHub (prerequisite)

Vercel and Render deploy from a Git repo.

```bash
gh repo create extraction-survivors --private --source=. --push
# or: create a repo on github.com, then:
#   git remote add origin git@github.com:<you>/extraction-survivors.git
#   git push -u origin master
```

## 1. Signaling server → Render (do this FIRST, you need its URL)

1. Go to https://render.com → New → **Web Service** → connect the GitHub repo.
2. Settings:
   - **Root Directory**: `packages/signaling`
   - **Runtime**: Docker (it will use `packages/signaling/Dockerfile`)
   - **Instance type**: Free
3. Deploy. Render gives a URL like `https://your-signaling.onrender.com`.
4. Your signaling WebSocket URL is the same host with `wss://`:
   `wss://your-signaling.onrender.com`

> Free tier sleeps after ~15 min idle; the first connection then waits ~50s
> while it wakes. After that it's instant.

## 2. Web client → Vercel

1. Go to https://vercel.com → New Project → import the GitHub repo.
2. Settings:
   - **Root Directory**: `packages/client`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `pnpm build` &nbsp; **Output**: `dist`
   - **Environment Variable**: `VITE_SIGNALING_URL = wss://your-signaling.onrender.com`
3. Deploy. Vercel gives a permanent URL like `https://extraction-survivors.vercel.app`.

> If install fails on the monorepo, set the Install Command to
> `pnpm install` and ensure the project's Root Directory is `packages/client`
> (Vercel installs workspace deps from the repo root automatically).

## 3. Play

- **Host:** `https://extraction-survivors.vercel.app/?host&room=lobby`
- **Friends:** `https://extraction-survivors.vercel.app/?join&room=lobby`

No `?sig=` needed — the signaling URL is baked in via `VITE_SIGNALING_URL`.
Same `room` to share a game; change it for a private one.

## Updating later

Push to `master` → both Vercel and Render auto-redeploy. If you change
`VITE_SIGNALING_URL`, redeploy the Vercel project so the new value is baked in.
