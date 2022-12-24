import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"
import { reactive } from './reactive'
const arrayInstrumentation = {}
  /**
   * 重写数组查找元素方法
   * 假如有 data = reactive([{}]) 那么 data.includes({}) 会为 false, 因为调用内部
   * 法时 this 值已经变成了响应式对象，对象内部也已被包裹成 reactive 代理对象。
   **/
  ;['includes', 'indexOf', 'lastIndexOf'].forEach(methods => {
    const originMethod = Array.prototype[methods]
    arrayInstrumentation[methods] = function (...args) {
      let res = originMethod.apply(this, args)

      if (res === false || res === -1) {
        res = originMethod.apply(this.raw, args)
      }

      return res
    }
  })

  /**
   * push pop 等方法会改变原数组，并且会影响到原数组的 length 属性 会陷入死循环 所以需要重写
   */
   export let shouldTrack = true
  ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentation[method] = function(...args) {
      shouldTrack = false
      const res = originMethod.apply(this, args)
      shouldTrack = true
      return res
    }
  })

function createGetter(isReadonly?: boolean) {
  return function get(target, key, receiver) {
    if (key === 'raw') return target

    if (Array.isArray(target) && arrayInstrumentation.hasOwnProperty(key)) {
      return Reflect.get(arrayInstrumentation, key, receiver)
    }

    const resultGet = Reflect.get(target, key, receiver)
    // 只读的情况下没必要收集副作用, symbol 没必要收集
    if (!isReadonly && typeof key !== 'symbol') {
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
    const arrayType = Number(key) > target.length ? 'ADD' : 'SET'
    const objectType = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
    const type = Array.isArray(target) ? arrayType : objectType
    const result = Reflect.set(target, key, newVal, receiver)
    // 防止访问原型上的属性时原型对象与当前代理对象不同 触发不必要的响应
    if (target === receiver.raw) {
      if (oldValue != newVal) {
        trigger(target, key, type, newVal)
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
  track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
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

function arrayGetHandle() {

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
/* export function shallowHandlers(isReadonly?: boolean) {
  let readonly = isReadonly || false
  return {
    get: shallowGet,
    set: createSetter(),
    has,
    ownKeys,
    deleteProperty: createDeleteProperty(readonly)
  }
} */