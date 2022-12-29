import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"
import { reactive } from './reactive'
const setMapInstrumentation = {
  add(key) {
    // this 仍然指向代理对象， 通过 raw 获取原始对象
    const target = this.raw
    const hadKey = target.has(key)
    const res = target.add(key)

    if (!hadKey) {
      trigger(target, key, 'ADD')
    }

    return res
  },
  delete(key) {
    const target = this.raw
    const hadKey = target.has(key)
    const res = target.delete(key)

    if (hadKey) {
      trigger(target, key, 'DELETE')
    }

    return res
  },

  has(key) {
    const target = this.raw
    return target.has(key)
  }
}

function createGetter(readonly) {
  return function get(target, key, receiver) {
    if (key === 'raw') return target

    if (key === 'size') {
      track(target, ITERATE_KEY)
      return Reflect.get(target, key, target)
    }

    return setMapInstrumentation[key]
  }
}



export function collectionHandles(isReadonly?: boolean) {
  let readonly = isReadonly || false
  return {
    get: createGetter(readonly)
  }
}