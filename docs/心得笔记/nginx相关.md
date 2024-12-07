# Nginx

## vue-router history 路由类型

history 一般要在 nginx 配置，对于 /xxx 路由都返回 html 文件，避免原地刷新报错

``` config
location / {
  try_files $uri $uri/ /index.html;
  root /app/nginx;
  index index.html index.htm;
}
```

这种指向会让 web 端请求资源文件时返回 html 文件，但是对于被引用的资源文件是可以直接请求的，可以避免被配置误伤
