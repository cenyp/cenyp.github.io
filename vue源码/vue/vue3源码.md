本文 vue3 版本为 3.2.41，会对源码做简化，方便阅读

# 以 reactive 为切入点探讨响应式及依赖搜集

预备知识：

1. vue2 的响应式是通过发布订阅模式完成的，在 get 里面搜集依赖，在 set 里面触发依赖；vue3 的大体模式也差不多
2. vue2 的依赖搜集是 dep + watcher 作双向依赖搜集完成的；vue3 是建立全局的 WeakMap 结构完成，以劫持监听的 obj 为 key，value 是一个 Map 类型，以属性名为 key，value 是一个 Set 类型，Set 里面存放的是 effect 函数，effect 就是副作用函数，用来更新

![输入图片说明](../../image/flowchart.png)

## reactive

```ts
// packages\reactivity\src\reactive.ts
export function reactive(target: object) {
  // 调用 createReactiveObject 方法创建 reactive
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  // WeakMap 是类似 map 的数据结构，只能使用对象作为键，不能使用基本数据类型。
  // 并且是弱引用，当只有 WeakMap 引用时，它会被垃圾回收，WeakMap 中对应的条目也会被自动删除
  proxyMap: WeakMap<Target, any> 
) {
  // 看缓存有没有，有直接返回
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 这里会判断类型，对象和数组会返回1
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  // 用 Proxy 做数据劫持，会传入 baseHandlers，即上面的 mutableHandlers
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  // 缓存
  proxyMap.set(target, proxy);
  return proxy;
}
```

```ts
// packages\reactivity\src\baseHandlers.ts
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys,
};
const get = /*#__PURE__*/ createGetter(); // 这里先看 get
const set = /*#__PURE__*/ createSetter();

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // ...省略部分代码
    track(target, TrackOpTypes.GET /** get */, key);

    // 扩展  shallowReactive api 做浅层响应，不会循环处理对象
    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      // 对对象要循环处理
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}
```

```ts
// packages\reactivity\src\effect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (shouldTrack && activeEffect) {
    // targetMap 是 WeakMap 结构，以劫持监听的 obj 为 key，value 是一个 Map 类型
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    // depsMap 是 Map 结构，以属性名为 key，value 是一个 Set 类型
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = createDep()));
    }

    const eventInfo = __DEV__
      ? { effect: activeEffect, target, type, key }
      : undefined;

    trackEffects(dep, eventInfo);
  }
}
export function trackEffects(
  dep: Dep,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
  /** 做双向绑定
    * activeEffect 是当前运行的 ReactiveEffect 实例
    * 类似 vue2 中 watcher 和 dep 双向搜集依赖
    * 在这里打印 activeEffect.fn 
    * 控制台显示 componentUpdateFn 函数，正是渲染相关的
    *  if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrap…
    * 比如 
        const obj = reactive({ name: '张三' });
        const com = computed(() => obj.name);
    * 在页面渲染获取 com 时会触发 obj 的 get，这时候 activeEffect 就是 com
    * activeEffect.fn 就是 () => obj.name
    */
  // todo 这里猜测 ReactiveEffect 有渲染、计算和监听类型
  dep.add(activeEffect!);
  activeEffect!.deps.push(dep);
}
```

讲回 set 方法处理

```ts
// packages\reactivity\src\baseHandlers.ts
const set = /*#__PURE__*/ createSetter();
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key];
    // 判断是增加属性/值，还是更新
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    // 更新对应的值
    const result = Reflect.set(target, key, value, receiver);
    // 避免原型链属性修改触发
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }
    return result;
  };
}
```

```ts
// packages\reactivity\src\effect.ts
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  // 从之前搜集的全局依赖获取
  const depsMap = targetMap.get(target);

  let deps: (Dep | undefined)[] = [];

  // 下面就是根据不同情况，获取要触发更新的 dep
  // schedule runs for SET | ADD | DELETE
  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }

  // also run for iteration key on ADD | DELETE | Map.SET
  switch (type) {
    case TriggerOpTypes.ADD:
      if (!isArray(target)) {
        deps.push(depsMap.get(ITERATE_KEY/** '' */));
        if (isMap(target)) {
          deps.push(depsMap.get(MAP_KEY_ITERATE_KEY/** '' */));
        }
      } else if (isIntegerKey(key)) {
        // new index added to array -> length changes
        deps.push(depsMap.get("length"));
      }
      break;
    case TriggerOpTypes.SET:
      if (isMap(target)) {
        deps.push(depsMap.get(ITERATE_KEY/** '' */));
      }
      break;
  }

  if (deps.length === 1) {
    if (deps[0]) {
      triggerEffects(deps[0]);
    }
  } else {
    const effects: ReactiveEffect[] = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    // createDep 返回的是一个 Set 集合，做过滤
    triggerEffects(createDep(effects));
  }
}
export function triggerEffects(
  dep: Dep | ReactiveEffect[]
) {
  // spread into array for stabilization
  const effects = isArray(dep) ? dep : [...dep]
  // 先处理计算属性api
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}
function triggerEffect(
  effect: ReactiveEffect,
) {
  // 执行 effect.run()，触发更新
  // run 就是 执行 fn()，即上面分享的 计算属性内容/渲染函数
  if (effect !== activeEffect || effect.allowRecurse) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

```

## ref
```ts
// packages\reactivity\src\ref.ts
export function ref(value?: unknown) {
  return createRef(value, false)
}
function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    /**
     * toReactive 判断是否是对象，如果是对象，则使用 reactive，否则直接返回
     * 即对象类型的 ref 会使用 reactive，非对象类型用 class 处理
     * isObject(value) ? reactive(value) : value
     */
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, newVal)
    }
  }
}

export function trackRefValue(ref: RefBase<any>) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref)
    // trackEffects 上面有讲，做了双向依赖收集
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref: RefBase<any>, newVal?: any) {
  ref = toRaw(ref)
  if (ref.dep) {
    // triggerEffects 上面有讲，触发对应的依赖
    triggerEffects(ref.dep)
  }
}
```

## reactive 与 ref 区别
1. 处理的数据类型不同
2. ref定义的变量可以做直接赋值全部替换，本周是多套了一层 `{_value:xxx}`
3. ref定义的变量，需要通过 `.value` 访问，reactive定义的变量直接访问
4. ref 对普通数据类型做了优化，不用依赖于 proxy

1. ref 和 reactive 都有解构的风险

# scoped 如何实现 css 作用域
[掉了两根头发后，我悟了！vue3的scoped原来是这样避免样式污染（上）](https://juejin.cn/post/7384633860520083508)

[掉了两根头发后，我悟了！vue3的scoped原来是这样避免样式污染（下）](https://juejin.cn/post/7386875278423982115)

通过增加自定义属性 data-v-x 配合 css 的属性选择器完成作用域处理，data-v-x 会生成唯一 id

- html 增加自定义属性 data-v-x
  + 编译时：根据 vue 文件路径和文件 code，利用 node 的 createHash 函数生成唯一 id，即 data-v-x 里面的 x；给编译后的vue组件对象增加一个属性__scopeId，属性值就是data-v-x。`const kt=Me(rt,[["__scopeId","data-v-ab97a25e"]]);export{kt as default};`
  + 运行时：在 mountElement 函数生成 DOM 时，调用 setAttribute 方法给标签设置自定义属性 data-v-x，即传入的 __scopeId
- CSS 选择器添加对应的属性选择器 [data-v-x]
  + 编译时：同样生成唯一 id，然后替换掉原来的选择器。

> 题外：
css 的 v-bind 原理就是 css 的自定义变量，生成自定义变量，在使用 v-bind 的地方用 var() 处理

```css
:root {
  // css 变量属性名需要以两个减号（--）开始
  --text-color: 16px;
}
p {
  color: var(--text-color); // 使用
}
```









