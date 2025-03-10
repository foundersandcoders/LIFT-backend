export function checkId(id:string):number {
  console.groupCollapsed(`=== checkId(${id}) ===`);
  const newId = isNaN(parseInt(id)) ? -1 : parseInt(id);
  console.log(`newId: ${newId}`);
  console.groupEnd();
  return newId;
}
