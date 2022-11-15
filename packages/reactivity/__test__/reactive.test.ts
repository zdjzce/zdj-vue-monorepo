import { describe, it, expect } from 'vitest'
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

})