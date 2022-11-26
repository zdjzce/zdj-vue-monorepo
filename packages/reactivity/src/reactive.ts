import { mutableHandlers } from './baseHandles'

export const ITERATE_KEY = Symbol()
export function reactive(obj: any) {
  return createReactiveProxy(obj, mutableHandlers)
}

export function createReactiveProxy(target, proxyHandles) {
  const proxy = new Proxy(target, proxyHandles)
  return proxy
}
