import type * as Client from "types/inputTypes.ts";
// [ ] tdWait: Update Server.Input type to include authentication ID
export interface Input {
  input: string;
  isPublic: boolean;
  atoms: Client.Atoms;
  category: string;
  presetId?: string;
  isResolved?: boolean;
}

export interface Entry {
  id: string;
  input: string;
  isPublic: boolean;
  atoms: {
    client: Client.Atoms;
    server: Atoms;
  };
  category: string;
  presetId?: string;
  isResolved?: boolean;
  actions?: Action[];
  error?: {
    isError: boolean;
    errorCause: string;
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
  completed: boolean;
}