import { describe, it, expect, vi } from 'vitest'
import { reactive, effect } from '../src/index'
// @ts-ignore
import { flushJob } from '@zdj/utils'
describe('reactive 测试函数', () => {
  it('基本响应式数据', () => {
    const obj = {
      foo: 1
    }

    const data = reactive(obj)
    let value
    effect(() => {
      value = data.foo
    })
    data.foo = 2
    expect(value).toBe(2)
  })

  it('has', () => {
    const obj = {
      foo: 1
    }

    const data = reactive(obj)
    let value
    effect(() => {
      value = 'foo' in obj
    })
    expect(value).toBe(true)
  })

  it('ownKey', () => {
    const obj = {
      foo: 1
    }

    const fn = vi.fn( () => { })
    const data = reactive(obj)
    let active = ''
    effect(() => {
      for(let active in data) {
        fn()
        active = active
      }
    })

    data.bar = 2

    expect(fn).toBeCalledTimes(1)
    expect(active).toBe('bar')
  })
})