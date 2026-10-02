# Authentication

## Purpose

This document defines how Build Me establishes a user's identity. Authentication answers **who is signed in**; authorization decides **what that user may do** and is specified separately.

## Current Identity Provider

Supabase Auth is the identity provider. The dashboard currently starts sign-in with Google OAuth through the Supabase JavaScript client. Supabase returns and maintains the user's session in the browser.

The browser configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`. The browser key must be a Supabase publishable/anon key; never place a service-role key in a `VITE_` variable or ship it to the browser. The API uses `SUPABASE_URL` and `SUPABASE_KEY` to call Supabase Auth. The API key must be configured as a server environment variable and must not be logged or returned to clients.

## How the System Identifies a User

1. The user signs in through Supabase Auth using Google OAuth.
2. The dashboard reads the Supabase session and obtains its access token.
3. The API client sends that token in the `Authorization: Bearer <token>` header.
4. The API extracts the bearer token and asks Supabase Auth to validate it with `auth.getUser(accessToken)`. The API does not trust a user ID, email, or decoded token claims supplied by the browser.
5. On successful validation, the API uses the Supabase Auth user's UUID as `request.user.id`; the email is included only when Supabase provides one. The API derives `request.user.isAdmin` only from the server-managed `app_metadata.role === "admin"` claim. Client-editable `user_metadata` is not used for authorization.
6. Missing, invalid, or unverifiable tokens are rejected with HTTP `401`.

The current identity endpoint is `GET /api/v1/auth/me`. Dashboard route protection improves navigation and user experience, but server-side API authentication remains the security boundary.

## Authentication Is Not Authorization

The API defines `authenticated` and `admin` permissions. Admin authorization requires the verified server-managed app metadata claim; a valid Supabase session alone is insufficient. A secure workflow for granting and revoking that claim is not yet configured, so no user is automatically an administrator.

The Drizzle `users` table is not currently linked to Supabase Auth: its UUID is generated independently and has no foreign key to `auth.users`. Do not assume `public.users.id` equals the Supabase Auth user ID. Before features need application profiles, ownership, or admin access, define and migrate an explicit identity mapping and an approved role/permission source.

Row-level security policies are also not defined yet. Do not expose tables through Supabase APIs or enable client table access until the ownership model and policies are designed and tested.

## Requirements Before Admin Features

Before implementing admin Child Stories, document and review:

- Which identity is eligible for admin access and who grants or revokes it.
- Where roles or permissions are stored and how they map to the Supabase Auth user UUID.
- Which API operations require each permission; enforce these checks on the server.
- Whether direct Supabase Data API access is needed and, if so, the matching RLS policies.
- Expected behavior for disabled/deleted users, expired sessions, and authorization failures.

Until those decisions are approved and implemented, admin authorization is **not available**.
