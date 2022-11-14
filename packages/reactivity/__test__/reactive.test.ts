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
      temp += 1
      value = data.foo === 2 ? data.val : 0
    })
    // 一旦将foo修改为1 此时 val 的副作用函数就该被清空 不该继续执行
    data.foo = 1
    data.val = 2
    expect(temp).toBe(2)
  })

  it('effect 嵌套', () => {
    const obj = {
      foo: 2,
      bar: 1
    }
    let temp, temp2
    const data = reactive(obj)
    effect(() => {
      effect(() => {
        temp = data.foo
      })
      temp2 = data.bar
    })
    expect(temp2).toBe(1)
    // 此时希望修改 bar 的值时 temp2 也会跟着改变，但内层effect覆盖了 activeEffect, 所以 temp2 还是原来的值。
    data.bar = 2
    expect(temp2).toBe(2)
  })

  it('设置和读取自身不会陷入死循环', () => {
    const obj = {
      bar: 1
    }

    let val = 0
    const data = reactive(obj)
    effect(() => {
      val = data.bar++
    })

    expect(val).toBe(1)
  })

  it('调度执行函数被执行', () => {
    const obj = {
      foo: 2
    }
    const data = reactive(obj)
    let val = 0

    effect(() => {
      val = data.foo + val
    }, {
      scheduler(fn) {
        setTimeout(fn)
      }
    })
    expect(val).toBe(2)
  })

  it('微任务调度 只执行第一次和最后一次', () => {
    const obj = {
      foo: 1
    }
    const data = reactive(obj)
    let temp = 0
    let val = 0

    const jobQueue = new Set() as any
    let isFlushing = false
    const p = Promise.resolve()
    function flushJob() {
      if (isFlushing) return
      // true 代表正在刷新
      isFlushing = true
      
      // 在微任务队列中刷新 jobQueue队列
      p.then(() => {
        jobQueue.forEach(job => job())
      }).finally(() => {
        isFlushing = false
      })
    }

    effect(() => {
      console.log('val:', val)
      val = data.foo + val
      temp += 1
    }, {
      scheduler(fn) {
        jobQueue.add(fn)
        flushJob()
      }
    })

    data.foo++
    data.foo++
    // TODO
    expect(val).toBe(2)
    // expect(temp).toBe(2)
  })

})