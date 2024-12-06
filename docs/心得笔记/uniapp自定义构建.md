# 自定义编译
## 脚本配置

package.json 设置自定义脚本

```json
{
  "uni-app": {
    "scripts": {
      "a-wx-dev": {
        "title": "微信小程序-开发环境",
        "env": {
          "UNI_PLATFORM": "mp-weixin",
          "ENV_TYPE": "dev"
        }
      }
    }
  }
}
```

会在工具栏生成运行选项
![输入图片说明](../image/%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_17198022638579.png)

或者是执行脚本命令（可绕开hBuilderX）
```cmd
npm run dev:custom a-wx-dev
```

## 设置config目录存储数据及脚本
config\env.js 数据根据环境做区分配置
```js
export default {
    dev: {
        wxUrl: 'https://xxx.dev.yfdjfw.com',
       
    },
    test: {
        wxUrl: 'https://xxx.test.yfdjfw.com',
    
    },
    ready: {
        wxUrl: 'https://xxx-ready.yfdjfw.com',
       
    },
    prod: {
        wxUrl: 'https://xxx.yfdjfw.com',
       
    },
}
```

config\script.js 对不能通过环境变量处理及要手动生成的文件做处理
```js
const fs = require('fs')
const path = require('path')

//以生成抖音文件为例
export function createPackage() {
  const dirPath = path.join(__dirname, '../dist/dev/mp-toutiao/app.js')
  const filePath = path.join(__dirname, '../dist/dev/mp-toutiao/package.json')

  function writeFile() {
    fs.writeFileSync(
      filePath,
      `{ "industrySDK": true, "ttPlugins": { "dependencies": { "microapp-trade-plugin": { "version": "1.1.2", "isDynamic": true } } } }`
    )
    console.error('--------------------生成package.json文件成功--------------------')
  }

  try {
    const key = setInterval(() => {
      if (fs.existsSync(dirPath, fs.constants.F_OK)) {
        writeFile()
        clearInterval(key)
      }
    }, 1000)
  } catch (error) {
    console.error('生成package.json文件失败', error)
  }
}
```

## vite.config.ts 文件注入全局变量和执行脚本
// 根据执行命令的类型获取变量，以及执行脚本
const ENV_TYPE = process.env?.UNI_CUSTOM_DEFINE ? (JSON.parse(process.env.UNI_CUSTOM_DEFINE!)).ENV_TYPE : 'prod'
if (process.env.UNI_PLATFORM === 'mp-toutiao') {
    createPackage()
}
 
// 注入全局变量
export default defineConfig(({ mode }) => ({
    define: {
        'process.env': process.env,
        'process.ENV_CONFIG': ENV_CONFIG,
        'process.ENV_TYPE': {type:ENV_TYPE},
    },
}));

## 使用
以接口域名为例
```
// 根据数据配置及环境变量，获取对应接口域名
option.url = process.ENV_CONFIG[process.ENV_TYPE.type].wxUrl + option.url
```

## 为什么不使用 vite 的环境变量来实现
1. 在 Hbuildx 下通过菜单运行时执行的不是 npm 命令，环境变量无法注入
2. vite.config.js 文件不支持访问 import.meta.env，但在其余文件可以访问 --commonjs规范问题，不能在es下使用
3. 通过 HbuilderX 启动获取不到 .env.dev 里面的变量

```js
// 可以这么使用
import { loadEnv } from 'vite'
const env = loadEnv('dev', process.cwd())
```
3. uniapp 项目一般是多小程序多环境，会产生多个环境配置文件

# 自动化构建
分支切换：使用 simple-git 库来执行命令
支持根据环境变量，进行自动化构建：依赖上述的自定义构建，和微信小程序的CLI包
前端页面及服务器开发：使用 nuxt 进行开发，有 VUE 的原生优势，也可以调用 node 能力

## 代码分支控制–git
引入simple-git 库，针对于各种场景的分支操作做封装，包括分支更新、切换
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

## 小程序构建
### uniapp项目编译
目前的项目结构即可支持命令构建，预计设计引入 shelljs 库执行 npm 命令来打包 uniapp。

设置小程序项目与本项目与同一目录下，运行时切换目录到小程序项目根目录下，执行命令。

### 微信小程序预览
引入 miniprogram-ci 库，这是微信小程序官方的库，支持编译、预览和上传等代码操作。

https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html

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
    setting: { // 支持的配置参数，与模拟器同理
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

## 网站建设
使用了 nuxt 作为开发框架，部署目前是 nginx + pm2 来部署在本地

项目目录结构
- components --组件
- pages –目录
- serverMiddleware --中间件，现在用来做接口处理
- utils
- nuxt.config.js --项目设置

### 页面开发
目前是单页面使用组件引入，页面设置两个下拉框及按钮进行交互（这里不赘述）。

接口请求方面，使用axios发起请求，与 VUE 开发无异

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

### 接口逻辑处理
nuxt.config.js 注册接口，即可发起请求，接口返回与 express 等开发无异
```js
serverMiddleware: [
    { path: "/api/buildFile", handler: "./serverMiddleware/buildFile" },
    { path: "/api/getCodeImg", handler: "./serverMiddleware/getCodeImg" },
    { path: "/api/getGitBranch", handler: "./serverMiddleware/getGitBranch" },
  ],

下面介绍部分 buildFile 接口的处理流程
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
    if (
      shell.test("-f", `./dist/${buildType}/mp-weixin/app.json`) &&
      !hasFile
    ) {
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
  shell.exec(
    scriptMap[envType],
    { windowsHide: true }
  );
 
// 构建完成生成预览码
preview()
 
// 最后由客户端发起图片获取
```

### 部署
执行 npm run build 命令构建

配置 pm2 启动命令，执行 pm2 start 启动应用
```js
module.exports = {
    apps: [
      {
        name: '小工具', // 替换成你的应用名称
        script: './node_modules/nuxt/bin/nuxt.js',
        args: 'start',
      }
    ]
  }
```

## vite 插件处理自定义文件
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