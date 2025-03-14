export function checkName(name:string):string {
  console.groupCollapsed(`=== checkName(${name}) ===`);
  const newName = name ?? "";
  console.log(`newName: ${newName}`);
  console.groupEnd();
  return newName;
}
