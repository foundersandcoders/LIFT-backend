import { Grammar } from "./language.ts";

export interface Action {
  creationDate: string;
  byDate?: string;
  action: string;
}

export interface EntryInput {
  statement?: string;
  subject: string;
  verb: string;
  object: string;
  adverbial: string;
  isPublic: boolean;
  actions?: Action[];
}

export interface EntryStore {
  statement: string;
  atoms: Grammar;
  actions?: Action[];
}
