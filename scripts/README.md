# MelonAI Deployment Scripts

This directory contains scripts to help with deploying MelonAI to Vercel.

## Available Scripts

### 1. `setup-vercel-env.sh` (Linux/macOS)

Bash script to interactively set up environment variables in Vercel.

**Usage:**
```bash
# Make script executable
chmod +x scripts/setup-vercel-env.sh

# Run the script
./scripts/setup-vercel-env.sh
```

**Prerequisites:**
- Vercel CLI installed: `npm i -g vercel`
- Project linked to Vercel: `vercel link`

### 2. `setup-vercel-env.ps1` (Windows)

PowerShell script to interactively set up environment variables in Vercel.

**Usage:**
```powershell
# Run the script
.\scripts\setup-vercel-env.ps1
```

**Prerequisites:**
- Vercel CLI installed: `npm i -g vercel`
- Project linked to Vercel: `vercel link`

## Environment Variables

The scripts will help you configure the following environment variables:

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (sensitive)

### AI Provider API Keys
- `GOOGLE_API_KEY` - Google Gemini API key (primary)
- `OPENAI_API_KEY` - OpenAI GPT-4 Vision API key (secondary)
- `ANTHROPIC_API_KEY` - Anthropic Claude API key (tertiary)

### Application Configuration
- `NEXT_PUBLIC_APP_URL` - Your application URL

## Manual Setup

If you prefer to set up environment variables manually:

### Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with appropriate targets (Production, Preview, Development)

### Via Vercel CLI
```bash
# Add a single environment variable
vercel env add VARIABLE_NAME

# Pull environment variables to local
vercel env pull

# List all environment variables
vercel env ls
```

## Deployment Workflow

1. **Link Project** (one-time setup)
   ```bash
   vercel link
   ```

2. **Set Up Environment Variables**
   ```bash
   # Using script (recommended)
   ./scripts/setup-vercel-env.sh
   
   # Or manually via CLI
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Deploy Preview**
   ```bash
   # Automatic on PR creation
   # Or manually:
   vercel
   ```

## Troubleshooting

### Script Permission Denied (Linux/macOS)
```bash
chmod +x scripts/setup-vercel-env.sh
```

### PowerShell Execution Policy (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Vercel CLI Not Found
```bash
npm i -g vercel
```

### Project Not Linked
```bash
vercel link
```

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Deployment Guide](../DEPLOYMENT.md)
