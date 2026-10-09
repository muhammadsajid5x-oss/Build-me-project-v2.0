# Supabase Policies

This directory contains database access policies for Supabase.

Policies should be:

- Explicit
- Version controlled
- Reviewed before deployment
- Aligned with the database schema
- Applied through controlled database changes

Do not make uncontrolled production policy changes through the Supabase dashboard.

## Current Status

No row-level security policies are defined yet. The current application schema has no Supabase Auth user ownership mapping or approved client access rules, so enabling RLS or adding permissive policies now would be guesswork. When those requirements exist, define and test policies in a version-controlled SQL migration.
