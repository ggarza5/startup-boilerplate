#!/bin/bash

# Run Supabase migrations on cloud database
echo "Running Supabase migrations on cloud database..."

# Push migrations to the remote Supabase project
supabase db push

echo "Migrations completed successfully." 