// =1==== BEACON STAGES ======

/** ## Match
 * 
 * > Beacon Stage 1
 * 
 * A Match is a new entry from the client. It does not exist in the database.
 * 
 * - Creator: `writeRouter.post("/write/writeBeacon", {Match})`
 * - Consumer: `breaker(Match)`
 */
export interface Match {
  presetId?: string;
  input: string;
  atoms: Atoms;
  isPublic: boolean;
  isArchived: boolean;
  isSnoozed: boolean;
  category?: string;
}

/** ## Lantern
 * 
 * > Beacon Stage 2
 * 
 * A Lantern is a Match that has been through breaker(),
 * but not yet through writeBeacon().
 * 
 * - Creator: `breaker(Match)`
 * - Consumer: `writeBeacon(Lantern)`
 */
export interface Lantern extends Match {
  shards: Shards
}

/** ## Beacon
 * 
 * > Beacon Stage 3
 * 
 * A Beacon has been through all steps in the chain and possesses all properties conferred at each step.
 * 
 * THIS IS THE SOURCE OF TRUTH
 * 
 * - Creator: `writeBeacon(Lantern)`
 */
export interface Beacon extends Lantern {
  dbId: string;
  actions: Action[];
  errorLogs?: DBError[];
}

/** ## Ash
 * 
 * > Beacon Edge Case
 * 
 * An Ash is a Lantern/Ember that errored during writeBeacon().
 * 
 * - Creator: `writeBeacon(Lantern)`
 */
export interface Ash extends Lantern {
  dbId?: string;
  actions?: Action[];
  errorLogs: DBError[];
}

/** ## Ember
 * 
 * An Ember is the condensed representation of a Beacon that is returned to the client.
 * 
 * ### Purpose
 * 
 * Ember is the...
 * 
 * - memory store for client-side state
 * - link between the Client & Aura representations of a Beacon
 * - input type for client to server when editing a Beacon
 * - return type from server to client
 */
export interface Ember extends Omit<Beacon, "shards"> {}

// =2==== BEACON FRAGMENTS ======

// =3==== Client Created ======

/** ### Atoms
 * 
 * > Beacon Fragment
 * 
 * Atoms are the client-defined SOV fragments of a Beacon.
 */
export interface Atoms {
  subject: string;
  verb: string;
  object: string;
  adverbial?: string[];
}

export interface Action {
  id: string;
  creationDate: string;
  byDate: string;
  action: string;
  isResolved: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  children?: Category[];
}

// =3==== Server Created ======

export interface Shards {
  subject: NounShard;
  verb: VerbShard;
  object: NounShard;
  adverbial?: string[];
}

export interface NounShard {
  head: string[];
  phrase: string;
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface VerbShard {
  head: [string, string];
  phrase: string;
  descriptors?: string[];
}

// =3==== Database Records ======

export interface DBError {
  isError: boolean;
  errorCause: string | unknown
}