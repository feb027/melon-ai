#!/bin/bash

# MelonAI - Vercel Environment Variables Setup Script
# This script helps you set up environment variables for Vercel deployment

set -e

echo "🚀 MelonAI - Vercel Environment Variables Setup"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "⚠️  Project is not linked to Vercel yet."
    echo "🔗 Run 'vercel link' first to connect your project."
    exit 1
fi

echo "✅ Project is linked to Vercel"
echo ""

# Function to add environment variable
add_env_var() {
    local key=$1
    local description=$2
    local targets=$3
    
    echo "📝 Setting up: $key"
    echo "   Description: $description"
    echo "   Targets: $targets"
    
    read -p "   Enter value (or press Enter to skip): " value
    
    if [ -n "$value" ]; then
        if [ "$targets" == "all" ]; then
            vercel env add "$key" production preview development <<< "$value"
        elif [ "$targets" == "prod-preview" ]; then
            vercel env add "$key" production preview <<< "$value"
        else
            vercel env add "$key" production <<< "$value"
        fi
        echo "   ✅ Added successfully"
    else
        echo "   ⏭️  Skipped"
    fi
    echo ""
}

echo "🔧 Supabase Configuration"
echo "=========================="
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL" "all"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key" "all"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (sensitive)" "prod-preview"

echo "🤖 AI Provider API Keys"
echo "======================="
add_env_var "GOOGLE_API_KEY" "Google Gemini API key (primary)" "prod-preview"
add_env_var "OPENAI_API_KEY" "OpenAI GPT-4 Vision API key (secondary)" "prod-preview"
add_env_var "ANTHROPIC_API_KEY" "Anthropic Claude API key (tertiary)" "prod-preview"

echo "🌐 Application Configuration"
echo "============================="
echo "📝 Setting up: NEXT_PUBLIC_APP_URL"
read -p "   Enter production URL (e.g., https://melon-ai.vercel.app): " prod_url
if [ -n "$prod_url" ]; then
    vercel env add "NEXT_PUBLIC_APP_URL" production <<< "$prod_url"
    echo "   ✅ Added for production"
fi

read -p "   Enter preview URL pattern (e.g., https://melon-ai-git-*.vercel.app): " preview_url
if [ -n "$preview_url" ]; then
    vercel env add "NEXT_PUBLIC_APP_URL" preview <<< "$preview_url"
    echo "   ✅ Added for preview"
fi
echo ""

echo "✨ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify variables in Vercel Dashboard"
echo "   2. Deploy with: vercel --prod"
echo "   3. Test the deployment"
echo ""
echo "💡 Tip: You can also add Vercel KV from the dashboard:"
echo "   Vercel Dashboard → Storage → Create KV Database"
echo ""
