import { describe, it, expect, vi } from 'vitest'
import { watch } from '../src/watch'
import { reactive } from '../src/index'

describe('watch', () => {
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

    expect(temp).toBe(undefined)
    expect(fn).toBeCalledTimes(1)

    obj.foo = 2
    expect(temp).toBe(1)
  })

})