# `better-auth` Implementation

## Overview of Current Implementation

The current implementation contains placeholder/temporary code for authentication using the
better-auth library with magic link authentication. The backend has the necessary structure but lacks
full implementation of better-auth integration.

## Components Status

1. Auth Configuration (authConfig.ts):
   - Imports the required better-auth modules
   - Contains temporary placeholder functions for handleRequest and getSession
   - Has configuration for better-auth with JWT secret and frontend URL
   - Links to the user store and magic link email function
   - Status: Placeholder implementation, not fully integrated with better-auth
2. User Store (denoKvUserStore.ts):
   - Fully implemented with Deno KV for user storage
   - Has functions for finding, creating, and updating users
   - Stores users with unique IDs and maintains email-to-user mapping
   - Includes authId property for Neo4j linking
   - Status: Implementation complete
3. Auth Routes (authRoutes.ts):
   - Contains all four required endpoints:
     - POST /signin/magic-link for requesting magic links
     - GET /verify for verifying magic link tokens
     - GET /user for getting authenticated user data
     - POST /signout for signing out
   - Each route has basic validation and error handling
   - All routes use temporary implementations that return mock data
   - Status: Routes defined but using placeholder implementations
4. Magic Link Email (sendMagicLink.ts):
   - Implemented with Resend API for sending emails
   - Contains proper formatting for magic link emails
   - Includes error handling and logging
   - Status: Implementation complete
5. Auth Middleware (authMiddleware.ts):
   - Basic implementation that checks for authentication
   - Links to the Neo4j user data when needed
   - Status: Structure implemented but relies on auth.getSession which is a placeholder
6. Neo4j User Link (neo4jUserLink.ts):
   - Fully implemented middleware and utilities for Neo4j user management
   - Links auth users to Neo4j database using authId
   - Retrieves Neo4j user data including manager relationships
   - Status: Implementation complete
7. Route Registration (hubRoutes.ts):
   - Auth routes are properly registered
   - Status: Implementation complete

## Key Issues

1. **Better-Auth Integration:** The core better-auth functionality is not properly integrated. The current
auth object contains placeholder functions rather than the actual better-auth instance.
2. **Authentication Flow:** The magic link flow is not fully implemented; users can request magic links
but the verification and session establishment don't work properly.
3. **User Creation:** Neo4j user creation is implemented but not connected to the authentication flow.
4. **Session Management:** Session management is missing; cookies are manually deleted on signout but not
properly managed throughout the app.

## High-Level Implementation Plan

To complete the authentication implementation, the following major tasks need to be accomplished:

1. Properly initialize better-auth: Replace the placeholder auth object with a properly configured
better-auth instance.
2. Implement the Magic Link Flow: Connect the magic link request, verification, and session
establishment.
3. Integrate Neo4j User Management: Ensure new users are properly created in Neo4j when they
authenticate.
4. Implement Session Management: Use better-auth's session management for all authenticated routes.
5. Secure Routes with Middleware: Apply the auth middleware to routes that require authentication.

## Granular Task List

- [X] tdHi: create a blank PostgreSQL instance on Supabase
- [X] tdHi: connect to Supabase from within the Beacons server
- [X] tdHi: create kysely instance from Supabase instance
- [X] tdHi: specify kysely instance as `auth` database
- [ ] tdHi: grant Supabase admin permissions to `auth` object
- [ ] tdHi: run the `better-auth` Kysely schema generator and allow it to generate the correct tables

- [ ] tdHi: implement a `generateToken()` function
- [ ] tdHi: test `generateToken()` in isolation
- [ ] tdHi: integrate `generateToken()` with the `auth` object
- [ ] tdHi: test `generateToken()` from within `auth.api`

- [ ] tdHi: create test users directly in Supabase
- [ ] tdHi: test the `signin/magic-link` route on an existing user
- [ ] tdHi: make sure the `signin/magic-link` route handles new users
- [ ] tdHi: test the `signin/magic-link` route on a new user

- [ ] tdHi: implement the `verifyToken` method
- [ ] tdHi: test the `verifyToken` route

- [ ] tdHi: implement the getSession method
- [ ] tdHi: test the `getSession` route

- [ ] tdHi: implement the `signOut` method
- [ ] tdHi: test the `signOut` route

## Magic Link Authentication Flow

### Current Implementation

The authentication flow for magic links works as follows:

1. User requests a magic link from frontend by submitting their email to `/auth/magic-link` (not `/auth/signin/magic-link`)