import { track, trigger } from "./effect"
import { ITERATE_KEY, MAP_ITERATOR_KEY } from "./reactive"
import { reactive } from './reactive'
import { isObject } from '@zdj/utils/src'
const setMapInstrumentation = {
  get(key) {
    const target = this.raw
    const had = target.has(key)
    track(target, key)
    if (had) { 
      const res = target.get(key)
      return isObject(res) ? reactive(res) : res
    }
  },
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

  forEach(callback, thisArg) {
    const convertValue = (val) => isObject(val) ? reactive(val) : val
    const target = this.raw
    track(target, ITERATE_KEY)
    target.forEach((v, i) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback，这样就实现了深响应
      callback.call(thisArg, convertValue(v), convertValue(i), this)
    })
  },
  [Symbol.iterator]: iteratorMethod,
  entries: iteratorMethod,
  values: valueIteratorMethod,
  keys: keysIteratorMethod,
}

function iteratorMethod() {
  const target = this.raw
  const itr = target[Symbol.iterator]()

  const wrap = (val) => isObject(val) ? reactive(val) : val
  track(target, ITERATE_KEY)

  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value ,
        done
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this
    }
  }
}

function valueIteratorMethod() {
  const target = this.raw
  const itr = target.values()
  const wrap = (val) => isObject(val) ? reactive(val) : val
  track(target, ITERATE_KEY)

  return {
    next() {
      const { value, done } = itr
      return {
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}


function keysIteratorMethod() {
  const target = this.raw
  const wrap = (val) => isObject(val) ? reactive(val) : val
  const itr = target.keys()
   
  track(target, MAP_ITERATOR_KEY)
  return {
    next() {
      const { value, done } = itr.next()
      return {
        value: wrap(value),
        done
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this
    }
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