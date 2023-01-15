import { reactive } from './reactive'

function ref(value) {
  const proxy = {
    value
  }
  return reactive(proxy)
}

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }

  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return wrapper
}

function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }

  return ret

}

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newVal, receiver) {
      const value = target[key]
      if (value.__v_isRef) {
        value.value = newVal
        return true
      }
      return Reflect.set(target, key, newVal, receiver)
    }
  })
}




export {
  ref,
  toRef,
  toRefs,
  proxyRefs
}