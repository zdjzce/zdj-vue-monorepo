function createElement(tag) {
  const ele = document.createElement(tag)
  return ele
}

function setElementText(el, text) {
  el.textContent = text
}

function insertNode(parent, el, anchor = null ) {
  parent.insertBefore(el, anchor)
}

export {
  createElement,
  setElementText,
  insertNode
}