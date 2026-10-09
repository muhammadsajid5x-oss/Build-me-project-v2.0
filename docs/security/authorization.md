# Authorization

## Purpose

This document defines what an authenticated Build Me user is currently allowed to do and what must be decided before admin capabilities are implemented. Authentication establishes identity; authorization grants access to specific actions and data.

## Current Policy

Authorization is deny-by-default. A valid Supabase session does not make a user an administrator or grant access to every resource.

| Request condition                                                  | Result             |
| ------------------------------------------------------------------ | ------------------ |
| No valid authenticated user                                        | `401 Unauthorized` |
| Route requires `authenticated` and the user is verified            | Allow that route   |
| Route requires `admin` and verified `app_metadata.role` is `admin` | Allow that route   |
| Route requires an unsupported permission                           | `403 Forbidden`    |

The API defines `authenticated` and `admin` permissions. `GET /api/v1/auth/me` uses `authenticated` to return the verified Supabase Auth identity. The dashboard's protected route checks the admin claim for navigation, and the API must enforce the same permission on every admin operation; the client check is not a security boundary.

## Current Limits

- Admin authorization is implemented as a gate, but no user is an admin by default and no secure role-grant/revocation workflow is configured.
- The application `users` table is not linked to Supabase Auth identities, so it cannot currently serve as a trusted role or ownership source.
- Supabase Row Level Security policies are not defined. Do not expose application tables through direct client access until the ownership model and matching policies are approved and tested.
- Do not grant privileges based on client-supplied roles, user IDs, or email addresses.

## Before Admin Child Stories

Product and Technology must define and approve an authorization matrix before implementation. At minimum, record:

- Roles and permissions, including who may grant and revoke admin access.
- Which actions and records each role may read, create, update, and delete.
- How each application user maps to a Supabase Auth UUID and how record ownership is represented.
- Which checks are enforced by API middleware and which are enforced by database RLS.
- The expected behavior for users without a role, revoked access, and cross-user resource requests.

Until that matrix and its enforcement are implemented and tested, admin and owner-specific operations are **not available**. The dashboard is visible only to a verified identity carrying the server-managed admin claim. New protected operations must explicitly declare a permission and default to denial when the user or permission cannot be verified.
