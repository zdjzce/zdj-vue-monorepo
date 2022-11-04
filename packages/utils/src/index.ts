export function isObject(val: any) {
  return typeof val === 'object' && val !== null
}

export function isOn(key: string) {
  return key[0] === 'o' && key[1] === 'n'
}