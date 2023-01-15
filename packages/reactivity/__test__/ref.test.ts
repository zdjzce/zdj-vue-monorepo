import { describe, it, expect, vi } from "vitest";
import { effect, ref, toRef, toRefs, proxyRefs, reactive } from "../src/index";
describe("ref 测试函数", () => {
  it("ref", () => {
    const data = ref(1)
    const fn = vi.fn(() => {})
    effect(() => {
      fn()
      console.log(data.value)
    })

    data.value = 2
    expect(fn).toBeCalledTimes(2)

    const data2 = reactive({foo: 1, bar: 2})
    /* toRef */
    const foo = toRef(data2, 'foo')
    expect(foo.value).toBe(1)
    /* toRefs */
    const objToRefs = {...toRefs(data2)}
    // @ts-ignore
    expect(objToRefs.foo.value).toBe(1)

    /* proxyRef toRefs */
    const proxyRefsData = proxyRefs({...toRefs(data2)}) as any
    expect(proxyRefsData.foo).toBe(1)
    proxyRefsData.foo = 3
    expect(proxyRefsData.foo).toBe(3)
  })
})
