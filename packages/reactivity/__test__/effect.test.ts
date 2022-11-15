import { describe, it, expect } from 'vitest'
import { reactive, effect } from '../src/index'
describe('effect 测试函数', () => {
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
    const testFn = (() => {
      const obj = {
        bar: 1
      }

      let val = 0
      const data = reactive(obj)
      effect(() => {
        data.bar += 1
      })
    })
    expect(()=>testFn()).not.toThrowError('Maximum call stack size exceeded')
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
      data.foo = data.foo + 1
      val = data.foo
    }, {
      scheduler(fn) {
        jobQueue.add(fn)
        flushJob()
      }
    })

    expect(val).toBe(2)
  })

})