import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"
import { reactive } from './reactive'
const setMapInstrumentation = {}

function createGetter(readonly) {

}



export function collectionHandles(isReadonly?: boolean) {
  let readonly = isReadonly || false
  return {
    get: createGetter(readonly)
  }
}