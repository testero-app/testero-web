# Deploy Frontend (Vercel)

## Ambiente

- **Piattaforma**: Vercel
- **Framework**: Next.js 16
- **Progetto**: `davide-fellas-projects/testero-web`
- **URL produzione**: https://testero-web.vercel.app

## Rilascio

Il deploy **non e' automatico** (progetto condiviso, richiede account a pagamento per auto-deploy).

Dopo aver pushato su `main`, eseguire manualmente:

```bash
cd testero-web
npx vercel --prod
```

## Flusso completo

```bash
# 1. Committa e pusha
git add .
git commit -m "feat: descrizione"
git push origin main

# 2. Deploya in produzione
npx vercel --prod
```

## Variabili d'ambiente (Vercel dashboard)

| Variabile | Descrizione |
|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend (es. `https://testero-be.onrender.com`) |

## Verifica deploy

- Inspect URL mostrato nell'output di `vercel --prod`
- Dashboard: https://vercel.com/davide-fellas-projects/testero-web
- Controlla che l'app carichi correttamente su https://testero-web.vercel.app

## Preview deploy (opzionale)

Per testare senza toccare la produzione:

```bash
npx vercel  # senza --prod, crea un URL di preview
```

## Rollback

Da Vercel dashboard: vai su Deployments, seleziona un deploy precedente e clicca "Promote to Production".
