#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Extract a value from supabase status env output
# Usage: get_env_var "KEY_NAME" "$env_output"
get_env_var() {
  echo "$2" | grep "^${1}=" | head -1 | cut -d= -f2- | tr -d '"'
}

echo "Light — Setup"
echo "================"
echo ""

read -r -p "Enter your OpenAI API key (press Enter to skip): " OPENAI_API_KEY
echo ""

echo "Starting Supabase..."
supabase start --workdir "$PROJECT_DIR"

echo ""
echo "Capturing Supabase credentials..."

SUPABASE_ENV=$(supabase status --workdir "$PROJECT_DIR" -o env 2>&1)

SUPABASE_URL=$(get_env_var "API_URL" "$SUPABASE_ENV")
SUPABASE_ANON_KEY=$(get_env_var "ANON_KEY" "$SUPABASE_ENV")
SUPABASE_SERVICE_ROLE_KEY=$(get_env_var "SERVICE_ROLE_KEY" "$SUPABASE_ENV")
DATABASE_URL=$(get_env_var "DB_URL" "$SUPABASE_ENV")

# Validate that all required values were captured
MISSING=()
[ -z "$SUPABASE_URL" ] && MISSING+=("API_URL")
[ -z "$SUPABASE_ANON_KEY" ] && MISSING+=("ANON_KEY")
[ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && MISSING+=("SERVICE_ROLE_KEY")
[ -z "$DATABASE_URL" ] && MISSING+=("DB_URL")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Error: Failed to capture Supabase credentials: ${MISSING[*]}"
  echo "Run 'supabase status --workdir \"$PROJECT_DIR\" -o env' to debug."
  exit 1
fi

ENV_FILE="$PROJECT_DIR/.env.local"

cat > "$ENV_FILE" << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
DATABASE_URL=${DATABASE_URL}

# OpenAI
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
