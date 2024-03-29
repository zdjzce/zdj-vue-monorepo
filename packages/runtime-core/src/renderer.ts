import { isObject } from '@zdj/utils'
interface RendererOptions {
  createElement: (tag: string) => Element
  insertNode: (parent: HTMLElement, el: HTMLElement | Element, anchor?: any) => void
  patchProps: (el: HTMLElement | Element, key: string, prevValue, nextValue) => void
}

function createRenderer(options: RendererOptions) {

  const {
    createElement,
    insertNode,
    patchProps
  } = options

  function patch(oldNode, newNode, container) {
    if (!oldNode) {
      mountElement(newNode, container)
    } else {
      // 打补丁
    }
  }

  function renderer(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        patch(container._vnode, null, container)
      }
    }
    container._vnode = vnode
  }

  function mountElement(vnode, container) {
    const el = (vnode.el = createElement(vnode.tag))
    if (isObject(vnode.children)) {
      for (let i = 0; i < vnode.children.length; i++) {
        patch(null, vnode.children[i], el)
      }
    } else {
      el.textContent = vnode.children
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }

    insertNode(container, el)
  }


  return {
    renderer
  }
}

export {
  createRenderer
}