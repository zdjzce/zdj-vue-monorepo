import { describe, it, expect, vi } from 'vitest'
import { reactive, effect } from '../src/index'
describe('reactive 测试函数', () => {
  it('add array key then change length', () => {
    const arr = [1]
    const data = reactive(arr)
    let len = 0
    effect(() => {
      len = data.length
    })

    // 期望索引添加元素时 能够改变长度
    data[2] = 1
    expect(len).toBe(3)
  })

  it("change length >= index, index's handle will working", () => {
    const arr = [1]
    const data = reactive(arr)
    const fn = vi.fn(() => { })
    let testMock = 0
    effect(() => {
      testMock = data[0] || 0
      fn()
    })
    data.length = 0
    expect(fn).toBeCalledTimes(2)
  })
})