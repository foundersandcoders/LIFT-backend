export function checkId(id:string):number {
  return isNaN(parseInt(id)) ? -1 : parseInt(id);
}

export function checkName(name:string):string {
  return name ?? "";
}