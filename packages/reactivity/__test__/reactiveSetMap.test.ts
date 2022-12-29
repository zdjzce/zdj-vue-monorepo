import { describe, it, expect, vi } from 'vitest'
import { reactive, effect } from '../src/index'
describe('reactive set map 测试函数', () => {
  it('change set data effect will be rerun', () => {
    const proxy = reactive(new Set([1, 2, 3]))
    const fn = vi.fn(() => { })
    let size = 0
    effect(() => {
      console.log(proxy.size)
      fn()
    })
    size = proxy.size
    console.log('console.log(proxy.size):', console.log(proxy.size))
    

    expect(size).toBe(3)
  })
})