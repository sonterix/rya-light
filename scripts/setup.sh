#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Light — Setup"
echo "================"
echo ""

read -r -p "Enter your OpenAI API key (press Enter to skip): " OPENAI_API_KEY
echo ""

echo "Starting Supabase..."
supabase start --workdir "$PROJECT_DIR"

echo ""
echo "Capturing Supabase credentials..."

SUPABASE_STATUS=$(supabase status --workdir "$PROJECT_DIR")

SUPABASE_URL=$(echo "$SUPABASE_STATUS" | grep "API URL" | awk '{print $NF}')
SUPABASE_ANON_KEY=$(echo "$SUPABASE_STATUS" | grep "anon key" | awk '{print $NF}')
SUPABASE_SERVICE_ROLE_KEY=$(echo "$SUPABASE_STATUS" | grep "service_role key" | awk '{print $NF}')
DB_PORT=$(echo "$SUPABASE_STATUS" | grep "DB URL" | grep -oP ':\K[0-9]+(?=/)')
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/postgres"

ENV_FILE="$PROJECT_DIR/.env.local"

cat > "$ENV_FILE" << EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
DATABASE_URL=${DATABASE_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF

echo "Written .env.local"
echo ""

echo "Running database reset (migrations + seed)..."
supabase db reset --workdir "$PROJECT_DIR"

echo ""
echo "Setup complete. Starting development server..."
echo ""

cd "$PROJECT_DIR" && npm run dev
