import { describe, it, expect, vi, beforeEach } from 'vitest'
import { watch } from '../src/watch'
import { reactive } from '../src/index'

describe('watch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it('watch 触发更改执行', () => {
    const data = {
      foo: 1
    }
    const obj = reactive(data)
    const fn = vi.fn(() => { })
    let temp = 0
    watch(() => obj.foo, (newVal: any, oldVal: any) => {
      fn()
      temp = oldVal
    }, {
      immediate: true
    })

    expect(temp).toBe(undefined)  // 立马执行watch old为undefined 符合预期
    expect(fn).toBeCalledTimes(1)

    obj.foo = 2
    expect(temp).toBe(1)
  })

  it('watch flush', async () => {
    const data = {
      foo: 1
    }
    const obj = reactive(data)
    const fn = vi.fn((newVal, oldVal) => { })
    watch(() => obj.foo, (newVal: any, oldVal: any) => {
      fn(newVal, oldVal)
    }, {
      immediate: true,
      flush: 'post'
    })

    obj.foo += 1
    expect(fn).toBeCalledTimes(1)
    await vi.runAllTicks()
    expect(fn).toBeCalledTimes(2)
  })

  it('watch invalidate', async() => {
    const data = {
      foo: 1
    }

    let temp: number = 0
    const obj = reactive(data)
    const fn = vi.fn( () => { })
    watch(() => obj.foo, async (newVal, oldVal, onInvalidate) => {
      let expired = false

      onInvalidate(() => {
        // 期望下次执行set出发watch回调时 执行cleanup 将 expired 变为TRUe 让回调过期
        expired = true
      })
      const res = await new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
        return 1
      })
      if (!expired) {
        temp += res
        expect(temp).toBe(1)
      }
    })
    obj.foo++
    await vi.runOnlyPendingTimers();
    obj.foo++
    await vi.runOnlyPendingTimers();
  })
})