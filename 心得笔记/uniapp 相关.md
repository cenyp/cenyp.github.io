# vue3 在小程序引入 pinia
```js
// 利用利用命令，可以发现在微信、支付宝和抖音下都是支持 Proxy 的，所以也是可以直接使用 pinia 的
console.log(Proxy ,typeof Proxy === 'function');
```
但是在低版本的系统是不支持的，如微信是不支持 ios10 一下的（别家的没有发现说明）

[JavaScript 支持情况](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html)

解决方法：要手动引入 polyfill(https://github.com/GoogleChrome/proxy-polyfill/blob/master/proxy.min.js)

[开发者工具ES6转ES5不转Proxy吗？](https://developers.weixin.qq.com/community/develop/doc/000a60e7b1ce38818857f901656c00?highLine=proxy)