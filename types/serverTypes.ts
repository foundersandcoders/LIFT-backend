import { Router } from "oak";
import { Ember, Ash, DBError } from "./beaconTypes.ts";

export interface Subrouter { 
  router:Router;
  routes:string[]
}

export interface DBCreds {
  URI:string;
  USER:string;
  PASSWORD:string;
}

export interface Attempt {
  record: Ember | Ash;
  error?: DBError;
}

export class Search {
  publicOnly: boolean;
  type: string;
  authId: string;
  name: string;

  constructor(publicOnly: boolean, type: string, authId: string, name: string) {
    this.publicOnly = publicOnly;
    this.type = type;
    this.authId = authId;
    this.name = name;
  }
}