# TypeScript

## any 和 unknown

参考链接：[阮一峰 any 类型，unknown 类型，never 类型](https://typescript.p6p.net/typescript-tutorial/any.html)

1. unknown 不能直接使用，比如赋值或者是调用属性方法
2. unknown 要在进行了类型判断之后才能进行运算/操作
3. 只能进行比较运算（运算符==、===、!=、!==、||、&&、?）、取反运算（运算符!）、typeof运算符和instanceof运算符这几种，其他运算都会报错

## TypeScript 技巧

参考链接：[每个开发人员都应该知道的 20 个 TypeScript 技巧](https://juejin.cn/post/7429384221670735881)

## 组件库 ts ref 类型注解

`type ElUploadType = InstanceType<typeof ElUpload>`

参考链接：[为组件模板引用标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)

### ts 项目实践

参考链接：[ts 项目实践](https://juejin.cn/post/6970841540776329224)

1. 条件类型

```ts
type A<T> = T extends string ? number : string

const a1: A<string> = 1
const a2: A<string> = '1' // error
const a3: A<number> = '1'
```

2. 命名空间(namespace)--可以在实际业务开发中使用

```ts
a(1) === '1'
a(1) === 1 // error
a('1') === 1
a(undefined) // error

declare namespace A {
    type name = string
}
namespace A {
    export type name = string
}
const a = ref<A.name>(1) // error
```

3. 模板字符串类型

```ts
declare type HTTP = `http://${string}`
declare type HTTPS = `https://${string}`

type baseApi = HTTP | HTTPS

const url: baseApi = 'tcp://www.baidu.com' // error
```

4. 函数重载

```ts
function a(data: number): string
function a(data: string): number
function a(data: string | number): string | number {
    if (typeof data === 'number') {
        return data.toString()
    } else if (typeof data === 'string') {
        return Number(data)
    } else {
        return data
    }
}
```
