// =1 ====== BEACON STAGES ======

/**
 * Match
 * 
 * A match is a Beacon candidate that has not yet been through the server at any point.
 * i.e. it is newly created by the client.
 * 
 * ## Transient Type
 * 
 * ### Created By
 * 
 * `writeRouter.post("/write/writeBeacon", {Match})`
 * 
 * ### Before
 * 
 * `breaker(Match)`
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
 * A Lantern is a Beacon candidate that has been through breaker(),
 * but not yet through writeBeacon().
 * 
 * ## Transient Type
 * 
 * ### Created By
 * 
 * `breaker(Match)`
 * 
 * ### Consumed By
 * 
 * `writeBeacon(Lantern)`
 */
export interface Lantern extends Match {
  shards: Shards
}

/**
 * Beacon
 * 
 * A Beacon has been through all steps in the chain and possessesall properties conferred at each step.
 * 
 * ## Source Type
 * 
 * Once created, any identifying properties of a Beacon should refer back to this representation.
 */
export type Beacon = {
  dbId: string
} & Lantern & (
  | {
    actions: Action[];
    errorLogs?: ErrorLog[];
  }
  | {
    actions?: Action[];
    errorLogs?: ErrorLog[];
  }
);

/**
 * Ember
 * 
 * An Ember is the condensed representation of a Beacon that is returned to the client.
 * 
 * ## Purpose
 * 
 * The Ember is used to:
 * 
 * - Act as a memory store for client-side state.
 * - Link Client & Aura representations of a Beacon together
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

export interface ErrorLog {
  isError: boolean;
  errorCause: string | unknown
}