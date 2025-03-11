export interface Entry {
  id: string;
  presetId?: string;
  input: string;
  atoms: Atoms;
  isPublic: boolean;
  isArchived: boolean;
  isSnoozed: boolean;
  category: string;
  actions?: Action[];
}

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
