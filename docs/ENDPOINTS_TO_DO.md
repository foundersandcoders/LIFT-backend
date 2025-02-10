# Proposed Endpoints and Query Structures

| Endpoint              | Purpose                                 | Query Parameters                            | Example Response                                                                                                                                                                                                 |
| --------------------- | --------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dictionary`         | Retrieve dictionary entries             | `startsWith` (optional), `limit` (optional) | `json {"dictionary": ["apple", "applicable", "applesauce"]}`                                                                                                                                                     |
| `/statements`         | Retrieve all statements                 | None                                        | `json {"statements": [{"subject": "Alice","verb": "manages","object": "project deadlines","isPublic": true,"actions": [{"creationDate": "2025-01-20","byDate": "2025-01-20","action": "Reviewed statement"}]}]}` |
| `/statements/subject` | Retrieve statements by subject          | `subject` (required)                        | `json {"statements": [{"subject": "Alice","verb": "manages","object": "project deadlines","isPublic": true,"actions": [{"creationDate": "2025-01-20","byDate": "2025-01-20","action": "Reviewed statement"}]}]}` |
| `/tiles`              | Retrieve data for populating grid tiles | None                                        | `json {"tiles": [{"name": "Achieve","popularity": 95,"color": "purple"},{"name": "Adapt","popularity": 90,"color": "purple"}]}`                                                                                  |

---

## Request Examples

### `/dictionary`

**Retrieve all dictionary entries**:

```http
GET /dictionary
```

**Retrieve entries starting with `app`, limited to 10**:

```http
GET /dictionary?startsWith=app&limit=10
```

### `/statements`

**Retrieve all statements**:

```http
GET /statements
```

### `/statements/subject`

- **Retrieve statements for a specific subject (`Alice`)**:

  ```http
  GET /statements/subject?subject=Alice
  ```

### `/tiles`

**Retrieve all tile data**:

```http
GET /tiles
```
