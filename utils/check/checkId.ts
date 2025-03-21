export function checkId(id:string):string {
  console.groupCollapsed(`=== checkId(${id}) ===`);
  const newId = typeof id === "string" ? id : String(id);
  console.log(`newId: ${newId}`);
  console.groupEnd();
  return newId;
}
