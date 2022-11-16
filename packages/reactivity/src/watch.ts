import { effect, track, trigger } from ".";

type ArgumentFun<T> = () => T
type Source = ArgumentFun<any> | any


export function watch(source: Source , cb: ArgumentFun<any | void>) {
  const getter = source instanceof Function ? source : traverse(source)
  effect(getter, {
    scheduler() {
      cb()
    },
    lazy: true
  })
}

export function traverse(source: any, seen = new Set()) {
  if (typeof source != 'object' || source === null || seen.has(source)) return

  // 将数据添加到 seen 中 代表遍历过了，避免循环引用
  seen.add(source)

  // 递归处理对象
  for(const k in source) {
    traverse(source[k], seen)
  }

  return source
}