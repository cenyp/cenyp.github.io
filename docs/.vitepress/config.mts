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
      provider: 'local'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    // todo
    lastUpdated:{
      text: '上次更新时间',
      format: 'YYYY-MM-DD HH:mm:ss'
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "vue源码",
        items: [
          { text: "vue2源码", link: "/vue源码/vue2源码" },
          { text: "vue3源码", link: "/vue源码/vue3源码" },
          { text: "vuex源码", link: "/vue源码/vuex源码" },
          { text: "vue-route源码", link: "/vue源码/vue-route源码" },
        ],
      },
      {
        text: "心得笔记",
        items: [
          { text: "js相关", link: "/心得笔记/js相关" },
          { text: "css相关", link: "/心得笔记/css相关" },
          { text: "vue相关", link: "/心得笔记/vue相关" },
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
            { text: "css相关", link: "/心得笔记/css相关" },
            { text: "vue相关", link: "/心得笔记/vue相关" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "gitee", link: "https://gitee.com/longway__comeon" }],
  },
});
