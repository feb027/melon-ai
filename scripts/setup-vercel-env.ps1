# MelonAI - Vercel Environment Variables Setup Script (PowerShell)
# This script helps you set up environment variables for Vercel deployment

Write-Host "🚀 MelonAI - Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed." -ForegroundColor Red
    Write-Host "📦 Install it with: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if project is linked
if (-not (Test-Path ".vercel")) {
    Write-Host "⚠️  Project is not linked to Vercel yet." -ForegroundColor Yellow
    Write-Host "🔗 Run 'vercel link' first to connect your project." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project is linked to Vercel" -ForegroundColor Green
Write-Host ""

# Function to add environment variable
function Add-EnvVar {
    param(
        [string]$Key,
        [string]$Description,
        [string]$Targets
    )
    
    Write-Host "📝 Setting up: $Key" -ForegroundColor Cyan
    Write-Host "   Description: $Description"
    Write-Host "   Targets: $Targets"
    
    $value = Read-Host "   Enter value (or press Enter to skip)"
    
    if ($value) {
        try {
            if ($Targets -eq "all") {
                $value | vercel env add $Key production preview development
            } elseif ($Targets -eq "prod-preview") {
                $value | vercel env add $Key production preview
            } else {
                $value | vercel env add $Key production
            }
            Write-Host "   ✅ Added successfully" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to add: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⏭️  Skipped" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "🔧 Supabase Configuration" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Add-EnvVar "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL" "all"
Add-EnvVar "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key" "all"
Add-EnvVar "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (sensitive)" "prod-preview"

Write-Host "🤖 AI Provider API Keys" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Add-EnvVar "GOOGLE_API_KEY" "Google Gemini API key (primary)" "prod-preview"
Add-EnvVar "OPENAI_API_KEY" "OpenAI GPT-4 Vision API key (secondary)" "prod-preview"
Add-EnvVar "ANTHROPIC_API_KEY" "Anthropic Claude API key (tertiary)" "prod-preview"

Write-Host "🌐 Application Configuration" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "📝 Setting up: NEXT_PUBLIC_APP_URL" -ForegroundColor Cyan
$prodUrl = Read-Host "   Enter production URL (e.g., https://melon-ai.vercel.app)"
if ($prodUrl) {
    try {
        $prodUrl | vercel env add "NEXT_PUBLIC_APP_URL" production
        Write-Host "   ✅ Added for production" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to add: $_" -ForegroundColor Red
    }
}

$previewUrl = Read-Host "   Enter preview URL pattern (e.g., https://melon-ai-git-*.vercel.app)"
if ($previewUrl) {
    try {
        $previewUrl | vercel env add "NEXT_PUBLIC_APP_URL" preview
        Write-Host "   ✅ Added for preview" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to add: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "✨ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Verify variables in Vercel Dashboard"
Write-Host "   2. Deploy with: vercel --prod"
Write-Host "   3. Test the deployment"
Write-Host ""
Write-Host "💡 Tip: You can also add Vercel KV from the dashboard:" -ForegroundColor Yellow
Write-Host "   Vercel Dashboard → Storage → Create KV Database"
Write-Host ""
