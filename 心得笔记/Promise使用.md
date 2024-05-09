# Promise.catch 与 Promise.then 的第二个参数
Promise.catch 的错误捕捉是全局的，针对整个 Promise，在有多个 then 下，都能触发 catch 

Promise.then 的第二个参数优先级高于 Promise.catch，设置了就不会触发 Promise.catch

```js
new Promise((res, req) => {
  setTimeout(() => req(), 100);
})
  .then(
    () => {},
    () => {
      console.log("rej"); // 设置了，catch就不会触发
      // return Promise.reject(); // 这里抛出错误时 rej2 才打印
    }
  )
  .then(
    () => {},
    () => {
      console.log("rej2");
    }
  )
  .catch(() => {
    console.log("catch"); // 如果前面两个 then 都设置了第二参数做错误捕捉，catch时不会触发的，当有一个没有设置时，catch会捕捉没有设置的那个错误
  });
```