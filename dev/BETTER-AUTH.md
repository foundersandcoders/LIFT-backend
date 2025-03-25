# Current State of Authentication Implementation

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

### 1. Basic Auth Configuration

Task 1.1: Implement proper better-auth initialization

- Update authConfig.ts to properly initialize better-auth
- Verify imports are correct
- Create proper configuration based on BETTER-AUTH.md
- Test with console logs to verify initialization
- Verification: Run the server and check console for successful initialization without errors

Task 1.2: Create a test route for auth configuration

- Create a simple test endpoint at /auth/test
- Log the auth configuration
- Return basic configuration details (without secrets)
- Verification: Use Postman to call GET /auth/test and verify response contains expected configuration

### 2. Magic Link Request Implementation

Task 2.1: Update magic link request route

- Modify /auth/magic-link to use better-auth's magic link function
- Update input validation using zod
- Add detailed console logging
- Verification: Use Postman to send a request to POST /auth/magic-link with an email and verify
console logs show the request being processed

Task 2.2: Test email sending

- Complete the integration with sendMagicLinkEmail function
- Add test environment flag to prevent actual emails in development
- Log the generated magic link URL for testing
- Verification: Send a magic link request and check console logs for the magic link URL

### 3. Token Verification Implementation

Task 3.1: Update token verification route

- Modify /auth/verify to use better-auth's token verification
- Update response format to match API specification
- Add detailed logging
- Verification: Use the magic link URL from Task 2.2 in a browser and verify the token verification
works

Task 3.2: Implement session creation

- Update the verification route to establish a session
- Add proper cookie handling
- Log session details
- Verification: After verification, check for session cookie in browser, and use the browser's
developer tools to verify it's set correctly

### 4. User Management

Task 4.1: Update user retrieval route

- Modify /auth/user to use better-auth's session retrieval
- Get user data from both auth store and Neo4j
- Combine and return complete user data
- Verification: After login, use Postman to call GET /auth/user and verify it returns the expected
user data

Task 4.2: Implement Neo4j user linking

- Update the neo4jUserLinkMiddleware to be used after successful authentication
- Apply the middleware to relevant routes
- Log Neo4j user creation/update events
- Verification: After a new user signs in, check the Neo4j database to verify the user was created
with the correct authId

### 5. Session Management

Task 5.1: Update signout route

- Modify /auth/signout to use better-auth's signout function
- Add proper session cleanup
- Verification: Sign out and verify the session cookie is removed, then try to access /auth/user and
verify it returns 401

Task 5.2: Implement auth middleware for protected routes

- Apply the authMiddleware to routes that require authentication
- Update the middleware to use better-auth's session validation
- Verification: Try to access a protected route without authentication and verify it returns 401, then
try with authentication and verify it works

### 6. Frontend Integration

Task 6.1: Test the complete authentication flow

- Create a simple test script or use Postman collection
- Test the complete flow from magic link request to authenticated API calls
- Verification: Complete the full flow and verify each step works as expected

Task 6.2: Update CORS and cookie settings

- Configure CORS to work with the frontend
- Ensure cookies are properly set for cross-domain usage if needed
- Verification: Test authentication flow from the actual frontend application

### 7. Security and Error Handling

Task 7.1: Enhance error handling

- Add more specific error messages for different error scenarios
- Ensure secrets are not exposed in error messages
- Verification: Trigger various error conditions and verify appropriate errors are returned

Task 7.2: Add rate limiting for auth endpoints

- Implement basic rate limiting for auth endpoints to prevent abuse
- Verification: Make rapid requests to auth endpoints and verify rate limiting is applied

### 8. Testing and Documentation

Task 8.1: Update tests

- Update or create tests for authentication components
- Ensure mocks are used for external dependencies
- Verification: Run tests using deno test and verify they pass

Task 8.2: Update documentation

- Update ENDPOINTS.md with final API details
- Document any configuration requirements
- Verification: Review documentation for completeness and accuracy

Each task builds incrementally on the previous tasks and focuses on making small, verifiable changes.
The verification steps provide clear ways to test each change as it's made.

## Magic Link Authentication Flow

### Current Implementation

The authentication flow for magic links works as follows:

1. User requests a magic link from frontend by submitting their email to `/auth/magic-link` (not `/auth/signin/magic-link`)