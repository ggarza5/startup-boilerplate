#!/bin/bash

# Repair migration history table
echo "Repairing migration history table..."

# Mark the existing migrations in the remote database as applied
supabase migration repair --status applied 20240717231009
supabase migration repair --status applied 20250329000001
supabase migration repair --status applied 20250329000002

# Mark the missing migrations as reverted (they exist locally but not in remote)
supabase migration repair --status reverted 20240904230400
supabase migration repair --status reverted 20240904231041
supabase migration repair --status reverted 20240905150250
supabase migration repair --status reverted 20241010120000
supabase migration repair --status reverted 20241011120000
supabase migration repair --status reverted 20250112171911
supabase migration repair --status reverted 20250112191156

# Pull the current state
echo "Syncing with remote database..."
supabase db pull

echo "Migration history repair completed successfully." 