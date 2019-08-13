import observer from './observer';
import Compile from './compiler';
function MVVM(options, el) {
  const vm = this
  this.$options = options
  const data = this._data = this.$options.data 
  Object.keys(data).forEach(function(key) {
    vm._proxyData(key);
  });
  new observer(options.data, vm)
  this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
  _proxyData(key, setter, getter) {
    var me = this;
    setter = setter || 
    Object.defineProperty(me, key, {
        configurable: false,
        enumerable: true,
        get: function proxyGetter() {
            return me._data[key];
        },
        set: function proxySetter(newVal) {
            me._data[key] = newVal;
        }
    });
  }
}

const vm = new MVVM({
  data: {
    msg: 'hello word'
  },
  methods: {
    sayHi: function () {
      this._data.msg = 'hello xjs'
    }
  },
}, document.querySelector('#mvvm-app'))


// compile => text => bind => watch => get(手机依赖)
// onChange => setval => notify => watch update => cb  