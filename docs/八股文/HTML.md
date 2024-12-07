# HTML

## 1. HTML语义化

`HTML` 语义化就是让页面内容结构化，它有如下优点

1. 易于用户阅读，样式丢失的时候能让页面呈现清晰的结构。
2. 有利于 `SEO`，搜索引擎根据标签来确定上下文和各个关键字的权重。
3. 方便其他设备解析，如盲人阅读器根据语义渲染网页
4. 有利于开发和维护，语义化更具可读性，代码更好维护，与 `CSS3` 关系更和谐

如：

```html
<header>代表头部
<nav>代表超链接区域
<main>定义文档主要内容
<article>可以表示文章、博客等内容
<aside>通常表示侧边栏或嵌入内容
<footer>代表尾部
```

![img](../image/33.webp)

## 2. HTML5 新标签

```html
有<header>、<footer>、<aside>、<nav>、<video>、<audio>、<canvas>等...
```

## 2.1 canvas

```html
<canvas id="myCanvas">你的浏览器不支持 HTML5 canvas 标签。</canvas>

<script>
  var c=document.getElementById('myCanvas');
  var ctx=c.getContext('2d');
  ctx.fillStyle='#FF0000';
  ctx.fillRect(0,0,80,100);
</script>
```

## 2.2 新多媒体元素

| 标签       | 描述                                                           |
| :--------- | :------------------------------------------------------------- |
| `<audio>`  | 定义音频内容                                                   |
| `<video>`  | 定义视频`video` 或者 `movie`                                   |
| `<source>` | 定义多媒体资源 `<video>` 和 `<audio>`                          |
| `<embed>`  | 定义嵌入的内容，比如插件。                                     |
| `<track>`  | 为诸如 `<video>` 和 `<audio>` 元素之类的媒介规定外部文本轨道。 |

### 2.2.1 audio

| 属性     | 值                 | 描述                                                        |
| -------- | ------------------ | ----------------------------------------------------------- |
| autoplay | autoplay           | 如果出现该属性，则音频在就绪后马上播放。                    |
| controls | controls           | 如果出现该属性，则向用户显示音频控件（比如播放/暂停按钮）。 |
| loop     | loop               | 如果出现该属性，则每当音频结束时重新开始播放。              |
| muted    | muted              | 如果出现该属性，则音频输出为静音。                          |
| preload  | auto metadata none | 规定当网页加载时，音频是否默认被加载以及如何被加载。        |
| src      | URL                | 规定音频文件的 URL。                                        |

### 2.2.2 video

**提示和注释**

**提示：**可以在 `<video>` 和 `</video>` 标签之间放置文本内容，这样不支持 `<video>` 元素的浏览器就可以显示出该标签的信息。

| 属性     | 值                 | 描述                                                        |
| -------- | ------------------ | ----------------------------------------------------------- |
| autoplay | autoplay           | 如果出现该属性，则音频在就绪后马上播放。                    |
| controls | controls           | 如果出现该属性，则向用户显示音频控件（比如播放/暂停按钮）。 |
| height   | *pixels*           | 设置视频播放器的高度。                                      |
| loop     | loop               | 如果出现该属性，则每当音频结束时重新开始播放。              |
| muted    | muted              | 如果出现该属性，视频的音频输出为静音。                      |
| poster   | *URL*              | 规定视频正在下载时显示的图像，直到用户点击播放按钮。        |
| preload  | auto metadata none | 规定当网页加载时，音频是否默认被加载以及如何被加载。        |
| src      | *URL*              | 要播放的视频的 URL。                                        |
| width    | *pixels*           | 设置视频播放器的宽度。                                      |

### 2.2.3 source

**标签定义及使用说明**

`<source>` 标签为媒体元素（比如 `<video>` 和 `<audio>`）定义媒体资源。

`<source>` 标签允许您规定两个视频/音频文件共浏览器根据它对媒体类型或者编解码器的支持进行选择。

| 属性  | 值          | 描述                                                                                            |
| :---- | :---------- | :---------------------------------------------------------------------------------------------- |
| media | media_query | 规定媒体资源的类型，供浏览器决定是否下载。(任何浏览器都不支持 `<source>` 标签的 `media` 属性。) |
| src   | URL         | 规定媒体文件的 URL。                                                                            |
| type  | MIME_type   | 规定媒体资源的 `MIME` 类型。                                                                    |

**常见的 MIME 类型：**

1. 视频：

- video / ogg
- video / mp4
- video / webm

2. 音频：

- audio / ogg
- audio / mpeg

```html
<!-- 带有两个源文件的音频播放器。浏览器需要选择它所支持的源文件（如果都支持则任选一个）： -->
<audio controls>
    <source src="horse.ogg" type="audio/ogg">
    <source src="horse.mp3" type="audio/mpeg">
    您的浏览器不支持 audio 元素。
</audio>
```

### 2.2.4 embed

`<embed>` 标签定义了一个容器，用来嵌入外部应用或者互动程序（插件）。

> **注意**：现在已经不建议使用 `<embed>` 标签了，可以使用 `<img>、<iframe>、<video>、<audio>` 等标签代替。

### 2.2.5 track

**浏览器支持**

IE 10、Opera 和 Chrome 浏览器支持 `<track>` 标签。

------

**标签定义及使用说明**

`<track>` 标签为媒体元素（比如 `<audio>` and `<video>`）规定外部文本轨道。

这个元素用于规定字幕文件或其他包含文本的文件，当媒体播放时，这些文件是可见的。

## 2.3 新表单元素

| 标签       | 描述                                                                     |
| :--------- | :----------------------------------------------------------------------- |
| `<datalist>` | 定义选项列表。请与 `input` 元素配合使用该元素，来定义 `input` 可能的值。 |
| `<keygen>`   | 规定用于表单的密钥对生成器字段。                                         |
| `<output>`   | 定义不同类型的输出，比如脚本的输出。                                     |

`<datalist>` 定义选项列表。请与 `input` 元素配合使用该元素，来定义 `input` 可能的值。
`<keygen>` 规定用于表单的密钥对生成器字段。
`<output>` 定义不同类型的输出，比如脚本的输出。

## 2.4 新的语义和结构元素

`HTML5` 提供了新的元素来创建更好的页面结构：

| 标签         | 描述                                                           |
| :----------- | :------------------------------------------------------------- |
| `<wbr>`        | 规定在文本中的何处适合添加换行符。                             |
| `<article> `   | 定义页面独立的内容区域。                                       |
| `<aside> `     | 定义页面的侧边栏内容。                                         |
| `<bdi>`        | 允许您设置一段文本，使其脱离其父元素的文本方向设置。           |
| `<command>`   | 定义命令按钮，比如单选按钮、复选框或按钮                       |
| `<details>`    | 用于描述文档或文档某个部分的细节                               |
| `<dialog>`     | 定义对话框，比如提示框                                         |
| `<summary>`    | 标签包含 `details` 元素的标题                                    |
| `<figure>`     | 规定独立的流内容（图像、图表、照片、代码等等）。               |
| `<figcaption>` | 定义 `<figure>` 元素的标题                                       |
| `<footer>`     | 定义 `section` 或 `document` 的页脚。                              |
| `<header>`     | 定义了文档的头部区域                                           |
| `<mark>`       | 定义带有记号的文本。                                           |
| `<meter>`     | 定义度量衡。仅用于已知最大和最小值的度量。                     |
| `<nav>`       | 定义导航链接的部分。                                           |
| `<progress>`   | 定义任何类型的任务的进度。                                     |
| `<ruby>`       | 定义 `ruby` 注释（中文注音或字符）。                             |
| `<rt>`         | 定义字符（中文注音或字符）的解释或发音。                       |
| `<rp>`         | 在 `ruby` 注释中使用，定义不支持 `ruby` 元素的浏览器所显示的内容。 |
| `<section>`    | 定义文档中的节（`section`、区段）。                              |
| `<time>`       | 定义日期或时间。                                               |

# 3. script

| 属性                                                             | 描述                                                                                                         |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| [async](https://www.runoob.com/jsref/prop-script-async.html)     | 设置或返回是否异步执行脚本（一旦脚本可用）。                                                                 |
| [charset](https://www.runoob.com/jsref/prop-script-charset.html) | 设置或返回脚本的 `charset` 属性的值。                                                                          |
| [defer](https://www.runoob.com/jsref/prop-script-defer.html)     | 设置或返回是否在页面完成解析时执行脚本。// `defer`属性指明本元素所含的脚本不会修改DOM，因此代码能安全的延迟执行 |
| [src](https://www.runoob.com/jsref/prop-script-src.html)         | 设置或返回脚本的 `src` 属性的值。                                                                              |
| [text](https://www.runoob.com/jsref/prop-script-text.html)       | 设置或返回脚本的所有子文本节点的内容。                                                                       |
| [type](https://www.runoob.com/jsref/prop-script-type.html)       | 设置或返回脚本的 `type` 属性的值。                                                                             |

- 如果 `async="async"`：脚本相对于页面的其余部分异步地执行（当页面继续进行解析时，脚本将被执行）
- 如果不使用 `async` 且 `defer="defer"`：脚本将在页面完成解析时执行
- 如果既不使用 `async` 也不使用 `defer`：在浏览器继续解析页面之前，立即读取并执行脚本

### 普通 script

先来看一个普通的 `script` 标签。

```html
<script src="a.js"></script>
```

浏览器会做如下处理

- 停止解析 `document`
- 请求 `a.js`
- 执行 `a.js` 中的脚本
- 继续解析 `document`

### defer

```html
<script src="d.js" defer></script>
<script src="e.js" defer></script>
```

- 不阻止解析 `document`， 并行下载 `d.js, e.js`
- 即使下载完 `d.js, e.js` 仍继续解析 ``document``
- 按照页面中出现的顺序，在其他同步脚本执行后，`DOMContentLoaded` 事件前 依次执行 `d.js, e.js`

### async

```html
<script src="b.js" async></script>
<script src="c.js" async></script>
```

- 不阻止解析 `document`, 并行下载 `b.js, c.js`
- 当脚本下载完后立即执行。（两者执行顺序不确定，执行阶段不确定，可能在 `DOMContentLoaded` 事件前或者后 ）

### 其他

- 如果 `script` 无 `src` 属性，则 `defer, async` 会被忽略
- **动态添加的 `script` 标签隐含 `async` 属性**。
  - 在动态加载脚本时，为了脚本加载顺序不变，要手动设置 `async = false`

### 结论

- 两者都不会阻止 `document` 的解析
- `defer` 会在 `DOMContentLoaded` 前依次执行 （可以利用这两点哦！）
- `async` 则是下载完立即执行，不一定是在 `DOMContentLoaded` 前
- `async` 因为顺序无关，所以很适合像 `Google Analytics` 这样的无依赖脚本

# 4. HTML5原生拖拽/拖放

| 针对对象     | 事件名称  | **说明**                                                             |
| ------------ | --------- | -------------------------------------------------------------------- |
| 被拖动的元素 | dragstart | 在元素开始被拖动时候触发                                             |
|              | drag      | 在元素被拖动时反复触发                                               |
|              | dragend   | 在拖动操作完成时触发                                                 |
| 目的地对象   | dragenter | 当被拖动元素进入目的地元素所占据的屏幕空间时触发                     |
|              | dragover  | 当被拖动元素在目的地元素内时触发                                     |
|              | dragleave | 当被拖动元素没有放下就离开目的地元素时触发                           |
|              | drop      | 当被拖动元素在目的地元素里放下时触发，一般需要取消浏览器的默认行为。 |

```html
<body>
  <img src="https://sf6-ttcdn-tos.pstatp.com/img/user-avatar/a0b2accd1d694519956901ed441a52fe~300x300.image"
    draggable="true">
  <input>
</body>
<script>
  document.querySelector("img").ondragstart = function () {
    console.log("ondragstart");
  }
  document.querySelector("img").ondrag = function () {
    console.log("ondrag");
  }
  document.querySelector("img").ondragend = function () {
    console.log("ondragend");
  }
  document.querySelector("input").ondragenter = function () {
    console.log("ondragenter");
  }
  document.querySelector("input").ondragover = function () {
    console.log("ondragover");
  }
  document.querySelector("input").ondragleave = function () {
    console.log("ondragleave");
  }
  document.querySelector("input").ondrop = function () {
    console.log("ondrop");
  }
</script>
```

```js
//目的地对象
  divList.ondragover = div_dragover
  function div_dragover(e) {
    console.log("dragover");
    e.preventDefault()
  }
/*
必须定义ondragover事件
*/
```

# 5. 图片加载监听

```html
<script>
// 图片加载错误时触发
function imgError(obj){
  //替换原路径或隐藏
} 
</script>

<img src="xxxx" οnerrοr="imgError(this)" />
```

`script` 标签也可以
