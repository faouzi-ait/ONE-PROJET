export default class EventEmitter {
  listeners = {}

  addEventListener(eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || []
    this.listeners[eventName].push(fn)
    return this
  }

  once(eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || []
    const onceWrapper = () => {
      fn()
      this.off(eventName, onceWrapper)
    }
    this.listeners[eventName].push(onceWrapper)
    return this
  }

  removeEventListener (eventName, fn) {
    let lis = this.listeners[eventName]
    if (!lis) return this
    for(let i = lis.length; i > 0; i--) {
      if (lis[i] === fn) {
        lis.splice(i,1)
        break
      }
    }
    return this
  }

  emit(eventName) {
    const fns = this.listeners[eventName.type]
    if (!fns) return false
    fns.forEach((f) => {
      f()
    })
    return true
  }
}
