# vue-router 源码

参考链接:

[vue-router 源码解析上](https://juejin.cn/post/6880529850159874062)

[vue-router 源码解析中](https://juejin.cn/post/6901047675227996167)

[vue-router 源码解析下](https://juejin.cn/post/6902992939115855880)

## push 如何实现路由切换

以 `history` 模式为例，源码大概实现如下；可以看到是调用了 `transitionTo` 方法来做路由页面的切换，`pushState` 方法处理页面栈，`handleScroll` 方法处理页面滚动

```js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      pushState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }
```

其中 `pushState` 实现如下，主要时利用 `replaceState`、`pushState` 方法来处理路由栈。

```js
if (replace) {
  history.replaceState({ key: _key }, "", url);
} else {
  _key = genKey();
  history.pushState({ key: _key }, "", url);
}

// hash 也是同样调用上面的方法
function pushHash(path) {
  if (supportsPushState) {
    pushState(getUrl(path));
  } else {
    window.location.hash = path;
  }
}

// 替换hash记录
function replaceHash(path) {
  if (supportsPushState) {
    replaceState(getUrl(path));
  } else {
    window.location.replace(getUrl(path));
  }
}
```

`supportsPushState` 判断浏览器是否支持 `pushState`，不支持则使用 `hash` 模式

```js
export const supportsPushState =
  inBrowser &&
  (function () {
    const ua = window.navigator.userAgent;

    if (
      (ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) &&
      ua.indexOf("Mobile Safari") !== -1 &&
      ua.indexOf("Chrome") === -1 &&
      ua.indexOf("Windows Phone") === -1
    ) {
      return false;
    }

    return window.history && "pushState" in window.history;
  })();
```

回到 `transitionTo`，主要是做了路由组件的切换，和路由数据的更新，以及路由守卫的触发。

`confirmTransition`，主要根据 `url` 变化，处理所有要触发的路由守卫，可以参考[路由守卫](https://juejin.cn/post/6901047675227996167#heading-12)，不细说

```js
  transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // 获取路由信息
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
      // 触发路由守卫
      this.updateRoute(route)
      onComplete && onComplete(route)
      // 修改路由栈
      this.ensureURL()

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => { cb(route) })
      }
    }, err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
  }
```

## 用户后退前进行为监听

像 `history` 是用 `popsState` 进行监听，而 hash 也是优先使用 `popsState`，在不支持的浏览器才使用 `hashChange`

对于 `replaceState`、`pushState` 是不会触发二者的监听行为的

而 `window.location.hash` 和 `window.location.replace` 会触发上述的监听导致路由切换

所以，`hash` 和 `history` 模式在使用上有不同，但底层往往是一致的，除了在不支持 `popsState` 浏览器上

## router-view 如何渲染对应组件

在导航解析的章节，我们提过，导航解析成功后,会调用 updateRoute 方法，重新为全局的\_routerRoot.\_route 即$route 赋值

```js
// src/history/base.js

// 更新路由，触发afterEach钩子
updateRoute (route: Route) {
    const prev = this.current
    this.current = route// 更新current

    this.cb && this.cb(route) // 调用updateRoute回调，回调中会重新为_routerRoot._route赋值，进而触发router-view的重新渲染
}
```

在 `view` 组件中，会使用 `$parent.$route` 即全局的 `_routerRoot._route`

```js
render (/* h*/_, /* context*/{ props, children, parent, data }) {
    // 依赖父节点的$route，而在install.js中我们知道,所有组件访问到的$route其实都是_routerRoot._route
    // 即Vue根实例上的_route；当路由被确认后，调用updateRoute时，会更新_routerRoot._route，进而导致router-view组件重新渲染
    const route = parent.$route 
}
```

而在 `install.js` 的全局混入中，将 `_route` 定义为响应式的，依赖了 `_route` 的地方，在 `_route` 发生变化时，都会重新渲染

`defineReactive` 方法就是 `vue/core` 里面劫持对象的方法，当 `_route` 发生变化时，所有依赖 `_route` 的地方都会重新渲染

```js
// 注册全局混入
Vue.mixin({
  beforeCreate() {
    // 响应式定义_route属性，保证_route发生变化时，组件(router-view)会重新渲染
    Vue.util.defineReactive(this, "_route", this._router.history.current);
  },
});
```

## $router 和 $store 注入

`vue2` 中为什么能在每个组件中直接使用 `this.$router` 和 `this.$store`

```js
// install 插件初始化中执行
// 在Vue原型上注入$router、$route属性，方便在vue实例中通过this.$router、this.$route快捷访问
Object.defineProperty(Vue.prototype, "$router", {
  get() {
    return this._routerRoot._router;
  },
});

Object.defineProperty(Vue.prototype, "$route", {
  get() {
    return this._routerRoot._route;
  },
});
```

## 如何实现路径匹配

使用了 `path-to-regexp` 这个库，这个库的作用就是将路径字符串转换为正则表达式，然后通过正则表达式进行匹配，下面是简单例子

1.转换路径到正则表达式

```js
const pathToRegexp = require("path-to-regexp");

// 定义一个路径模板
const path = "/users/:id";

// 将路径模板转换为正则表达式
const regex = pathToRegexp(path);

console.log(regex); // 输出： /^\/users\/([^\/?]+)/
```

2.使用正则表达式匹配 `URL`

```js
const pathToRegexp = require("path-to-regexp");

const path = "/users/:id";
const regex = pathToRegexp(path);

// 现在可以使用这个正则表达式来匹配 URL
const match = regex.exec("/users/123");

console.log(match); // 输出： ['/users/123', '123']
```
