import { reactive, effect } from ".";

export function computed(getter) {
  let dirty = true
  let val
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty){
        dirty = true
      }
    }
  });

  let obj = {
    get value() {
      if (dirty) {
        val = effectFn()
        dirty = false
      }
      return val
    }
  }

  return obj
}
