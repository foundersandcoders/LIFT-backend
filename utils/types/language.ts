export interface Grammar {
  subject: Subject;
  object?: Object;
  verb: Verb;
}

export interface Subject {
  head: string[];
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}

export interface Verb {
  head: [string, string];
  descriptors?: string[];
}

export interface Object {
  head: string[];
  article?: string;
  quantity: (string | number)[];
  descriptors?: string[];
}