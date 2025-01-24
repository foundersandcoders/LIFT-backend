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
  statement?: string,
  atoms: Atoms,
  actions?: Action[]
}

export interface Action {
  creationDate: string,
  byDate?: string,
  action: string
}

export interface Atoms {
  subject: string,
  verb: string,
  object: string,
  adverbial: string,
}