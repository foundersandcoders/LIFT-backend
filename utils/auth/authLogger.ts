import { auth } from "utils/auth.ts";

export function authLogger() {
  console.group(`|============ auth ============|`);
    console.log(Object.keys(auth).sort());
  
    console.group(`|============ api ============|`);
      console.log(Object.keys(auth.api).sort());
    console.groupEnd();
    
    console.group(`|============ options ============|`);
      console.log(Object.keys(auth.options).sort());
      
      console.group(`|============ plugins[0] ============|`);
        console.log(Object.keys(auth.options.plugins[0]).sort());
        
        console.group(`|============ endpoints ============|`);
          console.log(Object.keys(auth.options.plugins[0].endpoints).sort());
        console.groupEnd();
      console.groupEnd();
      
      console.group(`|============ userStore ============|`);
        console.log(Object.keys(auth.options.userStore).sort());
      console.groupEnd();
    console.groupEnd();
  console.groupEnd();
}