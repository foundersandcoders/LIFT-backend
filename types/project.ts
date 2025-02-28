import { Router } from "oak";

export interface Subrouter { 
  router: Router;
  routes: string[]
}