import { describe, it, expect, vi } from 'vitest'
import { watch } from '../src/watch'
import { reactive } from '../src/index'

describe('watch', () => {
  it('watch 触发更改立即执行', () => {
    const data = {
      foo: 1
    }
    const obj = reactive(data)
    const fn = vi.fn(() => {})

    watch(() => obj.foo, () => {
      fn()
    })

    obj.foo = 2
    expect(fn).toHaveBeenCalledTimes(0)
  })
})