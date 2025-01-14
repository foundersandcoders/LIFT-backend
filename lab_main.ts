import { camelCase } from "@luca/cases";
import { say } from "cowsay";
import { pascalCase } from "cases";
import { add } from "./calc.ts";

const testString = "i am a good pig"

console.log(say({
  text: `${testString} ${String(add(1, 2))} ${camelCase(testString)} ${pascalCase(testString)}`,
  e: 'xx',
  r: true,
}))

// Stuff to Notice When Moving from Node to Deno
/* Using node modules & npm packages
  - Node Modules
    - node: `import * as os from "os"`
    - deno: `import * as os from "node:os"`
  - NPM Packages
    - node: import * as emoji from "node-emoji";
    - deno: import * as emoji from "npm:node-emoji";
  
  No npm install is necessary before the deno run command and no node_modules folder is created. These packages are also subject to the same permissions as other code in Deno. */

/* Imports (CommonJS vs ESModules)
  Deno will automatically determine if a package is using CommonJS and make it work seamlessly when imported.
  e.g. npm:react is a CommonJS package. Deno allows you to import it as if it were an ES module. */

/* Running NPM scripts
  If you have a node script in a package.json, you can run it as follow:
  - $ node: npm run script-name
  - $ deno: deno task script-name */

/* deno Permissions
  -A, --allow-all
    Deno also provides a --allow-all flag that grants all permissions to the script. This disables the security sandbox entirely, and should be used with caution. The --allow-all has the same security properties as running a script in Node.js (ie none)
  -R[=<PATH>...], --allow-read[=<PATH>...]
  -W[=<PATH>...], --allow-write[=<PATH>...]
  -N[=<IP_OR_HOSTNAME>...], --allow-net[=<IP_OR_HOSTNAME>...]
  -E[=<VARIABLE_NAME>...], --allow-env[=<VARIABLE_NAME>...]
  -S[=<API_NAME>...], --allow-sys[=<API_NAME>...]
  --allow-run[=<PROGRAM_NAME>...]
  */
 