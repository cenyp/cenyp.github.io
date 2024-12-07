# vuex 源码

## 为什么每个组件都可以通过$store来获取全局实例实现

对 2.0 版本是利用 `mixin` 在 `beforeCreate` 钩子上执行函数，如果是根节点，直接获取 `store`，对于非根组件，则从 `parent` 上获取。

由于 `vue` 的父子组件声明周期加载流程是一定先从父组件开始的，所以子组件一定可以通过 `.parent` 属性获取 `store`

```js
Vue.mixin({ beforeCreate: vuexInit })
  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      /*存在store其实代表的就是Root节点，直接执行store（function时）或者使用store（非function）*/
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      /*子组件直接从父组件中获取$store，这样就保证了所有组件都公用了全局的同一份store*/
      this.$store = options.parent.$store
    }
  }
```

## 初始化做了什么事情

除了一些内边变量的初始化，关键的就是 `installModule`（初始化 `module` ）以及 `resetStoreVM`（通过 `VM` 使 `store` “响应式”）

### installModule

`installModule` 的作用主要是为 `module` 加上 `namespace` 名字空间（如果有）后，注册 `mutation`、`action` 以及 `getter`，同时递归安装所有子 `module`

具体如上所述

```js
/*初始化module*/
function installModule (store, rootState, path, module, hot) {
  /* 是否是根module */
  const isRoot = !path.length
  /* 获取module的namespace */
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  /* 如果有namespace则在_modulesNamespaceMap中注册 */
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    /* 获取父级的state */
    const parentState = getNestedState(rootState, path.slice(0, -1))
    /* module的name */
    const moduleName = path[path.length - 1]
    store.`_withCommit`(() => {
      /* 将子module设成响应式的 */
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  /* 遍历注册mutation */
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  /* 遍历注册action */
  module.forEachAction((action, key) => {
    const namespacedType = namespace + key
    registerAction(store, namespacedType, action, local)
  })

  /* 遍历注册getter */
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  /* 递归安装 module */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}



// getNamespace 方法
/*
    获取namespace，当namespaced为true的时候会返回'moduleName/name'
    默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的——这样使得多个模块能够对同一 mutation 或 action 作出响应。
    如果希望你的模块更加自包含或提高可重用性，你可以通过添加 namespaced: true 的方式使其成为命名空间模块。
    当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。
*/
getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
        module = module.getChild(key)
        return namespace + (module.namespaced ? key + '/' : '')
    }, '')
}
```

### resetStoreVM

`resetStoreVM` 首先会遍历 `wrappedGetters`，使用 `Object.defineProperty` 方法为每一个 `getter` 绑定上 `get` 方法，这样我们就可以在组件里访问`this.$store.getters.test` 就等同于访问 `store._vm.test`  

```js
forEachValue(wrappedGetters, (fn, key) => {
  // use computed to leverage its lazy-caching mechanism
  computed[key] = () => fn(store)
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true // for local getters
  })
})
```

之后 `Vuex` 采用了 `new` 一个 `Vue` 对象来实现数据的“响应式化”，运用 `Vue.js` 内部提供的数据双向绑定功能来实现 `store` 的数据与视图的同步更新。

```js
store._vm = new Vue({
  data: {
    $$state: state
  },
  computed
})
```

这时候我们访问 `store._vm.test` 也就访问了 `Vue` 实例中的属性。

这两步执行完以后，我们就可以通过 `this.$store.getter.test` 访问 `vm` 中的 `test` 属性了。

## mutation 实现

在 `installModule` 中根据名称（有无命名空间会不同）进行批量注册；

使用时通过 `commit` 方法根据名称调用，注意这里会有同名问题

```js
  /* 调用mutation的commit方法 */
  commit (_type, _payload, _options) {
    // check object-style commit
    /* 校验参数 */
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    /* 取出type对应的mutation的方法 */
    const entry = this._mutations[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    /* 执行mutation中的所有方法 */
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
}
```

### 同名问题

默认情况下，模块内部的 `action` 和 `mutation` 仍然是注册在全局命名空间的——这样使得多个模块能够对同一个 `action` 或 `mutation` 作出响应。

如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 `getter、action` 及 `mutation` 都会自动根据模块注册的路径调整命名。

```js
const store = createStore({
  modules: {
    account: {
      namespaced: true,

      // 模块内容（module assets）
      state: () => ({ ... }), // 模块内的状态已经是嵌套的了，使用 `namespaced` 属性不会对其产生影响
      getters: {
        isAdmin () { ... } // -> getters['account/isAdmin']
      },
      actions: {
        login () { ... } // -> dispatch('account/login')
      },
      mutations: {
        login () { ... } // -> commit('account/login')
      },

      // 嵌套模块
      modules: {
        // 继承父模块的命名空间
        myPage: {
          state: () => ({ ... }),
          getters: {
            profile () { ... } // -> getters['account/profile']
          }
        },

        // 进一步嵌套命名空间
        posts: {
          namespaced: true,

          state: () => ({ ... }),
          getters: {
            popular () { ... } // -> getters['account/posts/popular']
          }
        }
      }
    }
  }
})

```

那么针对是否使用 `namespaced` 会有不同效果吗

```js
const store = new Vuex.Store({
    state: {
        count: 0,
    },
    mutations: {
        add(state) {
            state.count++;
        },
    },
    modules: {
        test: {
            namespaced: true, // false
            state: {
                count: 1,
            },
            mutations: {
                add(state) {
                    state.count++;
                },
            },
        },
    },
});

// 有namespaced
this.$store.commit('add'); // 正常
this.$store.commit('test/add');  // 正常

// 无namespaced
this.$store.commit('add'); // 正常，但两个都执行了，这在工程上是不行的
this.$store.commit('test/add'); // 报错

```

源码的 `mutation` 是这样子注册的，`type` 如上所属，没有 `namespaced`，为同名，即会存储在一个数组里面批量触发；

`action` 也差不多

```js
/* 遍历注册mutation */
function registerMutation (store, type, handler, local) {
  /* 所有的mutation会被push进一个数组中，这样相同的mutation就可以调用不同module中的同名的mutation了 */
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

## getter 实现

如上所属，`getter` 时不允许同名的。源码中也做了校验，那么为什么？

因为 `getter` 是全局注册的，利用 `vue` 的计算属性做缓存，故不能同名；

如下所示，先在 `installModule` 中对 `getter` 进行注册收集，然后在 `resetStoreVM` 中通过 `Object.defineProperty` 为每一个 `getter` 方法设置 `get` 方法，比如获取 `this.$store.getters.test` 的时候获取的是 `store._vm.test`，也就是 `Vue` 对象的 `computed` 属性

```js
/* 遍历注册getter */
function registerGetter (store, type, rawGetter, local) {
  /* 不存在直接返回 */
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }

  /* 包装getter */
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}

/* 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed */
function resetStoreVM (store, state, hot) {
  /* 存放之前的vm对象 */
  const oldVm = store._vm 

  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}

  /* 通过Object.defineProperty为每一个getter方法设置get方法，比如获取this.$store.getters.test的时候获取的是store._vm.test，也就是Vue对象的computed属性 */
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  /*  这里new了一个Vue对象，运用Vue内部的响应式实现注册state以及computed*/
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```

## state 实现

对于 `state` 是通过 `vue.data` 实现数据劫持效果的

首先，在 `installModule` 中通过 `vue.set` 方法在父级中进入该子 `module` 的 `state`，所以在使用中会是 `this.$store.state.xxxxx.aaa`

```js
if (!isRoot && !hot) {
    /* 获取父级的state */
    const parentState = getNestedState(rootState, path.slice(0, -1))
    /* module的name */
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      /* 将子module设置称响应式的 */
      Vue.set(parentState, moduleName, module.state)
    })
}
```

然后，在 `resetStoreVM` 中，存入 `$$state` 中

```js
function resetStoreVM (store, state, hot) {
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}

  /* 通过Object.defineProperty为每一个getter方法设置get方法，比如获取this.$store.getters.test的时候获取的是store._vm.test，也就是Vue对象的computed属性 */
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  /*  这里new了一个Vue对象，运用Vue内部的响应式实现注册state以及computed*/
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```

最后，在使用时，做一下转换

```js
get state () {
    return this._vm._data.$$state
  }
```

## module实现

像 `state`、`getter` 等等都在上面说明了，这里总结一下

+ `state` 是通过 `vue.set` 方法注册到父级数据中是
+ `getter` 是全局注册存储的，故不能同名
+ `mutation` 和 `action`，也是全局存储的，所以在使用上可以跨 `module` 调用，但要注意同名问题

对于多个 `module` 及嵌套的情况，是在 `installModule` 中进行循环遍历处理的

```js
/*初始化module*/
function installModule (store, rootState, path, module, hot) {
  /* 是否是根module */
  const isRoot = !path.length
  /* 获取module的namespace */
  const namespace = store._modules.getNamespace(path)

  const local = module.context = makeLocalContext(store, namespace, path)

  /* 递归安装module */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

## 严格模式

`Vuex` 的 `Store` 构造类的 `option` 有一个 `strict` 的参数，可以控制 `Vuex` 执行严格模式，严格模式下，所有修改 `state` 的操作必须通过 `mutation` 实现，否则会抛出错误。

首先，在严格模式下，`Vuex` 会利用 `vm` 的 `$watch` 方法来观察 `$$state`，也就是 `Store` 的 `state`，在它被修改的时候进入回调。我们发现，回调中只有一句话，用 `assert` 断言来检测 `store._committing`，当 `store._committing` 为 `false` 的时候会触发断言，抛出异常。

```js
/* 使能严格模式 */
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      /* 检测store中的_committing的值，如果是false代表不是通过mutation的方法修改的 */
      assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```

我们发现，`Store` 的 `commit` 方法中，执行 `mutation` 的语句是这样的。

```js
this._withCommit(() => {
  entry.forEach(function commitIterator (handler) {
    handler(payload)
  })
})

_withCommit (fn) {
  /* 调用withCommit修改state的值时会将store的committing值置为true，内部会有断言检查该值，在严格模式下只允许使用mutation来修改store中的值，而不允许直接修改store的数值 */
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

我们发现，通过 `commit`（`mutation`）修改 `state` 数据的时候，会在调用 `mutation` 方法之前将 `committing` 置为`true`，接下来再通过 `mutation` 函数修改 `state` 中的数据，这时候触发 `$watch` 中的回调断言 `committing` 是不会抛出异常的（此时 `committing` 为 `true`）。

而当我们直接修改 `state` 的数据时，触发 `$watch` 的回调执行断言，这时 `committing` 为 `false`，则会抛出异常。这就是 `Vuex` 的严格模式的实现。

## commit方法

```js
/* 调用mutation的commit方法 */
commit (_type, _payload, _options) {
  // check object-style commit
  /* 校验参数 */
  const {
    type,
    payload,
    options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  /* 取出type对应的mutation的方法 */
  const entry = this._mutations[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown mutation type: ${type}`)
    }
    return
  }
  /* 执行mutation中的所有方法 */
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  /* 通知所有订阅者 */
  this._subscribers.forEach(sub => sub(mutation, this.state))

  if (
    process.env.NODE_ENV !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      `[vuex] mutation type: ${type}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  }
}
```

`commit` 方法会根据 `type` 找到并调用 `_mutations` 中的所有 `type` 对应的 `mutation` 方法，所以当没有 `namespace` 的时候，`commit` 方法会触发所有module中的 `mutation` 方法。再执行完所有的 `mutation` 之后会执行 `_subscribers` 中的所有订阅者。我们来看一下 `_subscribers` 是什么。

`Store` 给外部提供了一个 `subscribe` 方法，用以注册一个订阅函数，会 `push` 到 `Store` 实例的 `_subscribers` 中，同时返回一个从 `_subscribers` 中注销该订阅者的方法。

```js
/* 注册一个订阅函数，返回取消订阅的函数 */
subscribe (fn) {
  const subs = this._subscribers
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```

在 `commit` 结束以后则会调用这些 `_subscribers` 中的订阅者，这个订阅者模式提供给外部一个监视 `state` 变化的可能。`state` 通过 `mutation` 改变时，可以有效补获这些变化。

## dispatch

来看一下 `dispatch` 的实现。

```js
/* 调用action的dispatch方法 */
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  /* actions中取出type对应的action */
  const entry = this._actions[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  /* 是数组则包装Promise形成一个新的Promise，只有一个则直接返回第0个 */
  return entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)
}
```

以及 `registerAction` 时候做的事情。

```js
/* 遍历注册action */
function registerAction (store, type, handler, local) {
  /* 取出type对应的action */
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload, cb) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb)
    /* 判断是否是Promise */
    if (!isPromise(res)) {
      /* 不是Promise对象的时候转化称Promise对象 */
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      /* 存在devtool插件的时候触发vuex的error给devtool */
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}
```

因为 `registerAction` 的时候将 `push` 进 `_actions` 的 `action` 进行了一层封装 `wrappedActionHandler`

所以我们在进行 `dispatch` 的第一个参数中获取 `state`、`commit` 等方法。

之后，执行结果 `res` 会被进行判断是否是 `Promise`，不是则会进行一层封装，将其转化成 `Promise` 对象（不然执行时返回的就不是 `Promise` 了）

`dispatch` 时则从 `_actions` 中取出，只有一个的时候直接返回，否则用 `Promise.all`处理再返回。
