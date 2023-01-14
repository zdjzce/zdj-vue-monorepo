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

  it('foreach', () => {
    const proxy = reactive(new Map([[{ key: 1 }, { value: 1 }]]))

    const fn = vi.fn(() => { })

    effect(() => {
      fn()
      proxy.forEach((value, key) => {
        console.log(value, key)
      })
    })
    proxy.set({ key: 2 }, { value: 2 })
    expect(fn).toBeCalledTimes(2)
    /* 在遍历时如果获取到原始数据 也应该是响应式对象 */
    const obj = new Map([['key', 1]])
    const data = new Set([1, 2, 3])
    const map = reactive(new Map([[obj, data]]))
    let dataSize = 0
    effect(() => {
      map.forEach(element => {
        dataSize = element.size
      })
    })
    map.get(obj).delete(2)
    expect(dataSize).toBe(2)
  })

  it('for of', () => {
    const map = new Map([['key1', 'value1'], ['key2', 'value2']])
    const fn = vi.fn(() => {})
    effect(() => {
      for(const [key, value] of map) {
        fn()
        console.log(key, value)
      }
    })

    map.set('key3', 'value3')
    expect(fn).toBeCalledTimes(2)

  })
})