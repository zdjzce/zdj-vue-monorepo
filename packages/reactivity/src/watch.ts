import { e } from "vitest/dist/index-220c1d70";
import { effect, track, trigger } from ".";

interface ArgumentFun<T> {
  (): T
}
interface CallBack<T> {
  (oldVal: any, newVal: any): T
}
type Source = ArgumentFun<any> | any


export function watch(source: Source, cb: CallBack<void | any>, options?: any) {
  const getter = source instanceof Function ? source : traverse(source)
  let newVal, oldVal

  const effectFn = effect(getter, {
    scheduler: job,
    lazy: true
  })

  function job() {
    newVal = effectFn()
    cb(newVal, oldVal)
    // 需要把旧的值换成新的值
    oldVal = newVal
  }

  if (options.immediate) {
    job()
  } else {
    oldVal = effectFn()
  }
}

export function traverse(source: any, seen = new Set()) {
  if (typeof source != 'object' || source === null || seen.has(source)) return

  // 将数据添加到 seen 中 代表遍历过了，避免循环引用
  seen.add(source)

  // 递归处理对象
  for (const k in source) {
    traverse(source[k], seen)
  }

  return source
}