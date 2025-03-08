// TODO: Update Client.Entry type to include authentication ID
export interface Entry {
  id: string;
  input: string;
  isPublic: boolean;
  atoms: Atoms;
  actions?: Action[];
  category: string;
  presetId?: string;
  isResolved?: boolean;
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
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  children?: Category[];
}
