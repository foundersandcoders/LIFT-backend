# Cypher Scratchpad

```ts
const verbProps = {
  dbId: entry.id ?? "no id",
  presetId: entry.presetId ?? "no preset id",
  input: entry.input,
  atoms: {
    subject: entry.atoms.subject,
    verb: entry.atoms.verb,
    object: entry.atoms.object,
    adverbial: entry.atoms.adverbial
  },
  shards: {
    subject: entry.atoms.server.subject,
    verb: entry.atoms.server.verb,
    object: entry.atoms.server.object,
    adverbial: entry.atoms.server.adverbial
  },
  isPublic: entry.isPublic ?? false,
  isArchived: entry.isArchived ?? false,
  isSnoozed: entry.isSnoozed ?? false,
  category: entry.category ?? "",
  actions: entry.actions ?? []
}
```
