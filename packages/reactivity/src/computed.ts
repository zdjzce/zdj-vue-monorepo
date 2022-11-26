import { effect, track, trigger } from "./effect";

export function computed(getter) {
  let dirty = true
  let val
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty){
        dirty = true
        trigger(obj, 'value')
      }
    }
  });

  let obj = {
    get value() {
      if (dirty) {
        val = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return val
    }
  }

  return obj
}
