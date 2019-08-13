
const setHandle = (target, key, value, receiver, dep) => {
  console.log('seting', target, key ,value)
  target[key] = value;
  dep.notify()
  return true
}

const getHandle = (target, key, receiver, dep) => {
  if(Dep.target) {
    dep.depend()
  }
  return Reflect.get(target, key, receiver);
}

const defineHandle = (value) => {
  console.log('defineHandle')
}
function observer(data, vm){
  if (!data || typeof data !== 'object') {
    return;
}
  this.data = data
  var dep = new Dep()
  var me = this
  Object.keys(data).forEach(function(key) {
    let val = data[key]
    Object.defineProperty(data, key, {
      configurable: false,
      enumerable: true,
      get: function() {
        if (Dep.target) {
            dep.depend();
        }
        return val
      },
      set: function(newVal) {
        if (newVal === val) {
            return;
        }
        val = newVal;
        // 新的值是object的话，进行监听
        new observer(newVal);
        // 通知订阅者
        dep.notify();
      }
  });
  });
  // if(typeof Proxy !== undefined) {
  //   const obj = new Proxy(data, {
  //     set: (target, key, value, receiver) => setHandle(target, key, value, receiver, dep),
  //     get: (target, key, receiver) => getHandle(target, key, receiver, dep)
  //   })
  //   vm.data = obj
  // } else {
  //   Object.keys(data).forEach((key) => {
  //     Object.defineProperty(data, key, {
  //       set: defineHandle
  //     })
  //   })
  // }
  
}


// 依赖收集
function Dep() {
  this.subs = []
}

Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub)
  },
  depend: function() {
    Dep.target.addDep(this);
  },
  notify() {
    this.subs.forEach((sub) => {
      sub.update()
    })
  },
  removeSub(sub) {
    var index = this.subs.indexOf(sub)
    if(index != -1) {
      this.subs.splice(index, 1)
    }
  }
}

export {Dep}
export default observer