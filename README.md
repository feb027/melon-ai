This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Quick Deployment

The easiest way to deploy MelonAI is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. **Import Repository**: Connect your GitHub repository to Vercel
2. **Configure Environment Variables**: Add required environment variables (see below)
3. **Deploy**: Vercel will automatically build and deploy your application

### Environment Variables

Before deploying, configure these environment variables in Vercel Dashboard:

**Supabase Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**AI Provider API Keys:**
- `GOOGLE_API_KEY` (Gemini - Primary)
- `OPENAI_API_KEY` (GPT-4 Vision - Secondary)
- `ANTHROPIC_API_KEY` (Claude - Tertiary)

**Application Configuration:**
- `NEXT_PUBLIC_APP_URL`

### Automated Setup

Use our deployment scripts to configure environment variables:

```bash
# Linux/macOS
./scripts/setup-vercel-env.sh

# Windows PowerShell
.\scripts\setup-vercel-env.ps1
```

### Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy to production
vercel --prod
```

### Detailed Deployment Guide

For comprehensive deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
