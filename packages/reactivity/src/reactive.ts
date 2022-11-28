import { mutableHandlers } from './baseHandles'
export const ITERATE_KEY = Symbol()
const reactiveMap = new Map()

export function reactive(obj: any) {
  // 避免响应式数组内部元素为对象时查询不到
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy
  const handles = mutableHandlers()
  const proxy =  createReactiveProxy(obj, handles)

  reactiveMap.set(obj, proxy)
  return proxy
}

export function readonly(obj: any) {
  const handles = mutableHandlers(true)
  return createReactiveProxy(obj, handles)

}

export function createReactiveProxy(target, proxyHandles) {
  const proxy = new Proxy(target, proxyHandles)
  return proxy
}
