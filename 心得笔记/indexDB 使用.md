```ts
import { message } from "ant-design-vue";

const path = "https://xxxxx?" + new Date().getTime();

function init() {
  // 判断是否支持 indexedDB
  if (window.indexedDB) {
    fetch(path)
      .then((response) => response.json())
      .then((data) => {
        saveData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        message.error("地区数据加载失败");
      });
  }
}

// 获取数据
async function getData(key: string, fn: Function) {
  console.log("get data");
  // 判断是否支持 indexedDB，否则增加请求数据并返回
  if (window.indexedDB) {
    readData(key, (data: any) => {
      fn(data);
    });
  } else {
    fn(await fetchData(key));
  }
}

// 数据请求
async function fetchData(key: string) {
  const data = await fetch(path)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      message.error("地区数据加载失败");
    });
  if (window.indexedDB) {
    saveData(data);
  }
  return data[key];
}

// 数据存储
function saveData(data: any) {
  // 打开或创建数据库
  const dbRequest = indexedDB.open("basicData", 1);

  dbRequest.onerror = function (event) {
    console.error("数据库打开失败");
  };

  // 成功回调
  dbRequest.onsuccess = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    if (db.objectStoreNames.contains("regionData")) {
      // 该方法用于创建一个数据库事务，返回一个 IDBTransaction 对象。向数据库添加数据之前，必须先创建数据库事务。
      // 第一个参数是一个数组，里面是所涉及的对象仓库，通常是只有一个；第二个参数是一个表示操作类型的字符串。目前，操作类型只有两种：readonly（只读）和readwrite（读写）
      // IDBDatabase 对象的transaction()返回一个事务对象，该对象的objectStore()方法返回 IDBObjectStore 对象
      const objectStore = db
        .transaction(["regionData"], "readwrite")
        .objectStore("regionData");
      // 获取一个指针对象
      const cursorRequest = objectStore.openCursor();

      // 遍历游标
      cursorRequest.onsuccess = function (event) {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          // 更新
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              objectStore.put({ type: key, data: data[key] });
            }
          }
        } else {
          // 新增
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              objectStore.add({ type: key, data: data[key] });
            }
          }
        }
      };
    }
  };

  // onupgradeneeded事件在数据库第一次创建或版本号发生变化时触发。在这个事件处理程序中，可以创建对象存储和索引
  dbRequest.onupgradeneeded = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    // 判断是否已经存在对象存储空间，如果存在则不创建，否则创建对象存储空间
    if (!db.objectStoreNames.contains("regionData")) {
      // 创建对象存储空间，keyPath设置（主键）为type
      const objectStore = db.createObjectStore("regionData", {
        keyPath: "type",
      });
      // 创建索引
      // objectStore.createIndex('type', 'type', { unique: true })
    }
  };
}

// 读数据库数据
function readData(key: string, fn: Function) {
  const dbRequest = indexedDB.open("basicData", 1);
  dbRequest.onsuccess = async function (event) {
    const db = (event.target as IDBOpenDBRequest).result;
    if (db.objectStoreNames.contains("regionData")) {
      const objectStore = db
        .transaction(["regionData"])
        .objectStore("regionData");
      const request = objectStore.get(key);

      request.onerror = async function (event) {
        fn(await fetchData(key));
        console.log("事务失败");
      };

      request.onsuccess = async function (event) {
        if (request.result) {
          //  console.log('data: ' + request.result.data)
          fn(request.result.data);
        } else {
          fn(await fetchData(key));
          console.log("未获得数据记录");
        }
      };
    } else {
      fn(await fetchData(key));
    }
  };

  dbRequest.onupgradeneeded = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;

    if (!db.objectStoreNames.contains("regionData")) {
      // 创建对象存储空间
      const objectStore = db.createObjectStore("regionData", {
        keyPath: "type",
      });
      // // 创建索引
      // objectStore.createIndex('type', 'type', { unique: true })
    }
  };
}

export { init, getData };
```
