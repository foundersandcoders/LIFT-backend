export interface Input {
  input: string;
  isPublic: boolean;
  atoms: Atoms;
  category: string;
  presetId?: string;
  isResolved?: boolean;
}

export interface Entry extends Input {
  id: string;
  actions?: Action[];
  error?: {
    isError: boolean;
    errorCause: string;
  };
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