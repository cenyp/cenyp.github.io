import DefaultTheme from "vitepress/theme";
import "./style/index.css";
import ElementPlus from 'element-plus'; // 引入组件库
import 'element-plus/dist/index.css'; // 引入样式

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(ElementPlus); // 注册组件库
  },
};
