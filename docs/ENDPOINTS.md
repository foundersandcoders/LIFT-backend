# Endpoints

- [1. Table of Routes](#1-table-of-routes)
- [2. Routes by Category](#2-routes-by-category)
  - [2A. Overview](#2a-overview)
  - [2B. `"/edit/*"`](#2b-edit)
    - [2B1. `POST "/edit/editBeacon"`](#2b1-post-editeditbeacon)
    - [2B2. `DELETE "/edit/deleteBeacon"`](#2b2-delete-editdeletebeacon)
    - [2B3. `PUT "/edit/editManager"`](#2b3-put-editeditmanager)
  - [2C. `"/find/*"`](#2c-find)
    - [2C1. `POST "/find/user"`](#2c1-post-finduser)
  - [2X. `"/get/*"`](#2x-get)
    - [2X1. `GET "/get/n"`](#2x1-get-getn)
    - [2X2. `GET "/get/v"`](#2x2-get-getv)
  - [2D. `/write/*`](#2d-write)
    - [2D1. `POST "/write/newBeacon"`](#2d1-post-writenewbeacon)
    - [2D2. `POST "/write/newUser"`](#2d2-post-writenewuser)
  - [2E. `/auth/*`](#2e-auth)
    - [2E1. `POST "/auth/signin/magic-link"`](#2e1-post-authsigninmagic-link)
    - [2E2. `GET "/auth/verify?token={token}"`](#2e2-get-authverifytokentoken)
    - [2E3. `GET "/auth/user"`](#2e3-get-authuser)
    - [2E4. `POST "/auth/signout"`](#2e4-post-authsignout)
  - [2F. `/send/*`](#2f-send)
    - [2F1. `POST "/send/ping"`](#2f1-post-sendping)
- [3. Alex's Notes on Auth](#3-alexs-notes-on-auth)

---

## 1. Table of Routes

| Level | Name    | Meaning                                             |
| ----- | ------- | --------------------------------------------------- |
| 0     | Blocked | Cannot start until auth is implemented              |
| 1     | Ghost   | Not started/doesn't exist                           |
| 2     | Shell   | Exists but has no functionality                     |
| 3     | Janky   | Mostly works needs tweaking                         |
| 4     | Murky   | Functioning but response needs work                 |
| 5     | Safe    | All good                                            |
| X     | Zombie  | Works but will be deleted - doesn't respect privacy |

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 5      | GET    | `/`                       | List all endpoints                  |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 2      | POST   | `/edit/editBeacon`        | Edit an existing Beacon             |
| 1      | PUT    | `/edit/editAction`        | Edit an action                      |
| 2      | DELETE | `/edit/deleteBeacon`      | Delete an existing Beacon           |
| 2      | DELETE | `/edit/deleteAction`      | Delete an existing Action           |
| 1      | PUT    | `/edit/editUser`          | Edit a user                         |
| 2      | POST   | `/edit/editManager`       | Edit a user's manager               |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/find/userBeacons`       | Find all Beacons for a User         |
| X      | GET    | `/find/subject/:subject`  | Get all Beacons for a named Subject |
| X      | GET    | `/find/object/:object`    | Get all Beacons for a named Object  |
| X      | GET    | `/find/verb/:verb`        | Get all Beacons for a named Verb    |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 5      | GET    | `/get/n`                  | Get all nodes of a certain type     |
| X      | GET    | `/get/v`                  | Get all verbs of a certain type     |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/write/newBeacon`        | Create a new Beacon                 |
| 1      | POST   | `/write/createUser`       | Create a new user                   |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/send/ping`              | Send an email to a manager          |
| X      | GET    | `/send/test`              | Send a test email                   |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 1      | POST   | `/auth/signin/magic-link` | Request a magic link                |
| 1      | GET    | `/auth/verify`            | Verify a magic link                 |
| 1      | GET    | `/auth/user`              | Get the current user                |
| 1      | POST   | `/auth/signout`           | Sign out the current user           |

---

## 2. Routes by Category

### 2A. Overview

These are the request formats for the endpoints that either (a) are working or (b) aren't quite working but have a very defined schema. Where I know the response format, I've included it.

Some of these will need to be updated to include the session token.

- [ ] tdWait: Update endpoints to allow receipt of auth token
- [ ] tdMd: Change the assignation of verb from `[ v:${verb.toUpperCase()} ]` to `[v:VERB { name:${verb} }]`
- [ ] tdHi: Add the blocked tasks from Notion to this file

### 2B. `"/edit/*"`

#### 2B1. `POST "/edit/editBeacon"`

```jsonc
  { // Request
    "userId"?: 1, // number (authentication ID)
    "userName"?: "Jason" // string
  }
```

#### 2B2. `DELETE "/edit/deleteBeacon"`

```jsonc
  { // Request
    "userId": 1, // number (authentication ID)
    "beaconId": 1 // number
  }
```

#### 2B3. `PUT "/edit/editManager"`

- [ ] tdWait: Edit the managerEmail on the user node

```jsonc
  { // Request
    "userId": 1, // number (authentication ID)
    "newName"?: "Bill Poopsmith", // string
    "newEmail": "bill@poopsmith.com" // string
  }
```

### 2C. `"/find/*"`

#### 2C1. `POST "/find/user"`

This is the endpoint you should call to get the list of entries to show on the user's screen.

It's a `POST` endpoint because it's designed to take a JSON body.

```jsonc
{ // Request
  "name"?: "Jason", // string
  "id"?: 1, // number
  "publicOnly"?: true // boolean
}
```

##### 2C1A. `publicOnly`

- `publicOnly` is optional and defaults to `true`
- this is because the email builder uses some of the same functions
- I made sure the default option doesn't expose any private statements.

##### 2C1B. `id` and `name`

> By default, this is designed to take an `id` parameter. However, it's got an internal switch that allows it to take a `name` parameter instead.

- If you pass both, or just the `id`...
  - it will use the `id` parameter and call `findUserById(id, publicOnly)`.
- If you only pass the `name`...
  - it will use the `name` parameter and call `findUserByName(name, publicOnly)`.
- If you pass neither...
  - it will return an error.

### 2X. `"/get/*"`

#### 2X1. `GET "/get/n"`

#### 2X2. `GET "/get/v"`

- [ ] tdMd: Retrieve `verb.input` instead of `typeOf(verb)`

### 2D. `/write/*`

#### 2D1. `POST "/write/newBeacon"`

- [ ] tdHi: Correctly assign nested props to `beacon`
- [ ] tdMd: Use `authID` for matching subject node
- [ ] tdMd: Call `breaker(match.atoms)` instead of `breaker(match)` so that they are identical
- [ ] tdLo: Move term extraction from `breaker(match)` to a subfunction
- [ ] tdWait: Return `ember.dbId` to the frontend when creating new statements
- [ ] tdIdea: enforce the noun tag on `match.atoms.subject`

This needs editing - I wrote it a few days ago, and at that point we were going to be passing userId from the client rather than generating it in the server.

Here's the current request format...

```jsonc
  { // Current Request
    "userId": 1, // number
    "userName": "Jason", // string
    "managerName": "Bill Poopsmith", // string
    "managerEmail": "bill@poopsmith.com" // string
  }
  
  { // 200 Response
    "success": true // boolean
  }

  { // 400 Response
    "error": "Missing required parameters"
  }
```

And here's the format I'll need to change it to...

```jsonc
  { // New Request
    "userId": 1, // number
    "managerName"?: "Bill Poopsmith", // string
  }
  
  { // 200 Response
    "success": true // boolean
  }

  { // 400 Response
    "error": "Missing required parameters"
  }
```

I'll also need to incorporate the authentication token into the request.

#### 2D2. `POST "/write/newUser"`

> WIP

### 2E. `/auth/*`

#### 2E1. `POST "/auth/signin/magic-link"`

- [ ] tdWait: Create an endpoint that both signs in and creates a new user
- [ ] tdWait: Create a new user node when a new user signs up
- [ ] tdWait: Assign the managerEmail to the user node on creation

```ts
  reqMagicLink(/* leads to "/" */);

  interface MagicLinkReq {
    email: string
    callbackURL?: string
  }

  function reqMagicLink(request: MagicLinkReq): Promise<MagicLinkRes> {};

  interface MagicLinkRes {
    success: boolean
  }
```

#### 2E2. `GET "/auth/verify?token={token}"`

Request is get with params

```ts
  function verify():Promise<VerifyRes> {};

  interface VerifyRes {
    success: boolean
    user: {
      id: string,
      name?: string,
      email: string,
      manager?: {
        name?: string,
        email?: string,
      } || null
    } || null
  }
```

#### 2E3. `GET "/auth/user"`

- [ ] tdWait: Create a route to get the user details

Request is `GET` with credentials included

```ts
  interface UserRes {
    user: {
      id: string,
      name?: string,
      email: string,
      manager?: {
        name?: string,
        email?: string,
      } || null
    } || null
  }
```

#### 2E4. `POST "/auth/signout"`

- [ ] tdWait: Create a route to sign out the user

Request is `POST` with credentials included

```ts
  interface SignoutRes {
    success: boolean
  }
```

### 2F. `/send/*`

#### 2F1. `POST "/send/ping"`

```ts
function sendPing(/* leads to "/" */): Promise<PingRes> {};
```

---

## 3. Alex's Notes on Auth

When a user logs in or signs up with the magic link flow, here's what happens:

1. Initial Request
   > When the user enters their email address and requests a magic link, they don't receive any userId or token directly in the app.
   > Instead, a one-time token is generated on the backend and sent to their email.
2. After Clicking the Link
   > When the user clicks the magic link in their email, the token is verified by the backend.
   > Upon successful verification, the backend responds with:
      - A userId (which remains consistent for that email address)
      - Some form of session information (could be a JWT token, cookies, etc.)
3. What the Frontend Gets
   > The frontend receives this userId and session information.
      - The session information (token) is what maintains the authenticated state for subsequent API calls
      - The userId is what you'd use to identify the user in your Neo4j database.

So to directly answer your question: You get both. The userId for identifying the user in your database, and a session token for maintaining the authenticated state. The userId should be consistent across logins for the same email, while the session token will be different for each login session.
