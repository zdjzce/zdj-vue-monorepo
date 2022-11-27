import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"
import { reactive } from './reactive'

function createGetter(isReadonly?: boolean) {
  return function get(target, key, receiver) {
    if (key === 'raw') return target
    const resultGet = Reflect.get(target, key, receiver)

    // 只读的情况下没必要收集副作用
    if (!isReadonly) {
      track(target, key)
    }

    if (typeof resultGet === 'object' && resultGet !== null) {
      return reactive(resultGet)
    }

    return resultGet
  }
}

function shallowGet(target, key, receiver) {
  if (key === 'raw') return target
  const resultGet = Reflect.get(target, key, receiver)
  track(target, key)
  return resultGet
}

function createSetter(isReadonly?) {
  return function set(target, key, newVal, receiver) {
    if (isReadonly) {
      console.warn('属性是只读的')
      return true
    }
    const oldValue = target[key]
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
    const result = Reflect.set(target, key, newVal, receiver)
    // 防止访问原型上的属性时原型对象与当前代理对象不同 触发不必要的响应
    if (target === receiver.raw) {
      if (oldValue != newVal) {
        trigger(target, key, type)
      }
    }
    return result
  }
}

function has(target, key) {
  track(target, key)
  return Reflect.has(target, key)
}

function ownKeys(target) {
  track(target, ITERATE_KEY)
  return Reflect.ownKeys(target)
}

function createDeleteProperty(isReadonly) {
  return function deleteProperty(target, key) {
    if (isReadonly) {
      console.warn('属性是只读的')
      return true
    }
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    const res = Reflect.deleteProperty(target, key)

    if (hadKey && res) {
      trigger(target, key, 'DELETE')
    }

    return res
  }

}

export function mutableHandlers(isReadonly?: boolean) {
  let readonly = isReadonly || false
  return {
    get: createGetter(readonly),
    set: createSetter(readonly),
    has,
    ownKeys,
    deleteProperty: createDeleteProperty(readonly)
  }
}
export function shallowHandlers(isReadonly?: boolean) {
  let readonly = isReadonly || false
  return {
    get: shallowGet,
    set: createSetter(),
    has,
    ownKeys,
    deleteProperty: createDeleteProperty(readonly)
  }
}