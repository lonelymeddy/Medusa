# Deployment Guide: Render & Vercel

This application is engineered for zero-friction deployment to both **Vercel** and **Render**.

## 1. Deploying to Vercel

Vercel provides native hosting for Next.js App Router applications.

### Quick Steps:
1. Push your code to your GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Keep the default settings:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `GITHUB_TOKEN`: (Optional) Your GitHub Personal Access Token.
6. Click **Deploy**.

The bundled `vercel.json` is preconfigured:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

---

## 2. Deploying to Render

Render supports both Native Node.js web services and Docker containers.

### Method 1: Render Web Service via Blueprint (`render.yaml`)
1. In Render, select **Blueprints** and connect this repository.
2. Render will automatically detect `render.yaml`:
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Default Port: `10000`
3. Click **Apply**.

### Method 2: Render Docker Web Service
1. In Render, select **New Web Service** > **Docker**.
2. Render detects the root `Dockerfile`.
3. Set environment variable `PORT=3000`.
4. Render builds the multi-stage Alpine Docker image and launches the production standalone server.
