import { ITERATE_KEY } from './reactive'
type EffectHandle = () => any | void
interface EffectOptions {
  scheduler?: () => void | any
  lazy?: Boolean
}

let activeEffect: any
const effectFnStack: any = []
const WeakEffect = new WeakMap()

export function track(target, key) {
  if (!activeEffect) return
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

export function trigger(target, key, type?: string, newVal?: any) {
  const effectFnList = WeakEffect.get(target)
  if (!effectFnList) return
  const effects = effectFnList.get(key)
  const effectsToRun = new Set()


  if (type === 'ADD' && Array.isArray(target)) {
    const effectLenFn = effectFnList.get('length')
    effectLenFn && effectLenFn.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  if (key === 'length' && Array.isArray(target)) {
    effectFnList.forEach((effectFns, key) => {
      // 当修改数组长度时 应该把索引大于等于新长度的副作用函数重新执行
      if (key >= newVal) {
        effectFns.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
      }
    })
  }

  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffects = effectFnList.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    });
  }

  effects && effects.forEach((effectFn: any) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  });

  effectsToRun.forEach((fn: any) => {
    if (fn.options && fn.options.scheduler) {
      // 将调度权交给调度函数
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  })
}

export function effect(fn: EffectHandle, options = {} as EffectOptions) {
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