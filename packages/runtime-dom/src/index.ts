function createElement(tag) {
  const ele = document.createElement(tag)
  return ele
}

function setElementText(el, text) {
  el.textContent = text
}

function insertNode(parent, el, anchor = null) {
  parent.insertBefore(el, anchor)
}

function shouldSetAsProps(el, key, nextValue) {
  return key === 'form' ? false : true
}

function patchProps(el, key, prevValue, nextValue) {
  const type = typeof el[key]
  if (shouldSetAsProps(el, key, nextValue)) {
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = nextValue
    }
  } else {
    el.setAttribute(key, nextValue)
  }
}



export {
  createElement,
  setElementText,
  insertNode,
  shouldSetAsProps,
  patchProps
}