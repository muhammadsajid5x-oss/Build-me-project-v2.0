# Supabase Functions

This directory contains Supabase Edge Functions.

Functions should contain backend logic that is appropriate for
the Supabase runtime.

Examples include:

- Secure server-side operations
- Webhooks
- External service integrations
- Background processing

Functions must not bypass the application's database and security rules
without an explicit architectural decision.

## Current Status

No Edge Functions are required by the current application requirements. Add a function only for an approved Supabase-specific backend need, using the Supabase CLI function layout and an explicit `[functions.<name>]` configuration entry when function-specific settings are needed.
