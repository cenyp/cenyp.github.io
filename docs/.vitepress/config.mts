import { defineConfig } from "vitepress";
import { generateSidebar } from "../../utils/navSidebarUtil";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // base: '/blog/',
  title: "cenyp_blog",
  description: "记点东西",
  themeConfig: {
    outline: {
      level: "deep",
      label: "目录",
    },
    search: {
      provider: "local",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    // todo
    lastUpdated: {
      text: "上次更新时间",
      format: "YYYY-MM-DD HH:mm:ss",
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "分类",
        items: [
          { text: "vue源码", link: "/vue源码/vue2源码" },
          { text: "心得笔记", link: "/心得笔记/js相关" },
          { text: "文章收录", link: "/文章收录/文章链接大全" },
          { text: "八股文", link: "/八股文/CSS" },
          // { text: "算法", link: "/心得笔记/js相关" },
        ],
      },
    ],

    sidebar: {
      "/vue源码/": [
        {
          text: "vue源码",
          items: [
            { text: "vue2源码", link: "/vue源码/vue2源码" },
            { text: "vue3源码", link: "/vue源码/vue3源码" },
            { text: "vuex源码", link: "/vue源码/vuex源码" },
            { text: "vue-route源码", link: "/vue源码/vue-route源码" },
          ],
        },
      ],
      "/心得笔记/": [
        {
          text: "心得笔记",
          items: [
            { text: "js相关", link: "/心得笔记/js相关" },
            { text: "ts相关", link: "/心得笔记/ts相关" },
            { text: "css相关", link: "/心得笔记/css相关" },
            { text: "vue相关", link: "/心得笔记/vue相关" },
            { text: "uniApp相关", link: "/心得笔记/uniApp相关" },
            { text: "安全相关", link: "/心得笔记/安全相关" },
            { text: "项目工程化相关", link: "/心得笔记/项目工程化相关" },
            { text: "浏览器相关", link: "/心得笔记/浏览器相关" },
            { text: "问题排查心得", link: "/心得笔记/问题排查心得" },
            { text: "组件库相关", link: "/心得笔记/组件库相关" },
            { text: "Echarts", link: "/心得笔记/Echarts" },
            { text: "nginx相关", link: "/心得笔记/nginx相关" },
            { text: "开发提效相关", link: "/心得笔记/开发提效相关" },
          ],
        },
      ],
      "/文章收录/": [
        {
          text: "文章收录",
          items: [
            { text: "文章链接大全", link: "/文章收录/文章链接大全" },
            { text: "多项目多仓库理念", link: "/文章收录/多项目多仓库理念" },
            {
              text: "CSS 实现多行文本“展开收起”",
              link: "/文章收录/CSS 实现多行文本“展开收起”",
            },
            {
              text: "css实现文本中间省略号",
              link: "/文章收录/css实现文本中间省略号",
            },
            {
              text: "localhost和127.0.0.1的区别",
              link: "/文章收录/localhost和127.0.0.1的区别",
            },
          ],
        },
      ],
      "/八股文/": [
        {
          text: "八股文",
          items: [
            { text: "HTML", link: "/八股文/HTML" },
            { text: "CSS", link: "/八股文/CSS" },
            { text: "JS", link: "/八股文/JS" },
            { text: "ts", link: "/八股文/ts" },
            { text: "vue", link: "/八股文/vue" },
            { text: "vue3", link: "/八股文/vue3" },
            { text: "HTTP", link: "/八股文/HTTP" },
            { text: "Node", link: "/八股文/Node" },
            { text: "React", link: "/八股文/React" },
            { text: "jest", link: "/八股文/jest" },
            { text: "算法", link: "/八股文/算法" },
            { text: "设计模式", link: "/八股文/设计模式" },
            { text: "构建工具", link: "/八股文/构建工具" },
            { text: "浏览器", link: "/八股文/浏览器" },
          ],
        },
      ],
    },

    // socialLinks: [{ icon: "gitee", link: "https://gitee.com/longway__comeon" }],
  },
});
