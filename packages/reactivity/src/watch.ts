import { effect } from "./effect";

interface ArgumentFun<T> {
  (): T
}
interface CallBack<T> {
  (oldVal: any, newVal: any, onInvalidate: (fn: ArgumentFun<any>) => any): T
}
type Source = ArgumentFun<any> | any


export function watch(source: Source, cb: CallBack<void | any>, options?: any) {
  const getter = source instanceof Function ? source : traverse(source)
  let newVal, oldVal
  const p = Promise.resolve()
  let cleanUp

  const effectFn = effect(getter, {
    scheduler: () => {
      // 放到微任务队列中 等待 DOM 更新结束后执行
      if (options && options.flush === 'post') {
        p.then(job)
      } else {
        job()
      }
    },
    lazy: true
  })

  function onInvalidate(fn) {
    cleanUp = fn
  }

  function job() {
    newVal = effectFn()

    // 每次执行回调之前 先检查是否存在过期回调
    // 如果存在用户传递的过期回调 就执行 此时说明已经是新的状态 
    if (cleanUp) {
      cleanUp()
    }

    cb(newVal, oldVal, onInvalidate)
    // 需要把旧的值换成新的值
    oldVal = newVal
  }

  if (options && options.immediate) {
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