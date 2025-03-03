# TypeScript

## 基础静态类型

```js
//布尔值
let isDone: boolean = false;  

//数字 box
let decLiteral: number = 6;
let hexLiteral: number = 0xf00d;  //16
let binaryLiteral: number = 0b1010; //2
let octalLiteral: number = 0o744;  //8

//字符串
let name: string = "bob";
let name: string = `Gene`;

//数组
let list: number[] = [1, 2, 3];  //数字数组
let list: Array<number> = [1, 2, 3];  //数字数组
let a: String[] = ["谢大脚", "刘英", "小红"];  //字符串数组
const b: (string | number)[] = ["a", "teacher", 28];  //字符串或数组数组

//元组 Tuple
//每个元素类型的位置给固定住了，这就叫做元组
const c: [string, string, number] = ["a", "teacher", 28]; 

//枚举
//默认情况下，从0开始为元素编号。 你也可以手动的指定成员的数值。
enum test {
  a = 3,
  b,
  c
}
console.log(test);  //{ '3': 'a', '4': 'b', '5': 'c', a: 3, b: 4, c: 5 }

//Any
//代表任意类型
let a: any
a = 1
a = "1"
a = false
//还可以
let a:any[]

//Void
/*
某种程度上来说，void类型像是与any类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void：
*/
function warnUser(): void {
    console.log("This is my warning message");
}
//声明一个void类型的变量没有什么大用，因为你只能为它赋予undefined和null：
let unusable: void = undefined;

//Null 和 Undefined
/* TypeScript里，undefined和null两者各自有自己的类型分别叫做undefined和null。 和 void相似，它们的本身的类型用处不是很大：*/
let u: undefined = undefined;
let n: null = null;

//Never
//ever类型表示的是那些永不存在的值的类型。
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
    throw new Error(message);
}
// 推断的返回值类型为never
function fail() {
    return error("Something failed");
}
// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
    while (true) {
    }
}

//Object
```

### 类型断言

将默认的类型视作另一种

```ts
//“尖括号”语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length; //将默认的string类型视作number

//as语法
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

当你在TypeScript里使用JSX时，只有 `as`语法断言是被允许的。

## 接口

```tsx
interface person {
  name: string;
  [organName: string]: string | number | Function; //这里自定义的类型同样约束接口其它属性
  say(): string;  //say返回值为字符串
  hair?: number;  //？为可选
}

function test(mm: person): string {
  return mm.name
}
test({
  name: "路飞",
  say() { return "我要成为海贼王！" },
  hair: 9999,
  like: "meat"
})

//class可以使用implements继承接口
//需要进行补全
class classTest implements person {
  [organName: string]: string | number | Function; //好像可以用接口语法
  hair?: number;
  name = "class";
  say() {
    return "im class"
  }
}

//单继承
interface man extends person {
  name: "索隆"
}

interface gird { }
// 多继承
interface daughter extends gird, person { }//这里daughter不能同时继承man和person
```

## 类

```ts
/**
 * public（默认）: 公有，可以在任何地方被访问。
 * protected: 受保护，可以被其自身以及其子类和父类访问。
 * private: 私有，只能被其定义所在的类访问。
 * readonly: 只读。
 * static: 可以使方法不用new，直接使用
 */
class Person {
  type: string;  //要想声明，才能在constructor中赋值
  // constructor(public type: string) //也可以在构造器中声明
  className = "person"; //也可以直接声明并赋值

  // public className = "person"; //public 为默认，无影响
  // protected className = "person"; //子类可以访问
  //private className = "person"; //当用上private关键字子类不能访问也不能重写

  // public readonly className = "不可写"; //使用readonly关键字为不可写，只读
  constructor(type: string) {
    this.type = type
  };

  //setter getter
  //这个不能在子类的重写的使用，因为类型会改变，变成变量
  get sayName() {
    return "get"
  };
  set sayName(newVal: string) {
    console.log(`set ${newVal}`);
  }
}

//extends
class Man extends Person { //Man有Person上的全部属性和方法
  className = "man"  //变量也一样可以重写

  say() { //子类可以添加方法
    //super.sayName(); //可以通过super关键字访问父类的方法
  }

  //重写
  // sayName() { //重写，在子类中写相同命名的方法可以覆盖父类的方法
  //   console.log("Man.sayName");
  // }
}

let man = new Man("man");
man.className = "ok" //属性是可以被改变的
```

> 抽象类

```ts
abstract class 抽象类 {
  constructor() {

  }
  abstract cx(): void
  abstract attr: any
}

class a extends 抽象类 {
  cx() {  //子类必须重写抽象方法
    return 1
  }
  attr: string //方法也一样
}
```

## tsconfig.json

## 泛型

```ts
function fn<T>(params: T) {
  console.log(typeof params);

}

fn<string>("1")

// 多个泛型
function fn<T, P>(t: T, p: P) {
  console.log(t, p);
}
fn<boolean, number>(true, 66)

//数组
function fn<T>(arr: T[]) {
  console.log(arr);
}
fn<number>([1, 3, 5])

//继承
interface name {
  name: string
}
class Test<T extends name> { //可以使用extends进行继承
  constructor(public type: T) { //在构造器中使用关键字可以进行声明

  }
  log(): T {
    return this.type
  }
}
let t = new Test({ name: "test" })
```

## 命名空间

在`page.ts`文件里，写出下面的代码：

```js
class Header {
  constructor() {
    const elem = document.createElement("div");
    elem.innerText = "This is Header";
    document.body.appendChild(elem);
  }
}

class Content {
  constructor() {
    const elem = document.createElement("div");
    elem.innerText = "This is Content";
    document.body.appendChild(elem);
  }
}

class Footer {
  constructor() {
    const elem = document.createElement("div");
    elem.innerText = "This is Footer";
    document.body.appendChild(elem);
  }
}

class Page {
  constructor() {
    new Header();
    new Content();
    new Footer();
  }
}
```

写完后我们用`tsc`进行编译一次，然后修改`index.html`文件，在`<body>`标签里引入`<script>`标签，并实例化`Page`，代码如下:

```js
<body>
  <script>new Page();</script>
</body>
```

这时候再到浏览器进行预览，就可以看到对应的页面被展现出来了。看起来没有什么问题，但是有经验的程序员就会发现，这样写全部都是全局变量（通过查看`./build/page.js`文件可以看出全部都是`var`声明的变量）。**过多的全局变量会让我们代码变的不可维护。**

这时候你在浏览器的控制台(`Console`)中，分别输入`Header`、`Content`、`Footer`和`Page`都时可以拿到对应的变量的,说明他们全都是全局变量。

其实你理想的是，只要有`Page`这个全局变量就足够了，剩下的可以模块化封装起来，不暴露到全局。

[命名空间的使用](https://jspang.com/detailed?id=63#toc393)

`命名空间`这个语法，很类似编程中常说的模块化思想，比如`webpack`打包时，每个模块有自己的环境，不会污染其他模块,不会有全局变量产生。命名空间就跟这个很类似，注意这里是类似，而不是相同。

命名空间声明的关键词是`namespace` 比如声明一个`namespace Home`,需要暴露出去的类，可以使用`export`关键词，这样只有暴漏出去的类是全局的，其他的不会再生成全局污染了。修改后的代码如下：

```js
namespace Home {
  class Header {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Header";
      document.body.appendChild(elem);
    }
  }

  class Content {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Content";
      document.body.appendChild(elem);
    }
  }

  class Footer {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Footer";
      document.body.appendChild(elem);
    }
  }

  export class Page {
    constructor() {
      new Header();
      new Content();
      new Footer();
    }
  }
}
```

TS 代码写完后，再到`index.html`文件中进行修改，用命名空间的形式进行调用，就可以正常了。 写完后，记得用`tsc`编译一下，当然你也可以使用`tsc -w`进行监视了，只要有改变就会进行重新编译。

```js
new Home.Page();
```

现在再到浏览器中进行查看，可以看到现在就只有`Home.Page`是在控制台可以得到的，其他的`Home.Header`...这些都是得不到的，说明只有`Home.Page`是全局的，其他的都是模块化私有的。

这就是 TypeScript 给我们提供的类似模块化开发的语法，它的好处就是让全局变量减少了很多，实现了基本的封装，减少了全局变量的污染。

上节课的代码虽实现了模块化和全局变量的污染，但是我们工作中分的要更细致一些，会单独写一个`components`的文件，然后进行组件化。

在`src`目录下新建一个文件`components.ts`，编写代码如下：

```js
namespace Components {
  export class Header {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Header";
      document.body.appendChild(elem);
    }
  }

  export class Content {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Content";
      document.body.appendChild(elem);
    }
  }

  export class Footer {
    constructor() {
      const elem = document.createElement("div");
      elem.innerText = "This is Footer";
      document.body.appendChild(elem);
    }
  }
}
```

这里需要注意的是，我每个类(`class`)都使用了`export`导出，导出后就可以在`page.ts`中使用这些组件了。比如这样使用-代码如下。

```js
namespace Home {
  export class Page {
    constructor() {
      new Components.Header();
      new Components.Content();
      new Components.Footer();
    }
  }
}
```

这时候你可以使用`tsc`进行重新编译，但在预览时，你会发现还是会报错，找不到`Components`,想解决这个问题，我们必须要在`index.html`里进行引入`components.js`文件。

```js
<script src="./build/page.js"></script>
<script src="./build/components.js"></script>
```

这样才可以正常的出现效果。但这样引入太麻烦了，可不可以像`webpack`一样，只生成一个文件那？那答案是肯定的。

[多文件编译成一个文件](https://jspang.com/detailed?id=63#toc396)

直接打开`tsconfig.json`文件，然后找到`outFile`配置项，这个就是用来生成一个文件的设置，但是如果设置了它，就不再支持`"module":"commonjs"`设置了，我们需要把它改成`"module":"amd"`,然后在去掉对应的`outFile`注释，设置成下面的样子。

```js
{
  "outFile": "./build/page.js"
}
```

配置好后，删除掉`build`下的`js`文件，然后用`tsc`进行再次编译。

然后删掉`index.html`文件中的`component.js`,在浏览器里还是可以正常运行的。

[子命名空间](https://jspang.com/detailed?id=63#toc397)

也就是说在命名空间里，再写一个命名空间,比如在`Components.ts`文件下修改代码如下。

```js
namespace Components {
  export namespace SubComponents {
    export class Test {}
  }

  //something ...
}
```

写完后在控制台再次编辑`tsc`，然后你在浏览器中也是可以查到这个命名空间的`Components.SubComponents.Test`(需要刷新页面后才会显示)。

## 环境搭建

1. 建立好文件夹后，打开 VSCode，把文件夹拉到编辑器当中，然后打开终端，运行`npm init -y`,创建`package.json`文件。
2. 生成文件后，我们接着在终端中运行`tsc -init`,生成`tsconfig.json`文件。
3. 新建`src`和`build`文件夹，再建一个`index.html`文件。
4. 在`src`目录下，新建一个`page.ts`文件，这就是我们要编写的`ts`文件了。
5. 配置`tsconfig.json`文件，设置`outDir`和`rootDir`(在 15 行左右)，也就是设置需要编译的文件目录，和编译好的文件目录。
6. 然后编写`index.html`，引入`<script src="./build/page.js"></script>`,当让我们现在还没有`page.js`文件。
7. 编写`page.ts`文件，加入一句输出`console.log('aa.com')`,再在控制台输入`tsc`,就会生成`page.js`文件
8. 再到浏览器中查看`index.html`文件，如果按`F12`可以看到`aa.com`，说明我们的搭建正常了。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="./build/page.js"></script>
    <title>Document</title>
  </head>
  <body></body>
</html>
```

## 命令行基本命令

```ts
//第一种
tsc demo.ts
node demo.js

//第二种
//npm install -g ts-node
ts-node demo.ts
```

## class、type、interface的异同

**相同：**

interface:

```ts
//对象
interface User {
  name: string
  age: number
}
//函数
interface SetUser {
  (name: string, age: number): void;
}

//继承
interface Name { 
  name: string; 
}
interface User extends Name { 
  age: number; 
}

```

type:

```ts
//对象
type User = {
  name: string
  age: number
};

//函数
type SetUser = (name: string, age: number): void;

//继承
type Name = { 
  name: string; 
}
type User = Name & { age: number };
```

混用：

```ts
//interface extends type
type Name = { 
  name: string; 
}
interface User extends Name { 
  age: number; 
}

//type extends interface
interface Name { 
  name: string; 
}
type User = Name & { 
  age: number; 
}

```

**不同点：**

1. class、interface必须是对象，type 可以声明基本类型别名，联合类型，元组等类型

    ```ts
    // 基本类型别名
    type Name = string
    
    // 联合类型
    interface Dog {
      wong();
    }
    interface Cat {
      cat();
    }
    
    type Pet = Dog | Cat   //Pet 是Dog或Cat
    
    // 具体定义数组每个位置的类型
    type PetList = [Dog, Pet]
    ```

2. type 语句中还可以使用 typeof 获取实例的 类型进行赋值。**还可以对vue组件使用，生成组件类型**

    ```ts
    // 当你想获取一个变量的类型时，使用 typeof
    let div = document.createElement('div');
    type B = typeof div
    
    //其他骚操作
    type StringOrNumber = string | number; 
    type Text = string | { text: string }; 
    type NameLookup = Dictionary<string, Person>; 
    type Callback<T> = (data: T) => void; 
    type Pair<T> = [T, T]; 
    type Coordinates = Pair<number>; 
    type Tree<T> = T | { left: Tree<T>, right: Tree<T> };
    ```

3. interface 能够声明合并

    ```ts
    interface User {
      name: string
      age: number
    }
      
    interface User {
      sex: string
    }
      
    /*
    User 接口为 {
      name: string
      age: number
      sex: string 
    }
    let a: User = { name: "1", age: 11, sex: "nan" }
    */
    ```

## es6与ts中class

es6中class的constructor使用属性是不用在外面定义的，ts要在外面定义，或者在构造器中使用关键字。

## getter访问private属性

可以用getter方法访问父类中的private属性

```ts
class bb {
  private name: string
  constructor(name: string) {
    this.name = name
  }
  get getName() {
    return this.name
  }
}

class son extends bb {
  constructor() {
    super("son")
  }
}

let s = new son()
console.log(s.getName);   //son
```

## 更改readonly属性

```ts
//readonly可以在构造器中更改
class bb {
  readonly _name: string = "name"
  constructor(name: string) {
    this._name = name
  }
}

let b = new bb("66")
console.log(b._name);
```

## 类型别名

```ts
type Lady = { name: string, age: Number };

const aaa: Lady[] = [
  { name: "刘英", age: 18 },
  { name: "谢大脚", age: 28 },
];
```

## any 和 unknown

[any](https://typescript.p6p.net/typescript-tutorial/any.html)

1. `unknown` 不能直接使用，比如赋值或者是调用属性方法
2. `unknown` 要在进行了类型判断之后才能进行运算/操作
3. 只能进行比较运算（运算符==、===、!=、!==、||、&&、?）、取反运算（运算符!）、`typeof` 运算符和 `instanceof` 运算符这几种，其他运算都会报错
