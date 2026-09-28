#!/usr/bin/env bash
# Dumps the Supabase Postgres database to a timestamped .sql.gz file in
# ./backups. Requires NEXT_PUBLIC_SUPABASE_PROJECT_REF and
# SUPABASE_DB_PASSWORD to be set (e.g. via .env.local or CI secrets).
set -euo pipefail

: "${NEXT_PUBLIC_SUPABASE_PROJECT_REF:?Set NEXT_PUBLIC_SUPABASE_PROJECT_REF}"
: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD}"

mkdir -p backups
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
out="backups/ecostorage-${timestamp}.sql.gz"

pg_dump \
  "postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co:5432/postgres" \
  --no-owner --no-privileges | gzip > "$out"

echo "Wrote $out"
