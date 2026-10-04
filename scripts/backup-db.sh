#!/usr/bin/env bash
# Dumps the Supabase Postgres database to a timestamped .sql.gz file in
# ./backups. Requires NEXT_PUBLIC_SUPABASE_PROJECT_REF and
# SUPABASE_DB_PASSWORD to be set (e.g. via .env.local or CI secrets).
#
# Connects via Supabase's session pooler (not the direct db.<ref>.supabase.co
# host) — the direct host is IPv6-only on this project, which GitHub Actions
# runners can't route to ("Network is unreachable"). The pooler has an
# IPv4-reachable address. Session mode (not transaction mode / port 6543) is
# required here since pg_dump needs session-level state across statements.
set -euo pipefail

: "${NEXT_PUBLIC_SUPABASE_PROJECT_REF:?Set NEXT_PUBLIC_SUPABASE_PROJECT_REF}"
: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD}"

mkdir -p backups
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
out="backups/ecostorage-${timestamp}.sql.gz"

# Prefer the newest versioned pg_dump under /usr/lib/postgresql (the
# apt/PGDG install layout) over whatever bare `pg_dump` resolves to on
# PATH. On CI runners that already have an older postgresql-client
# pre-installed, installing a newer one alongside it doesn't reliably make
# PATH/update-alternatives pick the new one — pg_dump then refuses to dump
# a server newer than itself. Falls back to plain `pg_dump` where that
# directory doesn't exist (e.g. a developer's own machine).
pg_dump_bin=$(ls -1 /usr/lib/postgresql/*/bin/pg_dump 2>/dev/null | sort -V | tail -n1)
pg_dump_bin="${pg_dump_bin:-pg_dump}"

"$pg_dump_bin" \
  "postgresql://postgres.${NEXT_PUBLIC_SUPABASE_PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" \
  --no-owner --no-privileges | gzip > "$out"

echo "Wrote $out"
