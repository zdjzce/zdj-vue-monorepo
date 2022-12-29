import { describe, it, expect, vi } from 'vitest'
import { reactive, effect } from '../src/index'
describe('reactive set map 测试函数', () => {
  it('change set data effect will be rerun', () => {
    const proxy = reactive(new Set([1, 2, 3]))
    const fn = vi.fn(() => {})
    effect(() => {
      console.log(proxy.size)
      fn()
    })

    let proxyHasNum = false
    effect(() => {
      console.log(proxy.size)
      proxyHasNum = proxy.has(3)
    })

    proxy.add(6)
    proxy.delete(3)

    expect(fn).toBeCalledTimes(3)
    expect(proxyHasNum).toBe(false)
  })
})