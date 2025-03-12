import type * as Client from "types/inputTypes.ts";

export interface Input {
  // [ ] tdWait: Update Server.Input type to include authentication ID
  input: string;
  isPublic: boolean;
  atoms: Client.Atoms;
  category: string;
  presetId?: string;
  isArchived: boolean;
  isSnoozed: boolean;
  actions?: Client.Action[];
}

export interface Entry {
  id: string;
  input: string;
  name: string;
  isPublic: boolean;
  atoms: {
    client: Client.Atoms;
    server: Atoms;
  };
  category: string;
  presetId?: string;
  isArchived: boolean;
  isSnoozed: boolean;
  actions?: Action[];
  error?: {
    isError: boolean;
    errorCause: string|unknown;
  }
}

export interface Atoms {
  subject: Subject;
  object: Object;
  verb: Verb;
  adverbial?: string[];
}

export interface Subject {
  head: string[];
  phrase: string;
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface Verb {
  head: [string, string];
  phrase: string;
  descriptors?: string[];
}

export interface Object {
  head: string[];
  phrase: string;
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface Action {
  id: string;
  creationDate: string;
  byDate: string;
  action: string;
  isResolved: boolean;
}