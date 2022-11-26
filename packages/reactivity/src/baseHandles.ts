import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"

export function get(target, key, receiver) {
  if (key === 'raw') return target
  const resultGet = Reflect.get(target, key, receiver)
  track(target, key)
  return resultGet
}

export function set(target, key, newVal, receiver) {
  const oldValue = target[key]
  const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
  const result = Reflect.set(target, key, newVal, receiver)
  // 防止访问原型上的属性与当前代理对象不同 触发不必要的响应
  if (target === receiver.raw) {
    if (oldValue != newVal) {
      trigger(target, key, type)
    }
  }
  return result
}

export function has(target, key) {
  track(target, key)
  return Reflect.has(target, key)
}

export function ownKeys(target) {
  track(target, ITERATE_KEY)
  return Reflect.ownKeys(target)
}

export function deleteProperty(target, key) {
  const hadKey = Object.prototype.hasOwnProperty.call(target, key)
  const res = Reflect.deleteProperty(target, key)

  if (hadKey && res) {
    trigger(target, key, 'DELETE')
  }

  return res
}

export const mutableHandlers = {
  get,
  set,
  has,
  ownKeys,
  deleteProperty
}