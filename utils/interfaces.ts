// -------------------------------------------------------------------------
// Security
export interface CredsN4J {
  URI: string;
  USER: string;
  PASSWORD: string;
}

// -------------------------------------------------------------------------
// Grammar Analysis
export interface Subject {
  // [singular, original]
  head: [string, string];
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface Object {
  // [singular, original]
  head: [string, string];
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface Verb {
  // [present infinitive, original]
  head: [string, string];
  descriptors?: string[];
}

export interface Grammar {
  subject: Subject;
  object?: Object;
  verb: Verb;
}

// -------------------------------------------------------------------------
// Lifecycle Tracking
export interface Action {
  creationDate: string,
  byDate?: string,
  action: string
}

// -------------------------------------------------------------------------
// Placeholders
export interface EntryInput {
  statement?: string,
  subject: string,
  verb: string,
  object: string,
  adverbial: string,
  isPublic: boolean,
  actions?: Action[]
}

export interface EntryStore {
  statement: string,
  atoms: Grammar,
  actions?: Action[]
}