# Trailmate — landing + waiting list

Next.js 16 (App Router). Landing con modello 3D a scroll, waiting list su Postgres, pannello `/admin` protetto da password.

## Struttura

- `app/landing.tsx` — landing (client), modal waiting list
- `public/trailmate-engine.js` — engine 3D (custom element `<trailmate-3d>`), three.js in `public/vendor/`
- `app/api/waitlist/route.ts` — `POST { email }` → salva email (normalizzata lowercase, unica)
- `app/admin/*` — login, lista iscritti, export CSV, rimozione
- `proxy.ts` — blocca `/admin/*` senza sessione; le pagine ri-verificano lato server
- `lib/db.ts` — Postgres (`postgres.js`); la tabella `waitlist` viene creata da sola al primo uso

## Variabili d'ambiente

Vedi `.env.example`:

| Nome | Cosa |
|---|---|
| `DATABASE_URL` | connection string Postgres |
| `ADMIN_PASSWORD` | password per entrare in `/admin` |
| `SESSION_SECRET` | stringa random ≥ 32 caratteri (`openssl rand -base64 32`) |

## Locale

```bash
cp .env.example .env.local   # e compila i valori
npm install
npm run dev
```

## Deploy su Vercel

1. Push del repo su GitHub → **Add New Project** su Vercel e importalo.
2. Nel progetto: **Storage → Create → Neon (Postgres)** e collegalo: imposta `DATABASE_URL` in automatico.
3. **Settings → Environment Variables**: aggiungi `ADMIN_PASSWORD` e `SESSION_SECRET`.
4. Redeploy. Il sito è su `/`, il pannello su `/admin`.
