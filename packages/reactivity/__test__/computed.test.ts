import { describe, it, expect, vi } from "vitest";
import { computed } from "../src/computed";
import { reactive, effect } from "../src/index";
describe("computed 测试函数", () => {
  it("lazy属性", () => {
    let data = { age: 1 }
    let obj = reactive(data)
    let fn = vi.fn((n) => {})
    let effectFn = effect(
      () => {
        fn(obj.age)
      },
      { lazy: true }
    )
    expect(fn).toHaveBeenCalledTimes(0) //默认不执行
    effectFn() //手动执行
    expect(fn).toHaveBeenCalledTimes(1) //默认不执行
  })

  it("computed dirty", () => {
    const data = { foo: 1, bar: 2 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    const some = computed(() => { 
      fn()
      return obj.foo + obj.bar
    })
    expect(fn).toHaveBeenCalledTimes(0)
    expect(some.value).toBe(3)
    expect(fn).toHaveBeenCalledTimes(1)
    // 即使数据相同还是会执行
    console.log('some.value:', some.value)
    console.log('some.value:', some.value)  // 此时没有dirty时总共执行了3次
    expect(fn).toHaveBeenCalledTimes(1)

    console.log('obj.foo:', obj.foo)
    obj.foo += 1
    console.log('obj.foo:', obj.foo)
    expect(some.value).toBe(4)

  })

  it('computed set value', () => {

  })
})
