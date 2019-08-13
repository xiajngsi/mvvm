import Watch from './watch';
function Compile(el, vm) {
  this.$vm = vm
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  if(this.$el) {
    this.$fragment = this.node2Fragment(this.$el)
    this.compileElement(this.$fragment)
    this.$el.appendChild(this.$fragment);
  }
}

Compile.prototype = {
  node2Fragment: function(el) {
    var fragment = document.createDocumentFragment(), child;
    while(child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment;
  },
  compileElement: function(el) {
    const childNodes = el.childNodes
    const me = this
    const reg = /\{\{(.*)\}\}/;
    [].slice.call(childNodes).forEach((node) => {
      const text = node.textContent;

      if(me.isElementNode(node)) {
        me.compile(node)
      } else if (me.isTextNode(node) && reg.test(text)) {
        me.compileText(node, RegExp.$1.trim())
      }
      if(node.childNodes && node.childNodes.length) {
        me.compileElement(node)
      }
    })
  },
  isElementNode: function(node) {
    return node.nodeType == 1
  },
  compile(node) {
    const nodeAttrs = node.attributes;
    const me = this;
    [].slice.call(nodeAttrs).forEach((attr) => {
      const attrName = attr.name
      if(attrName && me.isDirection(attrName)) {
        var exp = attr.value
        var dir = attrName.substring(2)
        // 事件指令
        if(me.isEventDirective(dir)){
          compileUtils.eventHandler(node, this.$vm, exp, dir)
        } else {
          compileUtils[dir] && compileUtils[dir](node, me.$vm, exp)
        }
        node.removeAttribute(attrName)
      }

    })
  },
  compileText(node, exp) {
    compileUtils.text(node, this.$vm, exp)
  },
  isTextNode(node) {
    return node.nodeType == 3
  },
  isDirection(attr) {
    return attr.indexOf('v-') == 0
  },
  isEventDirective(dir) {
    return dir.indexOf('on') == 0
  }
}

const compileUtils = {
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model')
    var me = this
    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', (e) => {
      var newValue = e.target.value
      if(val === newValue) {
        return
      }
      me._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },
  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },
  bind(node, vm, exp, dir) {
    const updateFn = udpate[dir + 'Updater']
    updateFn && updateFn(node, this._getVMVal(vm, exp))
    new Watch(vm, exp, function(value, oldValue){
      updateFn && updateFn(node, value, oldValue)
    })
  },
  eventHandler(node, vm, exp, dir) {
    var eventType = dir.split(':')[1]
    let fn = vm.$options.methods && vm.$options.methods[exp]
    if(eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  _getVMVal(vm, exp) {
    let val = vm;
    exp = exp.split('.')
    exp.forEach(function (k) {
      val = val[k]
    })
    return val
  },
  _setVMVal(vm, exp, value) {
    const val = vm;
    exp = exp.split('.')
    exp.forEach(function (k, i) {
      if(i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}

const udpate = {
  htmlUpdater(node, value) {
    node.innerHtml = typeof value == 'undefined' ? '' : value
  },
  textUpdater: function(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  classUpdater(node, value, oldValue) {
    var className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')
    const space = className && String(value)? ' ' : ''
    node.className = className + space + value
  },
  modelUpdater: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
}

export default Compile