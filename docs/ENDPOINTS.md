# Endpoints

## 0. Contents

- [0. Contents](#0-contents)
- [1. Overview](#1-overview)
  - [1A. Status Key](#1a-status-key)
  - [1B. All Endpoints](#1b-all-endpoints)
- [2. Request and Response Formats](#2-request-and-response-formats)
  - [2A. "/edit/\*"](#2a-edit)
  - [2B. "/find/\*"](#2b-find)
  - [2C. `/write/*`](#2c-write)
  - [2D. `/write/*`](#2d-write)
- [3. Alex's Notes on Auth](#3-alexs-notes-on-auth)
- [4. New Front End Outputs](#4-new-front-end-outputs)
  - [4A. `POST` "/auth/signin/magic-link"](#4a-post-authsigninmagic-link)
  - [4B. `GET` "/auth/verify?token={token}"](#4b-get-authverifytokentoken)
  - [4C. `GET` "/auth/user"](#4c-get-authuser)
  - [4D. `POST` "/auth/signout"](#4d-post-authsignout)

---

## 1. Overview

### 1A. Status Key

| Level | Name    | Meaning                                             |
| ----- | ------- | --------------------------------------------------- |
| 0     | Blocked | Cannot start until auth is implemented              |
| 1     | Ghost   | Not started/doesn't exist                           |
| 2     | Shell   | Exists but has no functionality                     |
| 3     | Janky   | Mostly works needs tweaking                         |
| 4     | Murky   | Functioning but response needs work                 |
| 5     | Safe    | All good                                            |
| X     | Zombie  | Works but will be deleted - doesn't respect privacy |

### 1B. All Endpoints

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 5      | GET    | `/`                       | List all endpoints                  |

#### 1B1. `/EDIT`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 2      | POST   | `/edit/editBeacon`        | Edit an existing Beacon             |
| 1      | PUT    | `/edit/editAction`        | Edit an action                      |
| 2      | DELETE | `/edit/deleteBeacon`      | Delete an existing Beacon           |
| 2      | DELETE | `/edit/deleteAction`      | Delete an existing Action           |
| 1      | PUT    | `/edit/editUser`          | Edit a user                         |
| 2      | POST   | `/edit/editManager`       | Edit a user's manager               |

#### 1B2. `/FIND`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/find/userBeacons`       | Find all Beacons for a User         |
| X      | GET    | `/find/subject/:subject`  | Get all Beacons for a named Subject |
| X      | GET    | `/find/object/:object`    | Get all Beacons for a named Object  |
| X      | GET    | `/find/verb/:verb`        | Get all Beacons for a named Verb    |

#### 1B3. `/GET`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 5      | GET    | `/get/n`                  | Get all nodes of a certain type     |
| X      | GET    | `/get/v`                  | Get all verbs of a certain type     |

#### 1B4. `/WRITE`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/write/newBeacon`        | Create a new Beacon                 |
| 1      | POST   | `/write/createUser`       | Create a new user                   |

#### 1B5. `/SEND`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 4      | POST   | `/send/ping`              | Send an email to a manager          |
| X      | GET    | `/send/test`              | Send a test email                   |

#### 1B6. `/AUTH`

| Status | Method | Endpoint                  | Purpose                             |
| ------ | ------ | ------------------------- | ----------------------------------- |
| 1      | POST   | `/auth/signin/magic-link` | Request a magic link                |
| 1      | GET    | `/auth/verify`            | Verify a magic link                 |
| 1      | GET    | `/auth/user`              | Get the current user                |
| 1      | POST   | `/auth/signout`           | Sign out the current user           |

---

## 2. Request and Response Formats

> These are the request formats for the endpoints that either (a) are working or (b) aren't quite working but have a very defined schema. Where I know the response format, I've included it. Some of these will need to be updated to include the session token.

### 2A. "/edit/*"

#### 2A1. `POST` "/edit/editBeacon"

```jsonc
  { // Request
    "userId"?: 1, // number (authentication ID)
    "userName"?: "Jason" // string
  }
```

#### 2A2. `DELETE` "/edit/deleteBeacon"

```jsonc
  { // Request
    "userId": 1, // number (authentication ID)
    "beaconId": 1 // number
  }
```

#### 2A3. `PUT` "/edit/editManager"

```jsonc
  { // Request
    "userId": 1, // number (authentication ID)
    "newName"?: "Bill Poopsmith", // string
    "newEmail": "bill@poopsmith.com" // string
  }
```

### 2B. "/find/*"

#### 2B1. `POST` "/find/user"

This is the endpoint you should call to get the list of entries to show on the user's screen.

It's a `POST` endpoint because it's designed to take a JSON body.

```jsonc
  { // Request
    "name"?: "Jason", // string
    "id"?: 1, // number
    "publicOnly"?: true // boolean
  }
```

##### 2B1A. Parameters

###### 2B1A1. `publicOnly`

- `publicOnly` is optional and defaults to `true`
- this is because the email builder uses some of the same functions
- I made sure the default option doesn't expose any private statements.

###### 2B1A2. `id` and `name`

> By default, this is designed to take an `id` parameter. However, it's got an internal switch that allows it to take a `name` parameter instead.

- If you pass both, or just the `id`...
  - it will use the `id` parameter and call `findUserById(id, publicOnly)`.
- If you only pass the `name`...
  - it will use the `name` parameter and call `findUserByName(name, publicOnly)`.
- If you pass neither...
  - it will return an error.

### 2C. `/write/*`

#### 2C1. `POST` "/write/newBeacon"

```jsonc
  { // Request
  }
```

```jsonc
  { // Response
    [ 
      // One of these objects per Beacon
      {
        "id": "27313", // Beacon ID, not user ID
        "statement": "Jason eats pizza",
        "isPublic": true, // boolean;
        "atoms": {
          "client": { /* The atoms you passed me */ },
          "server": {
            // Ignore this, it's huge and irrelevant for client
            "subject": {
              "head": ["Jason", "Jason"], // [string, string]
              "phrase": "Jason",
              "article"?: "", // "a", "the" etc
              "quantity"?: ["singular"], // (string|number)[];
              "descriptors"?: [] // string[];
            },
            "object": { /* etc etc */ },
            "verb": { /* etc etc */ },
            "adverbial"?: [
              { /* etc etc */ },
              { /* etc etc */ }
            ]
          },
        },
        "category": "", // if you passed me one,
        "presetId"?: "", // if you passed me one
        "isResolved"?: false, // boolean,
        "actions"?: [ /* Your Action type */ ],
        "error"?: {
          // if `error` exists, `error.isError` will be true
          "isError": true,
          "errorCause": "a user-friendly error message" // string,
        }
      }
    ]
  }
```

### 2D. `/write/*`

#### 2D1. `POST` "/write/newBeacon"

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

---

## 4. New Front End Outputs

### 4A. `POST` "/auth/signin/magic-link"

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

### 4B. `GET` "/auth/verify?token={token}"

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

### 4C. `GET` "/auth/user"

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

### 4D. `POST` "/auth/signout"

Request is `POST` with credentials included

```ts
  interface SignoutRes {
    success: boolean
  }
```
