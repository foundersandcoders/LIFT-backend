import { Router } from "oak";

export interface Subrouter { 
  router: Router;
  routes: string[]
}

export interface CredsN4J {
  URI: string;
  USER: string;
  PASSWORD: string;
}