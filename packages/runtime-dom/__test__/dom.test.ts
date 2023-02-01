import { describe, it, expect, vi } from "vitest"
import { createElement, setElementText, insertNode } from '../src/index'

describe('dom', () => {
  it('createElement, setElementText, insertNode', () => {
    const div = createElement('div')
    expect(div).toBeInstanceOf(HTMLDivElement)

    setElementText(div, '222')
    expect(div.textContent).toBe('222')

    const parentNode = createElement('div')
    parentNode.appendChild(div)
    const node = document.createElement('span')
    insertNode(parentNode, node, div)
    expect(parentNode.firstChild).toBeInstanceOf(HTMLSpanElement)
  })
})