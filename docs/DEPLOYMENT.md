# Deployment

This is a standard Next.js app.

## Local preview

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Build

```bash
npm run build
```

## Run production server

```bash
npm run start
```

## Vercel (recommended for quick previews)

1. Import the GitHub repo in Vercel.
2. Keep defaults (Next.js detected automatically).
3. Deploy; Vercel will provide a **Preview URL** per deployment and a **Production URL** if you promote it.

Notes:
- This app can run without any environment variables.
- If you use webhooks/connectors, treat those endpoints and tokens as secrets and do not store them in browser `localStorage` for real users.

## Notes

- This demo stores secrets in browser localStorage. Do not use as-is for multi-user production.
- If you enable connectors, ensure your connector endpoints are protected and rate-limited.
