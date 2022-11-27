import { mutableHandlers } from './baseHandles'
export const ITERATE_KEY = Symbol()
export function reactive(obj: any) {
  const handles = mutableHandlers()
  return createReactiveProxy(obj, handles)
}

export function readonly(obj: any) {
  const handles = mutableHandlers(true)
  return createReactiveProxy(obj, handles)

}


export function createReactiveProxy(target, proxyHandles) {
  const proxy = new Proxy(target, proxyHandles)
  return proxy
}
