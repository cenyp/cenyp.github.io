# Node

## 1. Node.js模块化

Node中，每个模块都有一个`exports`接口对象，我们需要把公共的方法或者字符串挂载在这个接口对象中，其他的模块才可以使用。

> Node.js中只有模块作用域，默认两个模块之间的变量，方法互不冲突，互不影响，这样就导致一个问题，我们怎样使用加载进来的模块中的方法呢？这就需要在另外一个模块`exports`接口对象中挂载模块中公共的方法。

**Node.js中模块的分类：**

- 核心模块（已经封装好的内置模块）；
- 自己定义的模块；
- 第三方的模块（npm下载下来的）；

### 1.1 require

`require`函数用来在一个模块中引入另外一个模块。传入一个模块名，返回一个模块导出对象。用法：`let cc = require("模块名")` ，其中模块名可以用绝对路径也可以用相对路径,模块的后缀名.js可以省略。例如：

```js
let cc1 = require('./main.js')
let cc2 = require('home/src/main.js')
let cc3 = require('./main')
```

`require()`函数用两个作用：

- 执行导入的模块中的代码；
- 返回导入模块中的接口对象；

### 1.2 exports

`exports`对象用来导出当前模块的公共方法或属性，别的模块通过`require`函数使用当前模块时得到的就是当前模块的`exports`对象。用法：`exports.name`,`name`为导出的对象名。例子：

```js
exports.add = function () {
  let i = 0
  console.log(++i)
}

// 导出一个add方法供其他模块使用
```

>其实`exports`类似于ES6中的`export`的用法，用来导出一个指定名字的对象。

### 1.3 module.exports

`module.exports`用来导出一个默认对象，没有指定对象名，常见于修改模块的原始导出对象。比如原本模块导出的是一个对象，我们可以通过module.exports修改为导出一个函数。如下：

```js
module.exports = function () {
  console.log('hello world！')
}
```

### 1.4 模块的初始化

一个模块中的JS代码仅在模块**第一次被使用时**执行一次，并且在使用的过程中进行*初始化*，之后缓存起来便于后续继续使用。

### 1.5 主模块

通过命令行参数传递给NodeJS以启动程序的模块被称为主模块。主模块负责调度组成整个程序的其它模块完成工作。例如通过以下命令启动程序时，`main.js`就是主模块。

```js
node main.js // 运行main.js启动程序，main.js称为主模块
```

完整实例：

在项目中我们有个`hello.js`文件，里面定义了一个求和的函数

```js
var a = 1;

function add () {
  return ++a;
}

exports.add = add
```

我们在项目的主模块 `main.js`中引入`hello.js`

```js
var add1 = require('./hello')
var add2 = require('./hello')

console.log(add1.add())
console.log(add2.add())
```

该程序运行的结果如下：

``` js
node main.js
// 2
// 3
```

我们可以看到`hello.js`并没有别引入两次而初始化两次，说明模块只会在执行的过程中被初始化一次。

### 1.6 module.exports和exports的区别

这样子是没有什么问题的，下面的就不行了，因为`exports`的指向改变了

`exports`是指向`module.exports`的，可以用 `.属性`的方法来导出，直接赋值会改变`exports`的指向，这样写是导不出去的。

>1. `module.exports`像是`exports`的大哥，当`module.exports`以`{}`整体导出时会覆盖`exports`的属性和方法
>2. 注意，若只是将属性/方法挂载在`module.exports.`/`exports.`上时，`exports.id=1`和`module.exports.id=100`，`module.exports.id=function(){}`和`exports.id=function(){}`，最后id的值取决于`exports.id`和`module.exports.id`的顺序，谁在后，就是最后的值

```js
exports.name = function(x){
  console.log(x);
};

//和下面这个一毛一样，因为都是修改的同一内存地址里的东西
module.exports.name = function(x){
  console.log(x);
};
```

```js
exports = function(x){
  console.log(x);
};

//上面的 function是一块新的内存地址，导致exports与module.exports不存在任何关系,而require方能看到的只有module.exports这个对象,看不到exports对象,所以这样写是导不出去的。

//下面的写法是可以导出去的。说句题外话，module.exports除了导出对象，函数,还可以导出所有的类型,比如字符串、数值等。

module.exports = function(x){
  console.log(x);
};
```

### 1.7 require加载第三方包的规则

Node.js 中使用`CommonJs`模块化机制，通过`npm`下载的第三方包，我们在项目中引入第三方包都是：`let xx = require('第三方包名')`，究竟`require`方法加载第三方包的原理机制是什么，今天我们来探讨下。

1. `require('第三方包名')`优先在加载该包的模块的同级目录`node_modules`中查找第三方包。

    ```js
    let template = require('art-template') //加载第三方包
    ```

2. 找到该第三方包中的`package.json`文件，并且找到里面的`main`属性对应的入口模块，该入口模块即为加载的第三方模块。
3. 如果在要加载的第三方包中没有找到`package.json`文件或者是`package.json`文件中没有`main`属性，则默认加载第三方包中的`index.js`文件。
4. 如果在加载第三方模块的文件的同级目录没有找到`node_modules`文件夹，或者以上所有情况都没有找到，则会向上一级父级目录下查找`node_modules`文件夹，查找规则如上一致。
5. 如果一直找到该模块的磁盘根路径都没有找到，则会报错：`can not find module xxx`。

### 1.8 npm

常见的npm命令总结如下：

1. `npm -v`：查看npm版本。
2. `npm init`：初始化后会出现一个`package.json`配置文件。可以在后面加上`-y` ，快速跳过问答式界面。
3. `npm install`：会根据项目中的`package.json`文件自动下载项目所需的全部依赖。
4. `npm install 包名 --save-dev`(`npm install 包名 -D`)：安装的包只用于开发环境，不用于生产环境，会出现在`package.json`文件中的`devDependencies`属性中。
5. `npm install 包名 --save`(`npm install 包名 -S`)：安装的包需要发布到生产环境的，会出现在package.json文件中的`dependencies`属性中。
6. `npm list`：查看当前目录下已安装的node包。
7. `npm list -g`：查看全局已经安装过的node包。
8. `npm --help`：查看npm帮助命令。
9. `npm update 包名`：更新指定包。
10. `npm uninstall 包名`：卸载指定包。
11. `npm config list`：查看配置信息。
12. `npm 指定命令 --help`：查看指定命令的帮助。
13. `npm info 指定包名`：查看远程npm上指定包的所有版本信息。
14. `npm config set registry https://registry.npm.taobao.org`： 修改包下载源，此例修改为了淘宝镜像。
15. `npm root`：查看当前包的安装路径。
16. `npm root -g`：查看全局的包的安装路径。
17. `npm ls 包名`：查看本地安装的指定包及版本信息，没有显示empty。
18. `npm ls 包名 -g`：查看全局安装的指定包及版本信息，没有显示empty。

## 2. fs文件模块

该`fs`模块提供了许多非常有用的功能来访问文件系统并与文件系统进行交互。

无需安装。作为Node.js核心的一部分，可以通过简单地要求它来使用它：

```js
const fs = require('fs')
```

一旦这样做，您就可以访问其所有方法，包括：

- `fs.access()`：检查文件是否存在，Node.js可以使用其权限访问它
- `fs.appendFile()`：将数据附加到文件。如果文件不存在，则创建它
- `fs.chmod()`：更改通过传递的文件名指定的文件的权限。相关阅读：`fs.lchmod()`，`fs.fchmod()`
- `fs.chown()`：更改由传递的文件名指定的文件的所有者和组。相关阅读：`fs.fchown()`，`fs.lchown()`
- `fs.close()`：关闭文件描述符
- `fs.copyFile()`：复制文件
- `fs.createReadStream()`：创建可读的文件流
- `fs.createWriteStream()`：创建可写文件流
- `fs.link()`：创建指向文件的新硬链接
- `fs.mkdir()`： 新建一个文件夹
- `fs.mkdtemp()`：创建一个临时目录
- `fs.open()`：设置文件模式
- `fs.readdir()`：读取目录的内容
- `fs.readFile()`：读取文件的内容。有关：`fs.read()`
- `fs.readlink()`：读取符号链接的值
- `fs.realpath()`：将相对文件路径指针（`.`，`..`）解析为完整路径
- `fs.rename()`：重命名文件或文件夹
- `fs.rmdir()`：删除文件夹
- `fs.stat()`：返回由传递的文件名标识的文件的状态。相关阅读：`fs.fstat()`，`fs.lstat()`
- `fs.symlink()`：创建指向文件的新符号链接
- `fs.truncate()`：将传递的文件名标识的文件截断为指定的长度。有关：`fs.ftruncate()`
- `fs.unlink()`：删除文件或符号链接
- `fs.unwatchFile()`：停止监视文件上的更改
- `fs.utimes()`：更改通过传递的文件名标识的文件的时间戳。有关：`fs.futimes()`
- `fs.watchFile()`：开始监视文件上的更改。有关：`fs.watch()`
- `fs.writeFile()`：将数据写入文件。有关：`fs.write()`

### 2.1 open()文件描述符

在与位于文件系统中的文件进行交互之前，您必须获取文件描述符。

文件描述符是使用模块`open()`提供的方法通过打开文件返回的内容`fs`：

```js
const fs = require('fs')

fs.open('/Users/joe/test.txt', 'r', (err, fd) => {
  //fd is our file descriptor
})
```

注意`r`我们用作`fs.open()`调用的第二个参数。

该标志意味着我们打开文件进行读取。

您通常会使用的其他标志是

- `r+` 打开文件进行读写
- `w+`打开文件以进行读写，将流放在文件的开头。如果不存在则创建文件
- `a`打开要写入的文件，将流放在文件末尾。如果不存在则创建文件
- `a+`打开文件进行读写，将流放在文件末尾。如果不存在则创建文件

您也可以使用`fs.openSync`方法打开文件，该方法返回文件描述符，而不是在回调中提供它：

```js
const fs = require('fs')

try {
  const fd = fs.openSync('/Users/joe/test.txt', 'r')
} catch (err) {
  console.error(err)
}
```

一旦获得文件描述符，就可以以任何选择的方式执行所有需要它的操作，例如调用`fs.open()`以及与文件系统交互的许多其他操作。

### 2.2 stat() Node.js 文件属性

每个文件都带有一组详细信息，我们可以使用Node.js进行检查。

特别是使用模块`stat()`提供的方法`fs`。

您称它为传递文件路径，一旦Node.js获得文件详细信息，它将调用您传递的回调函数，带有两个参数：一条错误消息和文件统计信息：

```js
const fs = require('fs')
fs.stat('/Users/joe/test.txt', (err, stats) => {
  if (err) {
    console.error(err)
    return
  }
  //we have access to the file stats in `stats`
})
```

Node.js还提供了一个同步方法，该方法将阻塞线程，直到文件状态准备就绪为止：

```js
const fs = require('fs')
try {
  const stats = fs.statSync('/Users/joe/test.txt')
} catch (err) {
  console.error(err)
}
```

文件信息包含在stats变量中。我们可以使用这些统计信息提取哪些信息？

很多，包括：

- 如果文件是目录或文件，请使用`stats.isFile()`和`stats.isDirectory()`
- 如果文件是符号链接，则使用 `stats.isSymbolicLink()`
- 使用的文件大小（以字节为单位）`stats.size`。

还有其他一些高级方法，但是您在日常编程中将使用的大部分内容是这样的。

```js
const fs = require('fs')
fs.stat('/Users/joe/test.txt', (err, stats) => {
  if (err) {
    console.error(err)
    return
  }

  stats.isFile() //true
  stats.isDirectory() //false
  stats.isSymbolicLink() //false
  stats.size //1024000 //= 1MB
})
```

### 2.3 readFile() 读取文件

在Node.js中读取文件的最简单方法是使用`fs.readFile()`方法，向其传递文件路径，编码和将与文件数据（以及错误）一起调用的回调函数：

```js
const fs = require('fs')

fs.readFile('/Users/joe/test.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})
```

另外，您可以使用同步版本`fs.readFileSync()`：

```js
const fs = require('fs')

try {
  const data = fs.readFileSync('/Users/joe/test.txt', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}
```

双方`fs.readFile()`并`fs.readFileSync()`返回数据之前读取该文件在内存中的全部内容。

这意味着大文件将对您的内存消耗和程序执行速度产生重大影响。

在这种情况下，更好的选择是使用流读取文件内容。

### 2.4 writeFile() 写入文件

在Node.js中写入文件的最简单方法是使用`fs.writeFile()`API。

例：

```js
const fs = require('fs')

const content = 'Some content!'

fs.writeFile('/Users/joe/test.txt', content, err => {
  if (err) {
    console.error(err)
    return
  }
  //file written successfully
})
```

另外，您可以使用同步版本`fs.writeFileSync()`：

```js
const fs = require('fs')

const content = 'Some content!'

try {
  const data = fs.writeFileSync('/Users/joe/test.txt', content)
  //file written successfully
} catch (err) {
  console.error(err)
}
```

默认情况下，此API将**替换文件的内容（**如果已经存在）。

您可以通过指定标志来修改默认值：

```js
fs.writeFile('/Users/joe/test.txt', content, { flag: 'a+' }, err => {})
```

您可能会使用的标志是

- `r+` 打开文件进行读写
- `w+`打开文件以进行读写，将流放在文件的开头。如果不存在则创建文件
- `a`打开要写入的文件，将流放在文件末尾。如果不存在则创建文件
- `a+`打开文件进行读写，将流放在文件末尾。如果不存在则创建文件

（您可以在[http://nodejs.cn/api/fs.html#fs_file_system_flags上](http://nodejs.cn/api/fs.html#fs_file_system_flags)找到更多标志）

#### 2.4.1 附加到文件

将内容附加到文件末尾的便捷方法是`fs.appendFile()`（及其`fs.appendFileSync()`对应方法）：

```js
const content = 'Some content!'

fs.appendFile('file.log', content, err => {
  if (err) {
    console.error(err)
    return
  }
  //done!
})
```

#### 2.4.2 使用流

所有这些方法都将全部内容写入文件，然后再将控件返回给程序（在异步版本中，这意味着执行回调）

在这种情况下，更好的选择是使用流写入文件内容。

### 2.5 使用文件夹

Node.js `fs`核心模块提供了许多方便的方法，可用于处理文件夹。

#### 2.5.1 检查文件夹是否存在

使用`fs.access()`检查，如果该文件夹存在和Node.js的可以用它的权限访问它。

#### 2.5.2  新建一个文件夹

使用`fs.mkdir()`或`fs.mkdirSync()`创建一个新文件夹。

```js
const fs = require('fs')

const folderName = '/Users/joe/test'

try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName)
  }
} catch (err) {
  console.error(err)
}
```

#### 2.5.3 读取目录的内容

使用`fs.readdir()`或`fs.readdirSync()`读取目录的内容。

这段代码读取文件夹和文件以及子文件夹的内容，并返回它们的相对路径：

```js
const fs = require('fs')
const path = require('path')

const folderPath = '/Users/joe'

fs.readdirSync(folderPath)
```

您可以获取完整路径：

```js
fs.readdirSync(folderPath).map(fileName => {
  return path.join(folderPath, fileName)
})
```

您还可以过滤结果以仅返回文件，并排除文件夹：

```js
const isFile = fileName => {
  return fs.lstatSync(fileName).isFile()
}

fs.readdirSync(folderPath).map(fileName => {
  return path.join(folderPath, fileName)
})
.filter(isFile)
```

#### 2.5.4 重命名文件夹

使用`fs.rename()`或`fs.renameSync()`重命名文件夹。第一个参数是当前路径，第二个参数是新路径：

```js
const fs = require('fs')

fs.rename('/Users/joe', '/Users/roger', err => {
  if (err) {
    console.error(err)
    return
  }
  //done
})
```

`fs.renameSync()` 是同步版本：

```js
const fs = require('fs')

try {
  fs.renameSync('/Users/joe', '/Users/roger')
} catch (err) {
  console.error(err)
}
```

#### 2.5.5 删除文件夹

使用`fs.rmdir()`或`fs.rmdirSync()`删除文件夹。

删除包含内容的文件夹可能比您需要的复杂。

在这种情况下，最好安装[`fs-extra`](https://www.npmjs.com/package/fs-extra)非常流行且维护良好的模块。它是该`fs`模块的直接替代品，在其之上提供了更多功能。

在这种情况下，该`remove()`方法就是您想要的。

使用安装

`npm install fs-extra`

并像这样使用它：

```js
const fs = require('fs-extra')

const folder = '/Users/joe'

fs.remove(folder, err => {
  console.error(err)
})
```

它也可以与promises一起使用：

```js
fs.remove(folder)
  .then(() => {
    //done
  })
  .catch(err => {
    console.error(err)
  })
```

或使用async / await：

```js
async function removeFolder(folder) {
  try {
    await fs.remove(folder)
    //done
  } catch (err) {
    console.error(err)
  }
}

const folder = '/Users/joe'
removeFolder(folder)
```

## 3. path模块

该`path`模块提供了许多非常有用的功能来访问文件系统并与文件系统进行交互。

无需安装。作为Node.js核心的一部分，可以通过简单地要求它来使用它：

```js
const path = require('path')
```

此模块提供的`path.sep`内容提供路径段分隔符（`\`在Windows上，以及`/`在Linux / macOS上），并且`path.delimiter`提供路径分隔符（`;`在Windows上，以及`:`在Linux / macOS上）。

这些是`path`方法：

**path.basename():**

返回路径的最后一部分。第二个参数可以过滤掉文件扩展名：

```js
require('path').basename('/test/something') //something
require('path').basename('/test/something.txt') //something.txt
require('path').basename('/test/something.txt', '.txt') //something
```

**path.dirname():**

返回路径的目录部分：

```js
require('path').dirname('/test/something') // /test
require('path').dirname('/test/something/file.txt') // /test/something
```

**path.extname():**

返回路径的扩展部分

```js
require('path').extname('/test/something') // ''
require('path').extname('/test/something/file.txt') // '.txt'
```

**path.isAbsolute():**

如果是绝对路径，则返回true

```js
require('path').isAbsolute('/test/something') // true
require('path').isAbsolute('./test/something') // false
```

**path.join():**

连接路径的两个或多个部分：

```js
const name = 'joe'
require('path').join('/', 'users', name, 'notes.txt') //'/users/joe/notes.txt'
```

**path.normalize():**

尝试在包含相对说明符（例如`.`或`..`）或双斜杠时计算实际路径：

```js
require('path').normalize('/users/joe/..//test.txt') //'/users/test.txt'
```

**path.parse():**

用组成它的段分析对象的路径：

- `root`： 根
- `dir`：从根开始的文件夹路径
- `base`：文件名+扩展名
- `name`：文件名
- `ext`：文件扩展名

例：

```js
require('path').parse('/users/test.txt')
```

结果是

```js
{
  root: '/',
  dir: '/users',
  base: 'test.txt',
  ext: '.txt',
  name: 'test'
}
```

**path.relative():**

接受2个路径作为参数。根据当前工作目录返回从第一个路径到第二个路径的相对路径。

例：

```js
require('path').relative('/Users/joe', '/Users/joe/test.txt') //'test.txt'
require('path').relative('/Users/joe', '/Users/joe/something/test.txt') //'something/test.txt'
```

**path.resolve():**

您可以使用来获得相对路径的绝对路径计算`path.resolve()`：

```js
path.resolve('joe.txt') //'/Users/joe/joe.txt' if run from my home folder
```

通过指定第二个参数，`resolve`将第一个用作第二个的基础：

```js
path.resolve('tmp', 'joe.txt') //'/Users/joe/tmp/joe.txt' if run from my home folder
```

如果第一个参数以斜杠开头，则表示它是绝对路径：

```js
path.resolve('/etc', 'joe.txt') //'/etc/joe.txt'
```

### 3.1 从路径中获取信息

给定路径，您可以使用以下方法从其中提取信息：

- `dirname`：获取文件的父文件夹
- `basename`：获取文件名部分
- `extname`：获取文件扩展名

例：

```js
const notes = '/users/joe/notes.txt'

path.dirname(notes) // /users/joe
path.basename(notes) // notes.txt
path.extname(notes) // .txt
```

您可以通过指定第二个参数来获取不带扩展名的文件名`basename`：

```js
path.basename(notes, path.extname(notes)) //notes
```

### 3.2 使用路径

您可以使用以下命令连接路径的两个或多个部分`path.join()`：

```js
const name = 'joe'
path.join('/', 'users', name, 'notes.txt') //'/users/joe/notes.txt'
```

您可以使用来获得相对路径的绝对路径计算`path.resolve()`：

```js
path.resolve('joe.txt') //'/Users/joe/joe.txt' if run from my home folder
```

在这种情况下，`Node.js`将仅追加`/joe.txt`到当前工作目录。如果指定第二个参数文件夹，`resolve`则将第一个作为第二个的基础：

```js
path.resolve('tmp', 'joe.txt') //'/Users/joe/tmp/joe.txt' if run from my home folder
```

如果第一个参数以斜杠开头，则表示它是绝对路径：

```js
path.resolve('/etc', 'joe.txt') //'/etc/joe.txt'
```

`path.normalize()`是另一个有用的函数，当它包含相对说明符（例如`.`或`..`）或双斜杠时，它将尝试计算实际路径：

```js
path.normalize('/users/joe/..//test.txt') ///users/test.txt
```

**解析和规范化都不会检查路径是否存在**。他们只是根据获得的信息来计算路径。

## 4. HTTP 服务器

```js
const http = require('http')

const port = process.env.PORT

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end('<h1>Hello, World!</h1>')
})

server.listen(port, () => {
  console.log(`Server running at port ${port}`)
})
```

让我们简要分析一下。我们包括[`http`模块](http://nodejs.cn/api/http.html)。

我们使用该模块来创建 HTTP 服务器。

服务器设置为侦听指定端口`3000`。服务器准备就绪后，将`listen`调用回调函数。

我们传递的回调函数是将在收到每个请求时执行的回调函数。每当收到新请求时，都会调用该[`request`事件](http://nodejs.cn/api/http.html#http_event_request)，并提供两个对象：一个请求（一个[`http.IncomingMessage`](http://nodejs.cn/api/http.html#http_class_http_incomingmessage)对象）和一个响应（一个[`http.ServerResponse`](http://nodejs.cn/api/http.html#http_class_http_serverresponse)对象）。

`request`提供请求的详细信息。通过它，我们访问请求标头和请求数据。

`response` 用于填充我们要返回给客户端的数据。

在这种情况下

```js
res.statusCode = 200
```

我们将 `statusCode` 属性设置为200，以指示响应成功。

我们还设置了 `Content-Type` 标头：

```js
res.setHeader('Content-Type', 'text/plain')
```

然后结束响应，将内容添加为参数`end()`：

```js
res.end('Hello World\n')
```

### 4.1 使用 Node.js 发送 HTTP 请求

#### 4.1.1 执行GET请求

```js
const https = require('https')
const options = {
  hostname: 'whatever.com',
  port: 443,
  path: '/todos',
  method: 'GET'
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()
```

#### 4.1.2  执行POST请求

```js
const https = require('https')

const data = JSON.stringify({
  todo: 'Buy the milk'
})

const options = {
  hostname: 'whatever.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()
```

#### 4.1.3 放入并删除

PUT和DELETE请求使用相同的POST请求格式，只需更改`options.method`值即可。

### 4.2 Axios

根据要使用的抽象级别，有多种方法可以在Node.js中执行HTTP POST请求。

使用Node.js执行HTTP请求的最简单方法是使用[Axios库](https://github.com/axios/axios)：

```js
const axios = require('axios')

axios
  .post('https://whatever.com/todos', {
    todo: 'Buy the milk'
  })
  .then(res => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(res)
  })
  .catch(error => {
    console.error(error)
  })
```

Axios要求使用第三方库。

尽管它比前面两个选项更冗长，但仅使用Node.js标准模块就可以发出POST请求：

```js
const https = require('https')

const data = JSON.stringify({
  todo: 'Buy the milk'
})

const options = {
  hostname: 'whatever.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()
```

### 4.3 获取 HTTP 请求的正文数据

这是在请求正文中提取以JSON发送的数据的方式。

如果使用Express，那很简单：使用`body-parser`Node.js模块。

例如，获取此请求的正文：

```js
const axios = require('axios')

axios.post('https://whatever.com/todos', {
  todo: 'Buy the milk'
})
```

这是匹配的服务器端代码：

```js
const bodyParser = require('body-parser')

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  console.log(req.body.todo)
})
```

如果您不使用Express并想在普通的Node.js中执行此操作，那么您当然需要做更多的工作，因为Express为您抽象了很多此类内容。

要理解的关键是，当您使用初始化HTTP服务器时`http.createServer()`，当服务器获取所有HTTP标头而不是请求正文时，将调用回调。

`request`在连接回调中传递的对象是流。

因此，我们必须侦听要处理的主体内容，并且该主体内容是按块处理的。

我们首先通过侦听流`data`事件获取数据，然后在数据结束时`end`，一次调用流事件：

```js
const server = http.createServer((req, res) => {
  // we can access HTTP headers
  req.on('data', chunk => {
    console.log(`Data chunk available: ${chunk}`)
  })
  req.on('end', () => {
    //end of data
  })
})
```

因此，要访问数据，假设我们希望收到一个字符串，我们必须将其放入数组中：

```js
const server = http.createServer((req, res) => {
  let data = []
  req.on('data', chunk => {
    data.push(chunk)
  })
  req.on('end', () => {
    JSON.parse(data).todo // 'Buy the milk'
  })
})
```

## 5. os操作系统模块

该模块提供了许多功能，可用于从底层操作系统和程序运行所在的计算机上检索信息并与其进行交互。

```js
const os = require('os')
```

有一些有用的属性可以告诉我们一些与处理文件有关的关键事项：

`os.EOL`给出行定界符序列。它`\n`在Linux和macOS以及`\r\n`Windows上。

`os.constants.signals` 告诉我们所有与处理过程信号相关的常量，例如SIGHUP，SIGKILL等。

`os.constants.errno` 设置错误报告的常量，例如EADDRINUSE，EOVERFLOW等。

您可以在<http://nodejs.cn/api/os.html#os_signal_constants>上阅读所有内容。

现在让我们看一下`os`提供的主要方法：

**os.arch():**

返回字符串标识底层架构，比如`arm`，`x64`，`arm64`。

**os.cpus():**

返回有关系统上可用CPU的信息。

例：

```js
[
  {
    model: 'Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz',
    speed: 2400,
    times: {
      user: 281685380,
      nice: 0,
      sys: 187986530,
      idle: 685833750,
      irq: 0
    }
  },
  {
    model: 'Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz',
    speed: 2400,
    times: {
      user: 282348700,
      nice: 0,
      sys: 161800480,
      idle: 703509470,
      irq: 0
    }
  }
]
```

**os.endianness():**

返回`BE`或`LE`取决于Node.js是使用[Big Endian还是Little Endian](https://en.wikipedia.org/wiki/Endianness)编译的。

**os.freemem():**

返回代表系统中可用内存的字节数。

**os.homedir():**

将路径返回到当前用户的主目录。

例：

```js
'/Users/joe'
```

**os.hostname():**

返回主机名。

**os.loadavg():**

返回操作系统对平均负载的计算。

它仅在Linux和macOS上返回有意义的值。

例：

```js
[3.68798828125, 4.00244140625, 11.1181640625]
```

**os.networkInterfaces():**

返回系统上可用网络接口的详细信息。

例：

```js
{
  lo0: [
    {
      address: "127.0.0.1",
      netmask: "255.0.0.0",
      family: "IPv4",
      mac: "fe:82:00:00:00:00",
      internal: true,
    },
    {
      address: "::1",
      netmask: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
      family: "IPv6",
      mac: "fe:82:00:00:00:00",
      scopeId: 0,
      internal: true,
    },
    {
      address: "fe80::1",
      netmask: "ffff:ffff:ffff:ffff::",
      family: "IPv6",
      mac: "fe:82:00:00:00:00",
      scopeId: 1,
      internal: true,
    },
  ],
  en1: [
    {
      address: "fe82::9b:8282:d7e6:496e",
      netmask: "ffff:ffff:ffff:ffff::",
      family: "IPv6",
      mac: "06:00:00:02:0e:00",
      scopeId: 5,
      internal: false,
    },
    {
      address: "192.168.1.38",
      netmask: "255.255.255.0",
      family: "IPv4",
      mac: "06:00:00:02:0e:00",
      internal: false,
    },
  ],
  uTun0: [
    {
      address: "fe80::2513:72bc:f405:61d0",
      netmask: "ffff:ffff:ffff:ffff::",
      family: "IPv6",
      mac: "fe:80:00:20:00:00",
      scopeId: 8,
      internal: false,
    },
  ],
}
```

**os.platform():**

返回为Node.js编译的平台：

- `darwin`
- `freebsd`
- `linux`
- `openbsd`
- `win32`
- ...更多

**os.release():**

返回标识操作系统版本号的字符串

**os.tmpdir():**

返回指定的临时文件夹的路径。

**os.totalmem():**

返回表示系统中可用总内存的字节数。

**os.type():**

标识操作系统：

- `Linux`
- `Darwin` 在macOS上
- `Windows_NT` 在Windows上

**os.uptime():**

返回自上次重新启动以来计算机一直在运行的秒数。

**os.userInfo():**

返回关于当前有效用户的信息。

## 6. 事件模块

该`events`模块为我们提供了EventEmitter类，这是在Node.js中处理事件的关键。

```js
const EventEmitter = require('events')
const door = new EventEmitter()
```

事件侦听器吃自己的狗食并使用以下事件：

- `newListener` 添加侦听器时
- `removeListener` 当侦听器被删除时

这是最有用的方法的详细说明：

**emitter.addListener():**

的别名`emitter.on()`。

**emitter.emit():**

发出事件。它按照注册事件的顺序同步调用每个事件侦听器。

```js
door.emit("slam") // emitting the event "slam"
```

**emitter.eventNames():**

返回一个字符串数组，这些字符串表示在当前`EventEmitter`对象上注册的事件：

```js
door.eventNames()
```

**emitter.getMaxListeners():**

获取一个可以添加到`EventEmitter`对象的最大侦听器数量，该侦听器默认为10，但是可以通过使用来增加或降低`setMaxListeners()`

```js
door.getMaxListeners()
```

**emitter.listenerCount():**

获取作为参数传递的事件的侦听器计数：

```js
door.listenerCount('open')
```

**emitter.listeners():**

获取作为参数传递的事件的侦听器数组：

```js
door.listeners('open')
```

**emitter.off():**

`emitter.removeListener()`Node.js 10中添加的别名

**emitter.on():**

添加发出事件时调用的回调函数。

用法：

```js
door.on('open', () => {
  console.log('Door was opened')
})
```

**emitter.once():**

添加在注册此事件后首次发出事件时调用的回调函数。该回调只会被调用一次，不会再被调用。

```js
const EventEmitter = require('events')
const ee = new EventEmitter()

ee.once('my-event', () => {
  //call callback function once
})
```

**emitter.prependListener():**

使用`on`或添加侦听器时`addListener`，该侦听器将添加到侦听器队列中的最后一个，并称为last。使用`prependListener`它是在其他侦听器之前添加和调用的。

**emitter.prependOnceListener():**

当您使用添加监听器时`once`，它被添加到监听器队列的最后，并被称为last。使用`prependOnceListener`它是在其他侦听器之前添加和调用的。

**emitter.removeAllListeners():**

删除`EventEmitter`对象侦听特定事件的所有侦听器：

```js
door.removeAllListeners('open')
```

**emitter.removeListener():**

删除特定的侦听器。您可以通过将回调函数保存到变量中（添加后）来完成此操作，以便以后可以引用它：

```js
const doSomething = () => {}
door.on('open', doSomething)
door.removeListener('open', doSomething)
```

**emitter.setMaxListeners():**

设置一个可以添加到`EventEmitter`对象的侦听器的最大数量，默认为10，但可以增加或降低。

```js
door.setMaxListeners(50)
```

## 7. http 模块

HTTP核心模块是Node.js网络的关键模块。

可以使用

```js
const http = require('http')
```

该模块提供了一些属性和方法以及一些类。

### 7.1 属性

**http.METHODS:**

此属性列出了所有受支持的HTTP方法：

```js
> require('http').METHODS
[ 'ACL',
  'BIND',
  'CHECKOUT',
  'CONNECT',
  'COPY',
  'DELETE',
  'GET',
  'HEAD',
  'LINK',
  'LOCK',
  'M-SEARCH',
  'MERGE',
  'MKACTIVITY',
  'MKCALENDAR',
  ...
]
```

**http.STATUS_CODES:**

此属性列出了所有HTTP状态代码及其描述：

```js
> require('http').STATUS_CODES
{ '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',
  '208': 'Already Reported',
  '226': 'IM Used',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Found',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '308': 'Permanent Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Timeout',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Payload Too Large',
  '414': 'URI Too Long',
  '415': 'Unsupported Media Type',
  '416': 'Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': 'I\'m a teapot',
  '421': 'Misdirected Request',
  '422': 'Unprocessable Entity',
  '423': 'Locked',
  '424': 'Failed Dependency',
  '425': 'Unordered Collection',
  '426': 'Upgrade Required',
  '428': 'Precondition Required',
  '429': 'Too Many Requests',
  '431': 'Request Header Fields Too Large',
  '451': 'Unavailable For Legal Reasons',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
  '508': 'Loop Detected',
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended',
  '511': 'Network Authentication Required' }
```

**http.globalAgent:**

指向Agent对象的全局实例，该实例是`http.Agent`该类的实例。

它用于管理HTTP客户端的连接持久性和重用，它是Node.js HTTP网络的关键组成部分。

`http.Agent`稍后在类描述中提供更多信息。

### 7.2方法

**http.createServer():**

返回`http.Server`该类的新实例。

用法：

```js
const server = http.createServer((req, res) => {
  //handle every single request with this callback
})
```

**http.request():**

向服务器发出HTTP请求，创建`http.ClientRequest`该类的实例。

**http.get():**

与相似`http.request()`，但是自动将HTTP方法设置为GET，并`req.end()`自动调用。

### 7.3  类

HTTP模块提供5个类：

- `http.Agent`
- `http.ClientRequest`
- `http.Server`
- `http.ServerResponse`
- `http.IncomingMessage`

**http.Agent:**

Node.js创建`http.Agent`该类的全局实例，以管理HTTP客户端（Node.js HTTP网络的关键组成部分）的连接持久性和重用。

该对象确保对服务器的每个请求都排队，并且重用单个套接字。

它还维护一个套接字池。出于性能原因，这是关键。

**http.ClientRequest:**

`http.ClientRequest`在`http.request()`或`http.get()`调用时创建一个对象。

收到`response`响应后，将使用响应作为`http.IncomingMessage`实例调用该事件。

可以通过两种方式读取响应的返回数据：

- 你可以调用`response.read()`方法
- 在`response`事件处理程序中，您可以为事件设置事件侦听器`data`，以便可以侦听流入的数据。

**http.Server:**

使用创建新服务器时，通常会实例化并返回此类`http.createServer()`。

拥有服务器对象后，就可以访问其方法：

- `close()` 阻止服务器接受新连接
- `listen()` 启动HTTP服务器并监听连接

**`http.ServerResponse:**

由an创建`http.Server`并作为`request`触发事件的第二个参数传递。

众所周知并在代码中用作`res`：

```js
const server = http.createServer((req, res) => {
  //res is an http.ServerResponse object
})
```

您将始终在处理程序中调用的方法是`end()`，它将关闭响应，消息已完成，服务器可以将其发送给客户端。必须在每个响应上调用它。

这些方法用于与HTTP标头交互：

- `getHeaderNames()` 获取已设置的HTTP标头的名称列表
- `getHeaders()` 获取已设置的HTTP标头的副本
- `setHeader('headername', value)` 设置HTTP标头值
- `getHeader('headername')` 获取已设置的HTTP标头
- `removeHeader('headername')` 删除已经设置的HTTP标头
- `hasHeader('headername')` 如果响应已设置该标头，则返回true
- `headersSent()` 如果标头已经发送到客户端，则返回true

处理标头后，您可以通过调用将它们发送给客户端`response.writeHead()`，该方法接受statusCode作为第一个参数，可选的状态消息和标头对象。

要将数据发送到响应正文中的客户端，请使用`write()`。它将缓冲的数据发送到HTTP响应流。

如果尚未使用`response.writeHead()`发送标头，它将首先发送标头，其中包含请求中设置的状态代码和消息，您可以通过设置`statusCode`和`statusMessage`属性值来进行编辑：

```js
response.statusCode = 500
response.statusMessage = 'Internal Server Error'
```

**http.IncomingMessage:**

一个`http.IncomingMessage`目的是通过创建的：

- `http.Server`听`request`活动时
- `http.ClientRequest`听`response`活动时

它可以用来访问响应：

- 利用其地位`statusCode`和`statusMessage`方法
- 标头使用其`headers`方法或`rawHeaders`
- 使用HTTP方法的`method`方法
- HTTP版本使用`httpVersion`方法
- 使用`url`方法的URL
- 使用该`socket`方法的底层套接字

由于`http.IncomingMessage`实现了Readable Stream接口，因此使用流访问数据。

## 8. Buffer缓冲区

### 8.1 什么是缓冲区？

缓冲区是内存区域。JavaScript开发人员对此概念并不熟悉，比每天与内存交互的C，C ++或Go开发人员（或使用系统编程语言的任何程序员）要少得多。

它代表在V8 JavaScript引擎外部分配的固定大小的内存块（无法调整大小）。

您可以将缓冲区视为一个整数数组，每个整数代表一个数据字节。

它由Node.js [Buffer类实现](http://nodejs.cn/api/buffer.html)。

### 8.2 我们为什么需要缓冲区？

在传统上仅处理字符串而不是二进制文件的生态系统中，引入了缓冲区以帮助开发人员处理二进制数据。

缓冲区与流紧密相连。当流处理器接收数据的速度快于其消化速度时，它将数据放入缓冲区。

当您观看YouTube视频时，缓冲区的简单可视化是红线超出了可视化点：您下载数据的速度比查看数据的速度快，并且浏览器会对数据进行缓冲。

### 8.3 如何创建缓冲区

使用创建的缓冲区[`Buffer.from()`](http://nodejs.cn/api/buffer.html#buffer_buffer_from_buffer_alloc_and_buffer_allocunsafe)，[`Buffer.alloc()`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_alloc_size_fill_encoding)和[`Buffer.allocUnsafe()`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_allocunsafe_size)方法。

```js
const buf = Buffer.from('Hey!')
```

- [`Buffer.from(array)`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_from_array)
- [`Buffer.from(arrayBuffer[, byteOffset[, length\]])`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length)
- [`Buffer.from(buffer)`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_from_buffer)
- [`Buffer.from(string[, encoding\])`](http://nodejs.cn/api/buffer.html#buffer_class_method_buffer_from_string_encoding)

您还可以只初始化传递大小的缓冲区。这将创建一个1KB的缓冲区：

```js
const buf = Buffer.alloc(1024)
//or
const buf = Buffer.allocUnsafe(1024)
```

虽然两者`alloc`并`allocUnsafe`分配一个`Buffer`以字节为单位指定的大小，的`Buffer`创建通过`alloc`将*初始化*用零和由创建的一个`allocUnsafe`将被*未初始化*。这意味着，尽管`allocUnsafe`与相比将是非常快的`alloc`，但分配的内存段可能包含可能敏感的旧数据。

`Buffer`读取内存时，如果内存中存在较旧的数据，则可以对其进行访问或泄漏。这是真正`allocUnsafe`导致不安全的原因，使用时必须格外小心。

### 8.4 使用缓冲区

#### 8.4.1 访问缓冲区的内容

缓冲区（字节数组）可以像数组一样进行访问：

```js
const buf = Buffer.from('Hey!')
console.log(buf[0]) //72
console.log(buf[1]) //101
console.log(buf[2]) //121
```

这些数字是Unicode代码，用于标识缓冲区位置中的字符（H => 72，e => 101，y => 121）

您可以使用以下`toString()`方法打印缓冲区的全部内容：

```js
console.log(buf.toString())
```

> 请注意，如果使用设置大小的数字初始化缓冲区，则可以访问将包含随机数据而不是空缓冲区的预初始化内存！

#### 8.4.2  获取缓冲区的长度

使用`length`属性：

```js
const buf = Buffer.from('Hey!')
console.log(buf.length)
```

#### 8.4.3 遍历缓冲区的内容

```js
const buf = Buffer.from('Hey!')
for (const item of buf) {
  console.log(item) //72 101 121 33
}
```

#### 8.4.4 更改缓冲区的内容

您可以使用以下`write()`方法将整个数据字符串写入缓冲区：

```js
const buf = Buffer.alloc(4)
buf.write('Hey!')
```

就像可以使用数组语法访问缓冲区一样，您也可以使用相同的方式设置缓冲区的内容：

```js
const buf = Buffer.from('Hey!')
buf[1] = 111 //o
console.log(buf.toString()) //Hoy!
```

#### 8.4.5 复制缓冲区

使用以下`copy()`方法可以复制缓冲区：

```js
const buf = Buffer.from('Hey!')
let bufCopy = Buffer.alloc(4) //allocate 4 bytes
buf.copy(bufCopy)
```

默认情况下，您将复制整个缓冲区。另外3个参数可让您定义开始位置，结束位置和新缓冲区长度：

```js
const buf = Buffer.from('Hey!')
let bufCopy = Buffer.alloc(2) //allocate 2 bytes
buf.copy(bufCopy, 0, 0, 2)
bufCopy.toString() //'He'
```

#### 8.4.6 切片缓冲区

如果要创建缓冲区的部分可视化，则可以创建切片。切片不是副本：原始缓冲区仍然是真相的来源。如果那改变了，您的切片也会改变。

使用`slice()`方法创建它。第一个参数是起始位置，您可以指定第二个参数作为结束位置：

```js
const buf = Buffer.from('Hey!')
buf.slice(0).toString() //Hey!
const slice = buf.slice(0, 2)
console.log(slice.toString()) //He
buf[1] = 111 //o
console.log(slice.toString()) //Ho
```

## 9. 流steam

### 9.1什么是流

流是支持Node.js应用程序的基本概念之一。

它们是一种以有效方式处理读/写文件，网络通信或任何类型的端到端信息交换的方式。

流不是Node.js特有的概念。它们是几十年前在Unix操作系统中引入的，程序可以相互交互，使流通过管道运算符（`|`）传递。

例如，以传统方式，当您告诉程序读取文件时，会将文件从头到尾读入内存，然后进行处理。

使用流，您可以逐段读取它，在不将其全部保存在内存中的情况下处理其内容。

Node.js [`stream`模块](http://nodejs.cn/api/stream.html)提供了构建所有流API的基础。所有流都是[EventEmitter的](http://nodejs.cn/api/events.html#events_class_eventemitter)实例

### 9.2  为什么流

使用其他数据处理方法，流基本上提供了两个主要优点：

- **内存效率**：您无需先在内存中加载大量数据，然后再进行处理
- **时间效率**：拥有数据后立即开始处理数据所需的时间更少，而不必等到整个数据有效负载就可以开始使用

### 9.3  流的一个例子

一个典型的例子是从磁盘读取文件的例子。

使用Node.js `fs`模块，您可以读取文件，并在与HTTP服务器建立新连接时通过HTTP提供文件：

```js
const http = require('http')
const fs = require('fs')

const server = http.createServer(function(req, res) {
  fs.readFile(__dirname + '/data.txt', (err, data) => {
    res.end(data)
  })
})
server.listen(3000)
```

`readFile()` 读取文件的全部内容，并在完成后调用回调函数。

`res.end(data)` 在回调中会将文件内容返回给HTTP客户端。

如果文件很大，则该操作将花费大量时间。这是使用流编写的相同内容：

```js
const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
  const stream = fs.createReadStream(__dirname + '/data.txt')
  stream.pipe(res)
})
server.listen(3000)
```

我们没有等待直到文件被完全读取，而是在准备好要发送的大量数据后立即开始将其流式传输到HTTP客户端。

### 9.4  管（）

上面的示例使用以下行`stream.pipe(res)`：`pipe()`在文件流上调用该方法。

该代码的作用是什么？它获取源，并将其通过管道传输到目标。

您在源流上调用它，因此在这种情况下，文件流通过管道传递到HTTP响应。

该`pipe()`方法的返回值是目标流，这是非常方便的事情，它使我们可以链接多个`pipe()`调用，如下所示：

```js
src.pipe(dest1).pipe(dest2)
```

此构造与执行相同

```js
src.pipe(dest1)
dest1.pipe(dest2)
```

### 9.5 流驱动的Node.js API

由于它们的优点，许多Node.js核心模块提供了本机流处理功能，最值得注意的是：

- `process.stdin` 返回连接到stdin的流
- `process.stdout` 返回连接到stdout的流
- `process.stderr` 返回连接到stderr的流
- `fs.createReadStream()` 创建文件的可读流
- `fs.createWriteStream()` 创建一个可写的文件流
- `net.connect()` 启动基于流的连接
- `http.request()` 返回http.ClientRequest类的实例，该实例是可写流
- `zlib.createGzip()` 使用gzip（一种压缩算法）将数据压缩到流中
- `zlib.createGunzip()` 解压缩gzip流。
- `zlib.createDeflate()` 使用deflate（压缩算法）将数据压缩到流中
- `zlib.createInflate()` 解压缩放气流

### 9.6  不同类型的流

流分为四类：

- `Readable`：您可以通过管道传输而不是通过管道传输的流（您可以接收数据，但不能向其发送数据）。当您将数据推送到可读流中时，将对其进行缓冲，直到使用者开始读取数据为止。
- `Writable`：您可以通过管道传输而不是从管道传输的流（您可以发送数据，但不能接收数据）
- `Duplex`：您可以同时通过管道传输和传输的流，基本上是可读流和可写流的组合
- `Transform`：转换流类似于双工，但输出是其输入的转换

### 9.7  如何创建可读流

我们从[`stream`模块](http://nodejs.cn/api/stream.html)获得Readable流，并对其进行初始化并实现该`readable._read()`方法。

首先创建一个流对象：

```js
const Stream = require('stream')
const readableStream = new Stream.Readable()
```

然后实施`_read`：

```js
readableStream._read = () => {}
```

您还可以`_read`使用以下`read`选项实现：

```js
const readableStream = new Stream.Readable({
  read() {}
})
```

现在，流已初始化，我们可以向其发送数据了：

```js
readableStream.push('hi!')
readableStream.push('ho!')
```

### 9.8  如何创建可写流

要创建可写流，我们扩展基础`Writable`对象，并实现其_write（）方法。

首先创建一个流对象：

```js
const Stream = require('stream')
const writableStream = new Stream.Writable()
```

然后实施`_write`：

```js
writableStream._write = (chunk, encoding, next) => {
  console.log(chunk.toString())
  next()
}
```

现在，您可以通过以下方式传递可读流：

```js
process.stdin.pipe(writableStream)
```

### 9.9  如何从可读流中获取数据

我们如何从可读流中读取数据？使用可写流：

```js
const Stream = require('stream')

const readableStream = new Stream.Readable({
  read() {}
})
const writableStream = new Stream.Writable()

writableStream._write = (chunk, encoding, next) => {
  console.log(chunk.toString())
  next()
}

readableStream.pipe(writableStream)

readableStream.push('hi!')
readableStream.push('ho!')
```

您还可以使用以下`readable`事件直接使用可读流：

```js
readableStream.on('readable', () => {
  console.log(readableStream.read())
})
```

### 9.10  如何将数据发送到可写流

使用流`write()`方法：

```js
writableStream.write('hey!\n')
```

### 9.11  用信号通知您已结束编写的可写流

使用`end()`方法：

```js
const Stream = require('stream')

const readableStream = new Stream.Readable({
  read() {}
})
const writableStream = new Stream.Writable()

writableStream._write = (chunk, encoding, next) => {
  console.log(chunk.toString())
  next()
}

readableStream.pipe(writableStream)

readableStream.push('hi!')
readableStream.push('ho!')

writableStream.end()
```

## 10. 开发环境与生产环境的区别

您可以为生产和开发环境使用不同的配置。

Node.js假定它始终在开发环境中运行。您可以通过设置`NODE_ENV=production`环境变量来向Node.js发出正在生产中运行的信号。

通常通过执行命令来完成

```js
export NODE_ENV=production
```

在shell中，但是最好将其放入您的shell配置文件中（例如`.bash_profile`，使用Bash shell），因为否则，该设置在系统重启的情况下不会保留。

您还可以通过将环境变量放在应用程序初始化命令之前来应用它：

```js
NODE_ENV=production node app.js
```

此环境变量是一种约定，在外部库中也广泛使用。

将环境设置为`production`通常可确保

- 日志记录保持在最低水平
- 发生更多的缓存级别以优化性能

例如，Express未使用的模板库Pug，如果`NODE_ENV`未设置为，则会以调试模式进行编译`production`。Express视图在开发模式下的每个请求中都进行编译，而在生产环境中则将其缓存。还有更多示例。

您可以使用条件语句在不同的环境中执行代码：

```js
if (process.env.NODE_ENV === "development") {
  //...
}
if (process.env.NODE_ENV === "production") {
  //...
}
if(['production', 'staging'].indexOf(process.env.NODE_ENV) >= 0) {
  //...
}
```

例如，在Express应用中，您可以使用它在每个环境中设置不同的错误处理程序：

```js
if (process.env.NODE_ENV === "development") {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
}

if (process.env.NODE_ENV === "production") {
  app.use(express.errorHandler())
}
```
