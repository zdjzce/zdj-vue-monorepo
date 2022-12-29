import { toRawType } from '@zdj/utils/src'
import { mutableHandlers } from './baseHandles'
import { collectionHandles } from './collectionHandles';

export const ITERATE_KEY = Symbol()
const reactiveMap = new Map()

enum TargetType {
  INVALID = 0,
  COMMON,
  COLLECTION
}

export function reactive(obj: any) {
  // 避免响应式数组内部元素为对象时查询不到
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy
  const handles = getTargetType(obj) === TargetType.COMMON ? mutableHandlers() : collectionHandles()
  const proxy = createReactiveProxy(obj, handles)

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


function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

export function getTargetType(target): number {
  return targetTypeMap(toRawType(target))
}