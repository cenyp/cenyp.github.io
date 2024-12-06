# 页面路由切换监听
以 switchTab 为例主要做的是方法重写

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

# error 监听
这里利用 App.vue 的生命周期 onError 进行监听

```js
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
	...watchLife(
		{
			onLaunch: (e) => {
				console.log(1111111111);

			}
		}
	)
}

</script>
```

同理可以劫持 console.error 进行监听

## 网络请求监听
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

## 用户行为监听
这里只能通过修改uniapp的编译源码处理

## 前端代码报错监听
onerror 实现，但不是所有错误都能捕捉，小程序原生问题

## 用户设备环境监听

## 用户数据监听







