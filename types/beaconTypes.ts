// =1 ====== BEACON STAGES ======

/**
 * Match
 * 
 * A Match is a new entry from the client. It does not exist in the database.
 * 
 * - created By `writeRouter.post("/write/writeBeacon", {Match})`
 * - consumed By `breaker(Match)`
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

/**
 * Lantern
 * 
 * A Lantern is a Match that has been through breaker(),
 * but not yet through writeBeacon().
 * 
 * - created By `breaker(Match)`
 * - consumed By `writeBeacon(Lantern)`
 */
export interface Lantern extends Match { shards: Shards }

/**
 * Beacon
 * 
 * A Beacon has been through all steps in the chain and possessesall properties conferred at each step.
 * 
 * THIS IS THE SOURCE OF TRUTH
 * 
 * - created By `writeBeacon(Lantern)`
 */
export interface Beacon extends Lantern {
  dbId: string;
  actions: Action[];
  errorLogs?: DBError[];
}

/**
 * Ash
 * 
 * An Ash is a Lantern that has been through breaker() but errored during writeBeacon().
 * 
 * - created By `writeBeacon(Lantern)`
 */
export interface Ash extends Lantern {
  dbId?: string;
  actions?: Action[];
  errorLogs: DBError[];
}

/**
 * Ember
 * 
 * An Ember is the condensed representation of a Beacon that is returned to the client.
 * 
 * The Ember is:
 * 
 * - a memory store for client-side state
 * - a link between the Client & Aura representations of a Beacon
 * - the return type from server to client
 * - the input type for client to server EXCEPT when creating a new Beacon
 */
export interface Ember extends Omit<Beacon, "shards"> {}

// =1 CLIENT INPUT

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

// =1 SERVER PROCESSES

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

// =1 DATABASE RECORDS

export interface DBError {
  isError: boolean;
  errorCause: string | unknown
}