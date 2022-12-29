import { describe, it, expect, vi } from 'vitest'
import { reactive, effect } from '../src/index'
describe('reactive set map 测试函数', () => {
  it('change set data effect will be rerun', () => {
    const proxy = reactive(new Set([1, 2, 3]))
    const fn = vi.fn(() => { })
    effect(() => {
      console.log(proxy.size)
      fn()
    })

    proxy.add(1)

    expect(fn).toBeCalledTimes(2)
  })
})