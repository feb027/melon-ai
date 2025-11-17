# MelonAI Deployment Guide

This guide provides step-by-step instructions for deploying MelonAI to Vercel with proper environment configuration.

## Prerequisites

- GitHub repository: `https://github.com/feb027/melon-ai.git`
- Vercel account connected to GitHub
- Supabase project configured
- AI API keys (Gemini, OpenAI, Anthropic)

## Deployment Steps

### 1. Connect GitHub Repository to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `feb027/melon-ai`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `melon-ai`
   - **Build Command**: `bun run build` (or leave default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `bun install`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project directory
cd melon-ai

# Link project to Vercel
vercel link

# Deploy to production
vercel --prod
```

### 2. Configure Environment Variables

Add the following environment variables in Vercel Dashboard:
**Project Settings → Environment Variables**

#### Supabase Configuration

| Variable | Value | Target |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview |

**How to get Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy URL and keys

#### AI Provider API Keys

| Variable | Value | Target |
|----------|-------|--------|
| `GOOGLE_API_KEY` | Your Google Gemini API key | Production, Preview |
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Production, Preview |

**How to get AI API keys:**
- **Google Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: [Anthropic Console](https://console.anthropic.com/)

#### Vercel KV (Optional - for caching)

| Variable | Value | Target |
|----------|-------|--------|
| `KV_URL` | Auto-configured by Vercel | Production, Preview |
| `KV_REST_API_URL` | Auto-configured by Vercel | Production, Preview |
| `KV_REST_API_TOKEN` | Auto-configured by Vercel | Production, Preview |
| `KV_REST_API_READ_ONLY_TOKEN` | Auto-configured by Vercel | Production, Preview |

**To add Vercel KV:**
1. Go to Vercel Dashboard → Storage
2. Create KV Database
3. Connect to your project
4. Environment variables will be auto-configured

#### Application Configuration

| Variable | Value | Target |
|----------|-------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-preview.vercel.app` | Preview |
| `NODE_ENV` | `production` | Production |

### 3. Configure Production and Preview Deployments

#### Production Deployment
- **Branch**: `main`
- **Domain**: Custom domain or `your-app.vercel.app`
- **Auto-deploy**: Enabled (deploys on push to main)

#### Preview Deployments
- **Branches**: All branches except `main`
- **Pull Requests**: Automatic preview deployment for each PR
- **Domain**: `your-app-git-branch-name.vercel.app`

**Configure in Vercel Dashboard:**
1. Go to Project Settings → Git
2. Enable "Automatic Deployments from Git"
3. Set Production Branch to `main`
4. Enable "Preview Deployments" for all branches

### 4. Test Preview Deployment

Create a test pull request to verify preview deployments:

```bash
# Create a new branch
git checkout -b test/preview-deployment

# Make a small change (e.g., update README)
echo "\n## Deployment Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify preview deployment"
git push origin test/preview-deployment

# Create PR via GitHub CLI or web interface
gh pr create --title "Test: Preview Deployment" --body "Testing Vercel preview deployment"
```

Vercel will automatically:
1. Detect the new PR
2. Build and deploy a preview
3. Comment on the PR with the preview URL
4. Run checks and report status

### 5. Verify Deployment

#### Check Production Deployment
1. Visit your production URL
2. Test camera capture functionality
3. Test AI analysis (ensure API keys work)
4. Test offline mode (PWA)
5. Check analytics dashboard

#### Check Preview Deployment
1. Open the PR preview URL
2. Verify changes are reflected
3. Test core functionality
4. Check build logs for errors

### 6. Monitor Deployment

#### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Analytics**: Monitor performance metrics
- **Logs**: View runtime logs and errors
- **Functions**: Monitor serverless function execution

#### Useful Commands

```bash
# View deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# Pull environment variables to local
vercel env pull

# Add environment variable via CLI
vercel env add <KEY>
```

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"
**Solution**: Ensure all dependencies are in `package.json` and run `bun install`

**Issue**: TypeScript errors during build
**Solution**: Run `bun run build` locally first to catch errors

### Environment Variable Issues

**Issue**: API calls fail with 401/403
**Solution**: Verify API keys are correctly set in Vercel dashboard

**Issue**: Supabase connection fails
**Solution**: Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Runtime Errors

**Issue**: 500 Internal Server Error
**Solution**: Check Vercel function logs for detailed error messages

**Issue**: AI analysis fails
**Solution**: Verify AI provider API keys and check rate limits

## Post-Deployment Checklist

- [ ] Production deployment successful
- [ ] Preview deployments working
- [ ] All environment variables configured
- [ ] Camera capture works on mobile
- [ ] AI analysis returns results
- [ ] Offline mode functions correctly
- [ ] Analytics dashboard loads
- [ ] PWA installable on mobile
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up

## Continuous Deployment Workflow

```
Developer → Push to branch → GitHub
                              ↓
                         Vercel detects push
                              ↓
                    Builds and deploys preview
                              ↓
                    PR review and approval
                              ↓
                    Merge to main branch
                              ↓
                    Production deployment
```

## Security Best Practices

1. **Never commit secrets**: Use `.env.local` for local development
2. **Use encrypted variables**: Mark sensitive keys as "Encrypted" in Vercel
3. **Limit API key permissions**: Use read-only keys where possible
4. **Enable Vercel Authentication**: Protect preview deployments if needed
5. **Monitor usage**: Set up alerts for unusual API usage

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Last Updated**: 2025-01-17
**Project**: MelonAI
**Repository**: https://github.com/feb027/melon-ai
