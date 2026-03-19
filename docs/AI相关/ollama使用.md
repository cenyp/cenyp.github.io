# ollama

ollama 是一个可以让你在本地可以使用大模型的工具，支持图形化/命令行/程序化调用。支持 gpt-oss、Gemma 3、DeepSeek-R1、Qwen3 等大型语言模型。

参考链接 [https://ollama.ac.cn](https://ollama.ac.cn/)

## 部分指令


| 命令                     | 描述               | 示例                                     |
| ---------------------- | ---------------- | -------------------------------------- |
| `ollama serve`         | 启动 Ollama 服务     | `ollama serve`                         |
| `ollama create`        | 从 Modelfile 创建模型 | `ollama create mymodel -f ./Modelfile` |
| `ollama show`          | 显示模型信息           | `ollama show llama3.1`                 |
| `ollama run`           | 运行模型并与之对话        | `ollama run llama3.1 "你好"`             |
| `ollama pull`          | 拉取远程模型到本地        | `ollama pull llama3.2`                 |
| `ollama push`          | 将本地模型推送到远程仓库     | `ollama push username/mymodel:latest`  |
| `ollama list` (或 `ls`) | 列出本地所有模型         | `ollama list`                          |
| `ollama ps`            | 查看当前正在运行的模型      | `ollama ps`                            |
| `ollama stop`          | 停止一个正在运行的模型      | `ollama stop llama3.1`                 |
| `ollama rm`            | 删除本地模型           | `ollama rm mymodel`                    |
| `ollama cp`            | 复制模型             | `ollama cp llama3.1 my-llama`          |
| `ollama help`          | 查看帮助信息           | `ollama help`                          |


## Modelfile

Modelfile 可以让你拥有自己的模型，支持对模型参数进行微调

参考链接 [https://docs.ollama.ac.cn/modelfile](https://docs.ollama.ac.cn/modelfile)

示例：

```md
# FROM (必选): 选择基础模型
FROM qwen3.5:0.8b

# SYSTEM (可选): 设定系统角色，定义模型的说话风格 [citation:1][citation:4]
SYSTEM 贾维斯，一个AI管家

MESSAGE user 在吗
MESSAGE assistant 不在。
```

### 字段示例


| 字段        | 描述                     |
| --------- | ---------------------- |
| FROM (必填) | 定义要使用的基础模型。            |
| PARAMETER | 设置 Ollama 运行模型时的参数。    |
| TEMPLATE  | 发送给模型的完整提示词模板。         |
| SYSTEM    | 指定将在模板中设置的系统消息。        |
| ADAPTER   | 定义要应用于模型的 (Q)LoRA 适配器。 |
| LICENSE   | 指定法律许可证。               |
| MESSAGE   | 指定消息历史记录。              |
| REQUIRES  | 指定模型所需的 Ollama 最低版本。   |


### PARAMETER


| 参数             | 描述                                                                                                                                                     | 值类型                            | 使用示例                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------- |
| num_ctx        | 设置用于生成下一个 token 的上下文窗口大小。num_ctx 设置了模型在处理你的请求时，能够“看到”和“记住”的最大文本长度（以 token 为单位）。你可以把它想象成模型的工作记忆上限。                                                      | （默认值：2048）                     | int num_ctx 4096     |
| repeat_last_n  | 设置模型回溯多远以防止重复。简单来说，repeat_last_n 设置了模型在生成新内容时，需要回看多长的历史文本来检查并避免重复。你可以把它想象成模型的"重复检查范围"。                                                                 | （默认值：64, 0 = 禁用, -1 = num_ctx） | int                  |
| repeat_penalty | 设置惩罚重复的强度。较高的值（例如 1.5）会更强烈地惩罚重复，而较低的值（例如 0.9）会更宽松。                                                                                                     | （默认值：1.1）                      | float                |
| temperature    | 模型的温度。提高温度会使模型回答更具创造性。                                                                                                                                 | （默认值：0.8）                      | float                |
| seed           | 设置用于生成的随机数种子。将其设置为特定数字将使模型针对相同的提示词生成相同的文本。，比如设置42，当系统场景的时候，总是回答一样的答案，可以避免一些漏洞/违禁词                                                                      | （默认值：0）                        | int                  |
| stop           | 设置要使用的停止序列。当遇到此模式时，LLM 将停止生成文本并返回。可以通过在 modelfile 中指定多个单独的 stop 参数来设置多个停止模式。                                                                           | string                         | stop “AI assistant:“ |
| num_predict    | 生成文本时预测的最大 token 数。可以控制输出的 token 数量                                                                                                                    | （默认值：-1，无限生成）                  | int                  |
| top_k          | 降低生成胡言乱语的概率。较高的值（例如 100）将给出更多样化的答案，而较低的值（例如 10）将更加保守。强制保留概率最高的前K个词，其余的统统丢掉                                                                             | （默认值：40）                       | int                  |
| top_p          | 与 top-k 协同工作。较高的值（例如 0.95）将导致更多样化的文本，而较低的值（例如 0.5）将生成更集中和保守的文本。动态选择累积概率不超过 P 的一组词，从首个最高概率开始累加                                                          | （默认值：0.9）                      | float                |
| min_p          | top_p 的替代方案，旨在确保质量和多样性的平衡。参数 *p* 代表 token 被考虑的最小概率，相对于最可能 token 的概率。例如，当 *p*=0.05 且最可能的 token 概率为 0.9 时，值小于 0.045 的 logits 将被过滤掉。保留所有概率不低于（最高概率 × P）的词 | （默认值：0.0）                      | float min_p 0.05     |


## js 调用

Ollama 的 API 允许您通过编程方式运行模型并与之交互。

参考链接 [https://docs.ollama.ac.cn/api/introduction](https://docs.ollama.ac.cn/api/introduction)

ollama 默认运行在 `https://:11434/api`

> 方法示例


| 方法                  | 描述           | 示例                                                                                                                                         |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ollama.chat()`     | 聊天补全         | `await ollama.chat({ model: 'llama3.1', messages: [{ role: 'user', content: '你好' }] })`                                                    |
| `ollama.generate()` | 文本生成         | `await ollama.generate({ model: 'llama3.1', prompt: '写一首关于春天的诗' })`                                                                        |
| `ollama.embed()`    | 生成文本嵌入向量     | `await ollama.embed({ model: 'nomic-embed-text', input: '天空为什么是蓝色的？' })`                                                                   |
| `ollama.pull()`     | 拉取模型         | `await ollama.pull({ model: 'llama3.2' })`                                                                                                 |
| `ollama.push()`     | 推送模型         | `await ollama.push({ model: 'myuser/mymodel:latest' })`                                                                                    |
| `ollama.list()`     | 列出本地模型       | `await ollama.list()`                                                                                                                      |
| `ollama.delete()`   | 删除模型         | `await ollama.delete({ model: 'llama3.1' })`                                                                                               |
| `ollama.create()`   | 创建模型         | `await ollama.create({ from: 'gemma3', model: 'alpaca', system: 'You are Alpaca, a helpful AI assistant. You only answer with Emojis.' })` |
| `ollama.copy()`     | 复制模型         | `await ollama.copy({ source: 'llama3.1', destination: 'llama3.1-backup' })`                                                                |
| `ollama.show()`     | 显示模型信息       | `await ollama.show({ model: 'llama3.1' })`                                                                                                 |
| `ollama.ps()`       | 查看当前运行的模型    | `await ollama.ps()`                                                                                                                        |
| `ollama.version()`  | 获取 Ollama 版本 | `await ollama.version()`                                                                                                                   |


> 完整示例

```js
import ollama from "ollama";

const response = await ollama.chat({
  model: "qwen3.5:0.8b",
  messages: [{ role: "user", content: "现在几点了" }],
  think: false,
});

// 输出向量
// const response = await ollama.embed({
//   model: "qwen3-embedding:0.6b",
//   input: "天空为什么是蓝色的？",
// });

console.log(response);
```

## openclaw

可以直接调用 openclaw 但是回答很慢，即使用0.8b的模型，推测是附带了大量的上下文

参考链接[https://docs.ollama.ac.cn/integrations/openclaw](https://docs.ollama.ac.cn/integrations/openclaw)

> 部分指令

```
//安装 OpenClaw
npm install -g openclaw@latest

//然后运行设置向导
openclaw onboard --install-daemon

//启动
ollama launch openclaw
```



## RAG

RAG（检索增强生成）是一种让大语言模型在回答问题前，先“查阅资料”的技术框架


### 目录
```
your-project/
├── documents/          # 存放你的所有资料（.txt, .pdf, .docx）
├─────密码.txt  `问：密码是什么？ 答：12345678`
├─────喜好.txt  `问：喜欢吃的水果 答：香蕉`
├── rag.js       # 主脚本
└── vector-store.json   # 生成的向量库
```

### 示例代码

```js
// rag-txt-only.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ollama from "ollama";
import { log } from "console";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置
const DOCS_DIR = path.join(__dirname, "documents"); // 存放 .txt 文件的文件夹
const EMBEDDING_MODEL = "nomic-embed-text"; // 向量模型
const LLM_MODEL = "qwen3.5:0.8b"; // 对话模型
const VECTOR_STORE = path.join(__dirname, "vector-store.json"); // 向量存储文件
const CHUNK_SIZE = 500; // 每个文本块最大字符数
const CHUNK_OVERLAP = 50; // 重叠字符数

/**
 * 读取所有 .txt 文件并切分成块
 */
async function loadAndChunkDocuments() {
  const files = await fs.readdir(DOCS_DIR);
  const txtFiles = files.filter((f) => f.toLowerCase().endsWith(".txt"));

  if (txtFiles.length === 0) {
    throw new Error("documents 文件夹中没有找到 .txt 文件");
  }

  const chunks = [];
  for (const file of txtFiles) {
    const filePath = path.join(DOCS_DIR, file);
    const content = await fs.readFile(filePath, "utf-8");

    // 简单的滑动窗口切分
    for (let i = 0; i < content.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      const chunkText = content.substring(i, i + CHUNK_SIZE);
      if (chunkText.trim().length > 0) {
        chunks.push({
          id: `${file}-${i}`,
          text: chunkText,
          source: file,
        });
      }
    }
  }
  return chunks;
}

/**
 * 构建索引：生成向量并保存
 */
async function buildIndex() {
  console.log("📄 读取文档并切分...");
  const chunks = await loadAndChunkDocuments();
  console.log(`   共 ${chunks.length} 个文本块`);

  console.log("⚡ 生成向量 (Embedding)...");
  const vectorStore = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const response = await ollama.embed({
      model: EMBEDDING_MODEL,
      input: chunk.text,
    });
    vectorStore.push({
      id: chunk.id,
      text: chunk.text,
      source: chunk.source,
      vector: response.embeddings[0],
    });
    if ((i + 1) % 20 === 0) {
      console.log(`   已完成 ${i + 1}/${chunks.length}`);
    }
  }

  await fs.writeFile(VECTOR_STORE, JSON.stringify(vectorStore, null, 2));
  console.log(`✅ 索引构建完成，已保存至 ${VECTOR_STORE}`);
}

/**
 * 余弦相似度计算
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

/**
 * 回答问题
 */
async function ask(question) {
  // 加载向量库
  const raw = await fs.readFile(VECTOR_STORE, "utf-8");
  const vectorStore = JSON.parse(raw);

  // 问题向量化
  const qEmbed = await ollama.embed({
    model: EMBEDDING_MODEL,
    input: question,
  });
  const qVec = qEmbed.embeddings[0];

  // 检索 top 5 最相似的块
  const scored = vectorStore.map((item) => ({
    ...item,
    score: cosineSimilarity(qVec, item.vector),
  }));
  scored.sort((a, b) => b.score - a.score);
  const topK = scored.slice(0, 5);

  // 构建上下文
  const context = topK.map((item) => item.text).join("\n\n---\n\n");
  console.log(context);
  // 生成 prompt
  const prompt = `你是一个只会严格依据资料回答的助手。
  请根据以下资料回答问题。
  
  规则：
  - 如果资料中提供了问题的明确答案，则只输出答案本身，不要添加任何解释或前缀。
  - 如果资料中没有提供问题的明确答案，则必须只输出“不知道”三个字，不要输出任何其他文字。`;

  const messages = [
    {
      role: "system",
      content: prompt,
    },
    { role: "user", content: `资料：\n${context}\n\n问题：${question}` },
  ];

  // 调用对话模型
  const response = await ollama.chat({
    model: LLM_MODEL,
    messages: messages,
    // think: false,
  });

  console.log(`\n🤖 回答：${response.message.content}`);
}

/**
 * 命令行入口
 */
async function main() {
  const cmd = process.argv[2];
  if (cmd === "build") {
    await buildIndex();
  } else if (cmd === "ask") {
    const question = process.argv.slice(3).join(" ");
    if (!question) return console.log('请提供问题，例如：node rag-txt-only.js ask "你的问题"');
    await ask(question);
  } else {
    console.log(`
用法:
  node rag-txt-only.js build          # 构建索引（处理 documents 文件夹下的所有 .txt）
  node rag-txt-only.js ask "你的问题"  # 提问
    `);
  }
}

main().catch(console.error);
```


> 执行效果

```js
// 安装依赖
// nomic-embed-text 是一个高性能的开源文本嵌入模型，它的核心作用是将文本（如句子、文档）转换为计算机能理解的向量。你可以把它看作一个“语义编码器”，在构建RAG应用时负责文本的向量化工作
> ollama pull nomic-embed-text

// 构建索引
> node rag.js build

> node rag.js ask "aa"
> 🤖 回答：不知道

> node rag.js ask "aa"
> 🤖 回答：不知道

> node rag.js ask "你最不喜欢的水果是什么"
> 🤖 回答：不知道

> node rag.js ask "你最喜欢的水果是什么"
> 🤖 回答：香蕉

> node rag.js ask "密码是多少"
> 🤖 回答：12345678
```