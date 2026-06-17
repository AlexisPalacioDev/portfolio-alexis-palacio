# SEO & Discoverability Guide — Alexis Palacio Portfolio

The site's **technical SEO is already A+** (JSON-LD Person schema, meta, OG/Twitter,
sitemap, fast static build). What ranking actually depends on now is **off-site**
work that only you can do. This is the playbook.

---

## 0. The reality (read this first)

- A brand-new 1-page portfolio **will not rank #1 for generic terms** like
  `desarrollador full stack` or `programador remoto`. Those are owned by LinkedIn,
  Computrabajo, Indeed and agencies with 15 years of authority. Nobody's portfolio
  ranks there — not even senior devs'.
- **Recruiters don't find devs by Googling generic terms.** They use LinkedIn /
  GitHub search, job platforms, and referrals. When they *do* have your name (from
  a CV/application), they Google **you** → land on the portfolio. That's the win:
  **the portfolio converts; LinkedIn/GitHub discover.**
- What you *can* win: **your name** (already #1) and **long-tail** queries like
  `desarrollador full stack remoto Colombia`, `Next.js freelance Medellín`,
  `AI orchestration developer remote`.

---

## 1. Backlinks — the #1 lever (do these first)

Every link from another site to your portfolio raises its authority. Free, high-value
places to drop your domain:

- [ ] **GitHub profile** → website field + pin it in your README profile.
- [ ] **LinkedIn** → Contact info → Website (labeled "Portfolio").
- [ ] **Project READMEs** (anai, apptreeking, sticker-drops, todo) → "Built by [Alexis Palacio](https://YOURDOMAIN)".
- [ ] **dev.to / Hashnode / Medium** → create a profile, link the portfolio in bio. Even better: write 1–2 short posts (e.g. "How I built a browser-native video editor at anai") linking back.
- [ ] **X/Twitter, Bluesky** → bio link.
- [ ] **Peerlist / Polywork / Wellfound (AngelList)** → dev profiles that link out and rank well.
- [ ] **Stack Overflow** profile → website link.
- [ ] **Reddit** (r/colombia_devs, r/webdev "showoff" threads) → share the portfolio.
- [ ] **Comments / answers** on dev forums with your link in signature/profile.

> Consistency matters: use the **exact same name + city** everywhere
> ("Alexis Palacio", "Medellín, Colombia"). Google cross-references this (it's why
> the JSON-LD has your address + sameAs links).

---

## 2. LinkedIn — where recruiters actually search

LinkedIn has its own search engine. Optimize for *their* keywords:

- [ ] **Headline**: pack the terms recruiters filter by →
      `Freelance Full-Stack Developer · AI Engineer · Next.js / React / NestJS · Remote`
- [ ] **About**: first 2 lines should say "freelance full-stack developer, available
      for remote work" + your stack. LinkedIn weighs the About heavily.
- [ ] **Open to work** badge → set roles (Full-Stack, Frontend) + **Remote** + location.
- [ ] **Skills**: add Next.js, React, TypeScript, NestJS, Node.js, AI/LLM, etc.
      (recruiters filter by skills — the more relevant skills endorsed, the more you surface).
- [ ] **Featured** section → pin the portfolio link + best projects.

## 3. GitHub — the other discovery engine

- [ ] **Profile README** (the `AlexisPalacioDev/AlexisPalacioDev` repo) → who you are,
      stack, "available for freelance / remote", portfolio link.
- [ ] **Bio + Location** ("Medellín, Colombia") + **website** field = portfolio.
- [ ] **Pin** your strongest repos; give them clear descriptions + topics
      (`nextjs`, `react`, `ai`, `typescript`) so they surface in GitHub topic search.
- [ ] Keep the contribution graph active — recruiters read it as a signal.

---

## 4. After you deploy (do immediately)

- [ ] Set the real domain in **`src/layouts/BaseLayout.astro`** (`SITE` const) and
      **`astro.config.ts`** (`site`). Rebuild.
- [ ] **Google Search Console** (search.google.com/search-console): add the property,
      verify, submit `https://YOURDOMAIN/sitemap-index.xml`. This tells Google to index now.
- [ ] **Bing Webmaster Tools** → same (Bing still weighs the keywords meta we added).
- [ ] Request indexing of the homepage in Search Console.
- [ ] (Optional) **Google Business / a personal Google profile** isn't needed, but a
      consistent name across the web is.

---

## 5. Keywords we're targeting (already in the copy + meta)

Realistic long-tail you can win with backlinks + time:

- `Alexis Palacio` (developer / desarrollador) — **already #1 territory**
- `freelance full-stack developer remote`
- `desarrollador full stack remoto Colombia`
- `Next.js freelance developer Medellín`
- `AI orchestration / LLM agents developer remote`
- `programador full stack remoto`

These phrases now appear in the **visible content** (hero status, services, about) in
EN + ES — which is what Google actually ranks (the `keywords` meta tag is a minor/Bing
signal; visible text + backlinks are what move rankings).

---

## TL;DR

1. **Backlinks** (GitHub, LinkedIn, dev.to, project READMEs) — biggest lever.
2. **Optimize LinkedIn + GitHub** — that's where recruiters discover you.
3. **Deploy + Search Console + sitemap** — so Google indexes.
4. The portfolio's job is to **convert** once they find your name. It already does that.
