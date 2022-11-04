import { describe, it, expect } from 'vitest'
import { isObject, isOn } from '../src/index'

describe('测试工具函数', () => {
  it('是否是对象', () => {
    expect(isObject('')).toBe(false)
    expect(isObject({})).toBe(true)
    expect(isObject(null)).toBe(false)
    expect(isObject(1)).toBe(false)
  })

  it('是否是事件', () => {
    expect(isOn('')).toBe(false)
    expect(isOn('o')).toBe(false)
    expect(isOn('on')).toBe(true)
  })
})
