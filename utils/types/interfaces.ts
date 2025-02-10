// import { Grammar } from "./languageA.ts";
import { Grammar } from "./languageB.ts";

export interface CredsN4J {
  URI: string;
  USER: string;
  PASSWORD: string;
}

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
