// @ts-ignore
import { isObject } from '@zdj/utils'

/**
 * 1. 简单的响应式 通过proxy的getter setter 拦截 在读取属性的时候将函数放入桶 设置属性时将桶里的函数执行 目前会有不同对象的不同属性不能拥有自己单独的 effect 问题 
 * 为了解决这个问题可以新建 map 对象将目标对象作为 key，值为每个属性对应的 effect 栈。
 * 2. 分支切换导致的冗余副作用函数（后面并没有用到某个属性 却被收集到栈里），导致副作用函数进行不必要的更新，需要每次在副作用函数执行之前，重新建立关系，做法就是在 effect 函数中
 * 加一个 dep 属性维护当前函数的依赖项 每次调用进行清空。此外还需注意 foreach 遍历集合时，如果一个值被访问过了，但这个值被删除并重新添加到集合会陷入死循环，解决办法是
 * 建立一个新的 set 数据结构用来遍历
 * 3. 关于嵌套的副作用函数问题，实际场景中，嵌套副作用函数发生在组件嵌套的场景中，为了避免在响应式数据与副作用函数之间建立的响应联系发生错乱，应该使用副作用函数栈存储不同的
 * 副作用函数，执行完毕后弹出，当读取数据时只会与当前栈顶的副作用函数建立联系，还需注意副作用函数会无限递归调用自身，原因在于响应式数据的读取和设置操作发生在同一个副作用函数内。
 * 解决办法就是 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
 * 4. 响应式系统还需具备调度性，即把什么时候触发，执行的次数，触发的方式交给外部调用者决定。为了实现这个功能，要为 effect 函数增加一个选项，可以通过 scheduler 指定调用器，就能够让
 * 用户通过调度器自行完成任务的调度。还需注意如何通过调度器实现任务去重
 * 5. computed 属性实际上是一个懒执行的副作用函数，可以通过 lazy 选项使副作用函数懒执行。被标记为懒执行的副作用函数可以手动执行。利用这个特点读取计算属性的值，只需手动执行副作用函数。
 * 当计算属性依赖的响应式数据发生变化时，会通过 scheduler 将 dirty 标记设置为 true。代表脏数据，这样下次再读取计算属性的值，就能够重新计算。
 * 6. watch 的实现原理本质上利用了副作用函数重新执行的可调度性。一个 watch 本身会创建一个 effect，当这个 effect 依赖的响应式数据发生变化时，会执行该 effect 的调度器函数，可以理解为
 * 回调。还有立即执行回调的 watch，通过添加新的选项 immediate 来控制执行回调函数的执行时机，通过 flush 选项来指定回调函数具体的执行时机，本质上是利用了调度器和异步的微任务队列。
 * 7. 最后还有过期的副作用函数，会导致竞态问题，添加一个 onInvalidate 函数用来注册过期回调，每当 Watch 的回调函数执行之前，会优先执行用户通过 onInvalidate 注册的过期回调
 * 这样用户就有机会在过期回调中将上一次的副作用标记为过期。
*/

let activeEffect: any
const effectFnStack: any = []
const WeakEffect = new WeakMap()

export function reactive(obj: any) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // console.log(target,key,receiver)

      // if (!activeEffect) return

      const resultGet = Reflect.get(target,key,receiver)
      track(target, key)
      return resultGet
    },

    set(target, key, newVal, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, newVal, receiver)
      if (oldValue != newVal) {
        trigger(target, key, newVal, receiver)
      }
      return result
    }
  })
}
export function track(target, key) {
  if(!activeEffect) return
  let weakMap = WeakEffect.get(target)
  if (!weakMap) {
    WeakEffect.set(target, (weakMap = new Map()))
  }

  let deps = weakMap.get(key)
  if (!deps) {
    weakMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

export function trigger(target, key, newVal, receiver) {
  const effectFnList = WeakEffect.get(target)
  if (!effectFnList) return
  const effects = effectFnList.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach((effectFn: any) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  });

  effectsToRun.forEach((fn: any) => {
    if (fn.options.scheduler) {
      // 将调度权交给调度函数
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  })
}

export function effect(fn, options={} as any) {
  const effectFn = () => {
    cleanUp(effectFn)
    // 需要避免内层的 effect 覆盖外层，维护一个 effect 栈
    activeEffect = effectFn
    effectFnStack.push(effectFn)
    const res = fn()
    // 执行完毕后弹出
    effectFnStack.pop()
    // 还原活跃effect为上一个
    activeEffect = effectFnStack[effectFnStack.length - 1]
    return res
  }

  effectFn.options = options
  effectFn.deps = []
  
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

export function cleanUp(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    // 清除指定的 effectFn
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}