import { Router } from "oak";

export interface Subrouter { 
  router:Router;
  routes:string[]
}

export interface DBCreds {
  URI:string;
  USER:string;
  PASSWORD:string;
}

export interface Search {
  public:boolean;
  type:string;
  id:number;
  name:string;
}