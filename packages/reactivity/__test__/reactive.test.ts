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
      value = 'foo' in data
    })
    expect(value).toBe(true)
  })

  it('ownKey', () => {
    const obj = {
      foo: 1
    }

    // const fn = vi.fn( () => { })
    const data = reactive(obj)
    let activeVal = ''
    effect(() => {
      for(let active in data) {
        // fn()
        activeVal = active
      }
    })

    data.test = 2
// 
    // expect(fn).toBeCalledTimes(2)s
    expect(activeVal).toBe('test')
  })

  it('delete property', () => {
    const obj = {
      foo: 1,
      bar: 2
    }
    const data = reactive(obj)
    let activeVal = ''
    effect(() => {
      for(let active in data) {
        // fn()
        activeVal = active
      }
    })
    expect(activeVal).toBe('bar')

    delete data.bar
    expect(activeVal).toBe('foo')
  })
})