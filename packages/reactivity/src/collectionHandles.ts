import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"
import { reactive } from './reactive'
import { isObject } from '@zdj/utils/src'
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
  },

  set(key, value) {
    const target = this.raw
    const hadKey = target.has(key)

    const oldValue = target.get(key)
    // 获取原始数据， 由于 value 本身已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value
    target.set(key, rawValue)

    if (!hadKey) {
      trigger(target, key, 'ADD')
    } else if (oldValue !== value || (oldValue === value && value === value)) {
      trigger(target, key, 'SET')
    }
  },

  forEach(callback) {
    const convertValue = (val) => isObject(val) ? reactive(val) : val
    const target = this.raw
    track(target, ITERATE_KEY)
    target.forEach((v, i) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给
// callback，这样就实现了深响应
      callback(convertValue(v), convertValue(i), this)
    })
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