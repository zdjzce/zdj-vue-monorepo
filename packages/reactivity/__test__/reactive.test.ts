import { describe, it, expect } from 'vitest'
import { reactive, effect } from '../src/index'
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
  it('当多个属性依赖同一个effect时，有些属性没有必要触发, cleanup', () => {
    const obj = {
      foo: 2,
      val: 2
    }

    const data = reactive(obj)
    let value
    let temp = 0
    effect(() => {
      // 在foo等于2时,更改 data.val没有必要触发 effect
      temp+=1
      value = data.foo === 2 ? data.val : 0
    })
    // 一旦将foo修改为1 此时 val 的副作用函数就该被清空 不该继续执行
    data.foo = 1
    data.val = 2
    expect(temp).toBe(2)
    
  })
})