# Netlify Deployment Guide

This guide walks you through deploying **Secure Face Vault** to Netlify.

## Prerequisites

- [Node.js 20+](https://nodejs.org/) installed
- [Netlify account](https://netlify.com) (free or paid)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed:
  ```bash
  npm install -g netlify-cli
  ```

## Environment Variables

Before deploying, ensure these environment variables are set in Netlify:

### Required Variables

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` — Your Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key (for server functions)

### Optional Variables

- `NODE_ENV` — Set to `production` (Netlify does this automatically)

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

**Easiest for continuous deployment:**

1. Push your repository to GitHub
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Click **"Connect to Git"** or **"New site from Git"**
4. Select **GitHub** and authorize Netlify
5. Choose your repository (`secure-face-vault`)
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Click **Deploy site**
7. Go to **Site settings > Build & deploy > Environment**
8. Add your environment variables (see above)
9. Trigger a new deploy from the **Deploy** tab

### Method 2: Netlify CLI (Manual Deploy)

**Best for local testing before committing:**

1. Install and authenticate:
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. Build locally:
   ```bash
   npm install
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

   Or use the npm script:
   ```bash
   npm run deploy:netlify
   ```

### Method 3: Direct Upload (Drag & Drop)

**Quick testing (no Git required):**

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to [drop.netlify.com](https://drop.netlify.com)
3. Drag your `dist` folder into the box
4. Your site is live! (temporary domain)

## Build Output

- **Input:** `src/` (TypeScript/TSX)
- **Output:** `dist/` (production-ready static files)
- **Build time:** ~30-60 seconds

## Redirects & Routing

The `netlify.toml` includes:
- **SPA fallback:** All routes redirect to `/index.html` for client-side routing
- **Functions directory:** `netlify/functions/` (for serverless functions if needed)

## Environment Variables Setup (GitHub Integration)

After connecting to GitHub:

1. Go to **Site settings > Build & deploy > Environment**
2. Click **Add environment variables**
3. Add each variable:
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY=eyJhb...`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhb...`
4. Save and trigger a new deploy

## Troubleshooting

### Build Fails
- Check build logs in Netlify deploy history
- Ensure Node version matches (v20.18.0+)
- Run `npm install` locally to verify dependencies work

### Site Shows Blank Page
- Check browser console for errors (F12 > Console)
- Verify Supabase environment variables are set
- Check Netlify function logs (if using server functions)

### CORS Issues
- Supabase should handle CORS automatically
- If issues persist, check Supabase project settings

## Local Testing Before Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Domain Setup

1. Go to **Site settings > Domain management**
2. Add custom domain or use Netlify's auto-generated subdomain
3. Configure DNS (follow Netlify's instructions)
4. SSL/HTTPS is automatic (free via Let's Encrypt)

## Continuous Deployment

Once GitHub is connected:
- Every push to `main` auto-deploys
- Deploy previews for pull requests (optional)
- Rollback to previous deploys anytime

## Next Steps

- **Monitor:** Check site performance in Netlify Analytics
- **Scale:** Netlify handles automatic scaling
- **Enhance:** Add Netlify Functions for backend logic if needed

**Questions?** Visit [docs.netlify.com](https://docs.netlify.com)
