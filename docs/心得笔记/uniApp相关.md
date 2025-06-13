# uniApp

## vue3 在小程序引入 pinia

```js
// 利用利用命令，可以发现在微信、支付宝和抖音下都是支持 Proxy 的，所以也是可以直接使用 pinia 的
console.log(Proxy, typeof Proxy === "function");
```

但是在低版本的系统是不支持的，如微信是不支持 ios10 一下的（别家的没有发现说明）

解决方法：要手动引入 [polyfill](https://github.com/GoogleChrome/proxy-polyfill/blob/master/proxy.min.js)

参考链接：

[JavaScript 支持情况](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html)

[开发者工具 ES6 转 ES5 不转 Proxy 吗？](https://developers.weixin.qq.com/community/develop/doc/000a60e7b1ce38818857f901656c00?highLine=proxy)

## vueUse

`vueUse` 大部分方法在小程序下是不能使用的，因为是没有 `window` 对象（或者是别的全局对象）

## uniApp 埋点监控方案

### 页面路由切换监听

以 `switchTab` 为例主要做的是方法重写

```js
const switchTab = uni.switchTab;
uni.switchTab = function (e) {
  const success = arguments[0].success;
  const fail = arguments[0].fail;
  const complete = arguments[0].complete;
  arguments[0].success = function (...arg) {
    // 调用日志记录方法
    success && success(...arg);
  };
  arguments[0].fail = function (...arg) {
    // 调用日志记录方法
    fail && fail(...arg);
  };
  arguments[0].complete = function (...arg) {
    // 调用日志记录方法
    complete && complete(...arg);
  };
  // 这里还可以选择使用 Promise 进行返回
  // return new Promise((resolve, reject) => {
  //   arguments[0].success = function (...arg) {
  //     //  调用日志记录方法
  //     resolve(...arg);
  //   };
  //   arguments[0].fail = function (...arg) {
  //     //  调用日志记录方法
  //     reject(...arg);
  //   };
  //   switchTab.apply(this, arguments);
  // });
  switchTab.apply(this, arguments);
};
```

### error 监听

这里利用 `App.vue` 的生命周期 `onError` 进行监听

```vue
<script lang="ts">
function watchLife(lift: any) {
  const _lift = {
    onLaunch: function (e) {
      // 监听
      console.log("APP启动了！", e);
    },
    onError: function (e) {
      // 监听
      console.error("APP error", e);
    },
  };
  for (const item in _lift) {
    const fn = "function" == typeof lift[item] && lift[item];

    lift[item] = function () {
      _lift[item].apply(this, arguments);
      fn && fn.apply(this, arguments);
    };
  }
  return lift;
}

export default {
  ...watchLife({
    onLaunch: (e) => {
      console.log(1111111111);
    },
  }),
};
</script>
```

同理可以劫持 `console.error` 进行监听

### 网络请求监听

```js
const request = uni.request;
uni.request = function () {
  const success = arguments[0].success;
  const fail = arguments[0].fail;
  arguments[0].success = function (...arg) {
    // 监听
    success && success(...arg);
  };
  arguments[0].fail = function (...arg) {
    // 监听
    fail && fail(...arg);
  };
  request.apply(this, arguments);
};
```

### 用户行为监听

这里只能通过修改 `uniApp` 的编译源码处理

### 前端代码报错监听

`onerror` 实现，但不是所有错误都能捕捉，小程序原生问题

### 用户设备环境监听

todo

## 自定义编译

### 脚本配置

`package.json` 设置自定义脚本

```json
{
  "uni-app": {
    "scripts": {
      "a-wx-dev": {
        "title": "微信小程序-开发环境",
        "env": {
          "UNI_PLATFORM": "mp-weixin",
          "ENV_TYPE": "dev"
        },
        "define": {
          "WX-DEV": true // 还可以这么使用
        }
      }
    }
  }
}
```

会在工具栏生成运行选项
![输入图片说明](../image/%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_17198022638579.png)

或者是执行脚本命令（可绕开 HBuilderX）

```cmd
npm run dev:custom a-wx-dev
```

### 环境数据

设置 `config` 目录存储数据及脚本（或者写在 `package.json` 中）
`config\env.js` 数据根据环境做区分配置

```js
export default {
  dev: {
    wxUrl: "https://xxx.dev.com",
  },
  test: {
    wxUrl: "https://xxx.test.com",
  },
  ready: {
    wxUrl: "https://xxx-ready.com",
  },
  prod: {
    wxUrl: "https://xxx.com",
  },
};
```

`config\script.js` 对不能通过环境变量处理及要手动生成的文件做处理

```js
const fs = require("fs");
const path = require("path");

//以生成抖音文件为例
export function createPackage() {
  const dirPath = path.join(__dirname, "../dist/dev/mp-toutiao/app.js");
  const filePath = path.join(__dirname, "../dist/dev/mp-toutiao/package.json");

  function writeFile() {
    fs.writeFileSync(
      filePath,
      `{ "industrySDK": true, "ttPlugins": { "dependencies": { "microapp-trade-plugin": { "version": "1.1.2", "isDynamic": true } } } }`
    );
    console.error(
      "--------------------生成package.json文件成功--------------------"
    );
  }

  try {
    const key = setInterval(() => {
      if (fs.existsSync(dirPath, fs.constants.F_OK)) {
        writeFile();
        clearInterval(key);
      }
    }, 1000);
  } catch (error) {
    console.error("生成package.json文件失败", error);
  }
}
```

### 注入全局变量和执行脚本

`vite.config.ts` 文件注入全局变量和执行脚本

```js
// 根据执行命令的类型获取变量，以及执行脚本
const ENV_TYPE = process.env?.UNI_CUSTOM_DEFINE ? (JSON.parse(process.env.UNI_CUSTOM_DEFINE!)).ENV_TYPE : 'prod'
if (process.env.UNI_PLATFORM === 'mp-toutiao') {
    createPackage()
}

// 注入全局变量
export default defineConfig(({ mode }) => ({
  define: {
    'process.env': process.env,
    'process.ENV_CONFIG': ENV_CONFIG, // 环境数据
    'process.ENV_TYPE': ENV_TYPE,
  },
}));
```

`vue2/webpack`
```js
module.exports = {
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["__SOURCE__"] = JSON.stringify(source);
      return args;
    });
  },
};
```

### 使用

以接口域名为例

```js
// 根据数据配置及环境变量，获取对应接口域名
option.url = process.ENV_CONFIG[process.ENV_TYPE].wxUrl + option.url;
```

### import.meta 实现

为什么不使用 vite 的环境变量来实现

1. 在 `HBuilderX` 下通过菜单运行时执行的不是 `npm` 命令，环境变量无法注入（好像是可以获取到）
2. `vite.config.js` 文件不支持访问 `import.meta.env`，但在其余文件可以访问（`commonjs` 规范问题，不能在 `es` 下使用）
3. 通过 `HBuilderX` 启动获取不到 `.env.dev` 和启动的环境（wx/tt/qq） 里面的变量

```js
// 可以这么使用
import { loadEnv } from "vite";
const env = loadEnv("dev", process.cwd());
```

### 补充编译条件

```js
// #ifdef WX-DEV
const url = "dev";
// #endif
// #ifndef WX-DEV
const url = "prod";
// #endif
```

## 自动化构建

分支切换：使用 `simple-git` 库来执行命令
支持根据环境变量，进行自动化构建：依赖上述的自定义构建，和微信小程序的 `CLI` 包
前端页面及服务器开发：使用 `nuxt` 进行开发，有 `VUE` 的原生优势，也可以调用 `node` 能力

### 代码分支控制–git

引入 `simple-git` 库，针对于各种场景的分支操作做封装，包括分支更新、切换

```ts
import simpleGit from "simple-git";
const projectPath = "../cd-mini-program";

// 如下，获取最新的分支代码，确保构建的代码是最新的
export function gitFetch() {
  return new Promise((resolve, reject) => {
    try {
      const git = simpleGit(projectPath);
      // 执行的命令与一般的git操作无异
      git.fetch((err: any) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        console.log("------更新分支成功-----");
        resolve("200");
      });
    } catch (error) {
      reject(error);
    }
  });
}
```

### 小程序构建

#### uniApp 项目编译

目前的项目结构即可支持命令构建，预计设计引入 `shelljs` 库执行 `npm` 命令来打包 `uniApp`

设置小程序项目与本项目与同一目录下，运行时切换目录到小程序项目根目录下，执行命令。

#### 微信小程序预览

引入 [miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html) 库，这是微信小程序官方的库，支持编译、预览和上传等代码操作。

这里主要用到预览功能，以此为例。

```ts
const project = new ci.Project({
  appid: "xxxx", // 小程序项目的 appid
  type: "miniProgram", // 项目类型
  projectPath: `${PATH}/dist/${buildType}/mp-weixin`, //  项目路径
  privateKeyPath: `xxxxx.key`, // 项目私钥
  ignores: [`node_modules/**/*`],
});
const previewResult = await ci.preview({
  project,
  setting: {
    // 支持的配置参数，与模拟器同理
    minifyJS: true,
    minifyWXML: true,
    minifyWXSS: true,
    minify: true,
  },
  bigPackageSizeSupport: true,
  qrcodeFormat: "image", // 返回二维码文件的格式
  qrcodeOutputDest: `./${envType}.png`, // 生成图片路径
  useCOS: true,
  onProgressUpdate: (data: any) => {
    // console.log('onProgressUpdate',data);
  },
});
```

### 网站建设

使用了 `nuxt` 作为开发框架，部署目前是 `nginx` + `pm2` 来部署在本地

项目目录结构

- components --组件
- pages --目录
- serverMiddleware --中间件，现在用来做接口处理
- utils
- nuxt.config.js --项目设置

#### 页面开发

目前是单页面使用组件引入，页面设置两个下拉框及按钮进行交互（这里不赘述）。

接口请求方面，使用 `axios` 发起请求，与 `VUE` 开发无异

```ts
this.$axios
  .post("/api/getGitBranch")
  .then(({ data }) => {
    this.$data.branchList = data.data;
  })
  .catch((error) => {
    console.error(error);
    message.error("获取分支失败");
    this.$data.messageText = "获取分支失败";
  });
```

#### 接口逻辑处理

`nuxt.config.js` 注册接口，即可发起请求，接口返回与 `express` 等开发无异

```js
{
  serverMiddleware: [
    { path: "/api/buildFile", handler: "./serverMiddleware/buildFile" },
    { path: "/api/getCodeImg", handler: "./serverMiddleware/getCodeImg" },
    { path: "/api/getGitBranch", handler: "./serverMiddleware/getGitBranch" },
  ];
}
```

下面介绍部分 `buildFile` 接口的处理流程

```js
// 引入bodyParser对接口测试解析
const bodyParser = require("body-parser");

// 获取分支名称及构建方式（dev/test）
const { type, name } = req.body;

// 丢弃本地分支修改，切换分支，获取分支最新代码
await gitOptimize(name);

// 删除多余代码
shell.cd(PATH);
shell.rm("-rf", "./dist/*");
shell.rm("-rf", "test.png");
shell.rm("-rf", "dev.png");

// 使用文件读取确认构建完成（build构建方式可以不用）
let hasFile = false;
const key = setInterval(() => {
  if (shell.test("-f", `./dist/${buildType}/mp-weixin/app.json`) && !hasFile) {
    hasFile = true;
    clearInterval(key);
    console.log("--------二维码构建---------------");
    preview(() => {
      fn(() =>
        setTimeout(() => {
          console.log("-----关闭进程------");
          shell.exit(0);
        }, 30 * 1000)
      );
    });
  }
}, 500);
shell.exec(scriptMap[envType], { windowsHide: true });

// 构建完成生成预览码
preview();

// 最后由客户端发起图片获取
```

#### 部署

执行 `npm run build` 命令构建

配置 `pm2` 启动命令，执行 `pm2 start` 启动应用

```js
module.exports = {
  apps: [
    {
      name: "小工具", // 替换成你的应用名称
      script: "./node_modules/nuxt/bin/nuxt.js",
      args: "start",
    },
  ],
};
```

### vite 插件处理自定义文件

```js
// vite-plugin-uni-script.js
const fs = require('fs')
const path = require('path')

let env_config
const UNI_PLATFORM = process.env.UNI_PLATFORM // 运行平台
const ENV_TYPE = process.env.UNI_CUSTOM_DEFINE
    ? JSON.parse(process.env.UNI_CUSTOM_DEFINE).ENV_TYPE
    : 'prod' // 环境类型
const PLATFORM_MAP = {
    'mp-toutiao': '抖音',
    'mp-alipay': '支付宝',
    'mp-weixin': '微信',
}

// 修改 appid
function modifyAppId(platform, appId) {
    const filePath = path.join(__dirname, '../src/manifest.json')
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const obj = JSON.parse(fileContent)
        obj[platform]['appid'] = appId
        fs.writeFileSync(filePath, JSON.stringify(obj, null, 2)) // 格式化 JSON 输出
        console.info(
            `--------------------修改${PLATFORM_MAP[platform]} appid成功--------------------`
        )
    } catch (error) {
        console.error(`修改${PLATFORM_MAP[platform]} appid失败`, error)
    }
}

export default function uniScriptPlugin(resolvedConfig) {
    return {
        name: 'vite-plugin-uni-script',
        configResolved(config) {
            env_config = config.env_config
        },
        buildStart() {
            if (UNI_PLATFORM === 'mp-toutiao') {
                modifyAppId('mp-toutiao', env_config[ENV_TYPE].ttAppid)
            } else if (UNI_PLATFORM === 'mp-alipay') {
                modifyAppId('mp-alipay', env_config[ENV_TYPE].alAppId)
            }
        },
        writeBundle() {
            if (UNI_PLATFORM === 'mp-toutiao') {
                const filePath = path.join(__dirname, '../dist/dev/mp-toutiao/package.json')
                try {
                    const txt = JSON.stringify(
                        {
                            industrySDK: true,
                            ttPlugins: {
                                dependencies: {
                                    'microapp-trade-plugin': {
                                        version: '1.1.2',
                                        isDynamic: true,
                                    },
                                },
                            },
                        },
                        null,
                        2
                    ) // 格式化 JSON 输出
                    fs.writeFileSync(filePath, txt)
                    console.info('--------------------生成package.json文件成功--------------------')
                } catch (error) {
                    console.error('生成package.json文件失败', error)
                }
            } else if (UNI_PLATFORM === 'mp-alipay') {
                // ...
            }
        },
    }
}

// vite.config.ts
import uniScriptPlugin from './vite-plugin-uni-script'
export default defineConfig(({ mode }) => ({
  plugins: [uni(),vitePluginUniScript(ENV_CONFIG)],
  env_config: ENV_CONFIG,
}));

// ENV_CONFIG 定义
const ENV_CONFIG = {
  dev: {
    ttAppid: 'ttAppid',
    alUrl: 'alUrl',
  },
  prod: {
    ttAppid: 'ttAppid',
    alUrl: 'alUrl',
  }
}
```

## uniApp 样式穿透没有效果

微信小程序对于组件有样式保护，不允许外部修改组件的样式，用 `:deep()` 也没有效果

要配置 `styleIsolation` 属性

```js
defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
```

## 小程序调试新方式

货拉拉开源，支持 web、H5、小程序，支持日志回放

[Page Spy](https://www.pagespy.org/#/docs/miniprogram)

## scroll-view 组件内部 fixed 失效

`fixed` 布局遇到 `scroll-view` 组件，会随着 `scroll-view` 一起滚动，导致 `fixed` 布局失效

1. 解决方法：弹窗组件放置在 `scroll-view` 外部
2. 使用 `root-portal` 组件进行包裹，`root-portal` 组件会使整个子树从页面中脱离出来，类似于在 `CSS` 中使用 `fixed position` 的效果。主要用于制作弹窗、弹出层等。`root-portal` 是一个虚拟节点，要嵌套一层 `view` 组件，才可以使用 `u-popup` 组件，否则不会生效。

参考链接：

[scroll-view 组件内部的元素使用 position:fixed 定位，会随着 scroll 一起滚动](https://developers.weixin.qq.com/community/develop/doc/0006a226400f00bb88bc300c05b800)

[root-portal](https://developers.weixin.qq.com/miniprogram/dev/component/root-portal.html)

## scroll-view 滚顶

```vue
<scroll-view scroll-y :scroll-top="scrollTop" @scroll="onScroll"> </scroll-view>

<script setup>
const scrollTop = ref(0);
function onScroll(e) {
  scrollTop.value = e.detail.scrollTop;
}
</script>
```

这样子实时赋值，容易导致页面滚动时抖动。

滚顶可以用 0/1 做处理：`scrollTop.value = scrollTop.value === 0 ? 1 : 0`

## editor 坑坑坑坑坑坑坑坑坑坑坑坑坑坑坑

1. `editor` 组件使用 `editorContext.setContents` 方法插入数据是会报错 `addRange(): The given range isn't in document.`

解决方法，在使用 `setContents` 时套一层 `setTimeout`

2. `setContents` 方法会使光标前置，用 `delta` 模式拼接 `'\n'` 可以修复，但是只能处理纯文本，会使样式等识别错误

## 简单富文本编辑器

思路 `textarea` 覆盖在 `u-parse` 上面并隐藏

```vue
<template>
  <view class="publishContent">
    <!-- 隐藏的textarea用于用户输入 -->
    <textarea
      id="hidden-textarea"
      v-model="form.artIntroduce"
      class="hidden-textarea"
      placeholder="添加正文"
      maxlength="-1"
      :adjust-position="false"
      @input="handleTextareaInput"
    ></textarea>

    <u-parse class="visible-content" :content="parsedContent"></u-parse>
  </view>
</template>
<script>
export default {
  methods: {
    // 处理textarea的输入事件
    handleTextareaInput() {
      this.parsedContent = this.convertTextToHtml(this.form.artIntroduce);
    },

    // 将文本转换为带高亮标签的HTML
    convertTextToHtml(text) {
      if (!text) return "添加正文";
      text = text.replace(/\n/g, "<br>");
      // 只匹配合法输入
      const regex = /#([a-zA-Z0-9\u4e00-\u9fa5]+)/g;
      return text.replace(regex, '<span style="color: #65b7ff;">$&</span>');
    },
  },
};
</script>
<style>
.hidden-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  font-size: 26rpx;
  box-sizing: border-box;
  color: transparent;
  caret-color: black;
  font-size: 26rpx;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 0 20rpx;
  min-height: 400rpx;
  height: 100%;
}

.visible-content {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
  font-size: 26rpx;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 0 20rpx;
  color: #33333380;
  min-height: 400rpx;
}
</style>
```

## textarea ios 高度异常

微信小程序在 `ios`  下 `textarea` 会有自带的内边距

解决方法：`disable-default-padding`
