import { track, trigger } from "./effect"
import { ITERATE_KEY } from "./reactive"

export function get(target, key, receiver) {
  const resultGet = Reflect.get(target,key,receiver)
  track(target, key)
  return resultGet
}

export function set(target, key, newVal, receiver) {
  const oldValue = target[key]
  const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
  const result = Reflect.set(target, key, newVal, receiver)
  if (oldValue != newVal) {
    trigger(target, key, type)
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