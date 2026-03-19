# ollama

ollama 是一个可以让你在本地可以使用大模型的工具，支持图形化/命令行/程序化调用。支持 gpt-oss、Gemma 3、DeepSeek-R1、Qwen3 等大型语言模型。

参考链接 [https://ollama.ac.cn](https://ollama.ac.cn/)

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

|字段|描述|
|:--|:--|
|FROM (必填)|定义要使用的基础模型。|
|PARAMETER|设置 Ollama 运行模型时的参数。|
|TEMPLATE|发送给模型的完整提示词模板。|
|SYSTEM|指定将在模板中设置的系统消息。|
|ADAPTER|定义要应用于模型的 (Q)LoRA 适配器。|
|LICENSE|指定法律许可证。|
|MESSAGE|指定消息历史记录。|
|REQUIRES|指定模型所需的 Ollama 最低版本。|


### PARAMETER

|参数|描述|值类型|使用示例|
|:--|:--|:--|:--|
|num_ctx|设置用于生成下一个 token 的上下文窗口大小。num_ctx 设置了模型在处理你的请求时，能够“看到”和“记住”的最大文本长度（以 token 为单位）。你可以把它想象成模型的工作记忆上限。|（默认值：2048）|int	num_ctx 4096|
|repeat_last_n|设置模型回溯多远以防止重复。简单来说，repeat_last_n 设置了模型在生成新内容时，需要回看多长的历史文本来检查并避免重复。你可以把它想象成模型的"重复检查范围"。|（默认值：64, 0 = 禁用, -1 = num_ctx）|int|repeat_last_n 64|
|repeat_penalty|设置惩罚重复的强度。较高的值（例如 1.5）会更强烈地惩罚重复，而较低的值（例如 0.9）会更宽松。|（默认值：1.1）|float|repeat_penalty 1.1|
|temperature|模型的温度。提高温度会使模型回答更具创造性。|（默认值：0.8）|float|temperature 0.7|
|seed|设置用于生成的随机数种子。将其设置为特定数字将使模型针对相同的提示词生成相同的文本。，比如设置42，当系统场景的时候，总是回答一样的答案，可以避免一些漏洞/违禁词|（默认值：0）|int|seed 42|
|stop|设置要使用的停止序列。当遇到此模式时，LLM 将停止生成文本并返回。可以通过在 modelfile 中指定多个单独的 stop 参数来设置多个停止模式。|string|stop “AI assistant:“|
|num_predict|生成文本时预测的最大 token 数。可以控制输出的 token 数量|（默认值：-1，无限生成）|int|num_predict 42|
|top_k|降低生成胡言乱语的概率。较高的值（例如 100）将给出更多样化的答案，而较低的值（例如 10）将更加保守。强制保留概率最高的前K个词，其余的统统丢掉|（默认值：40）|int|top_k 40|
|top_p|与 top-k 协同工作。较高的值（例如 0.95）将导致更多样化的文本，而较低的值（例如 0.5）将生成更集中和保守的文本。动态选择累积概率不超过 P 的一组词，从首个最高概率开始累加|（默认值：0.9）|float|top_p 0.9|
|min_p|top_p 的替代方案，旨在确保质量和多样性的平衡。参数 _p_ 代表 token 被考虑的最小概率，相对于最可能 token 的概率。例如，当 _p_=0.05 且最可能的 token 概率为 0.9 时，值小于 0.045 的 logits 将被过滤掉。保留所有概率不低于（最高概率 × P）的词|（默认值：0.0）|float min_p 0.05|


## js 调用

Ollama 的 API 允许您通过编程方式运行模型并与之交互。

参考链接 [https://docs.ollama.ac.cn/api/introduction](https://docs.ollama.ac.cn/api/introduction)

ollama 默认运行在 `https://:11434/api`

| 方法 | 描述 | 示例 |
|:-----|:-----|:-----|
| `ollama.chat()` | 聊天补全 | `await ollama.chat({ model: 'llama3.1', messages: [{ role: 'user', content: '你好' }] })` |
| `ollama.generate()` | 文本生成 | `await ollama.generate({ model: 'llama3.1', prompt: '写一首关于春天的诗' })` |
| `ollama.embed()` | 生成文本嵌入向量 | `await ollama.embed({ model: 'nomic-embed-text', input: '天空为什么是蓝色的？' })` |
| `ollama.pull()` | 拉取模型 | `await ollama.pull({ model: 'llama3.2' })` |
| `ollama.push()` | 推送模型 | `await ollama.push({ model: 'myuser/mymodel:latest' })` |
| `ollama.list()` | 列出本地模型 | `await ollama.list()` |
| `ollama.delete()` | 删除模型 | `await ollama.delete({ model: 'llama3.1' })` |
| `ollama.create()` | 创建模型 | `await ollama.create({ from: 'gemma3', model: 'alpaca', system: 'You are Alpaca, a helpful AI assistant. You only answer with Emojis.' })` |
| `ollama.copy()` | 复制模型 | `await ollama.copy({ source: 'llama3.1', destination: 'llama3.1-backup' })` |
| `ollama.show()` | 显示模型信息 | `await ollama.show({ model: 'llama3.1' })` |
| `ollama.ps()` | 查看当前运行的模型 | `await ollama.ps()` |
| `ollama.version()` | 获取 Ollama 版本 | `await ollama.version()` |

完整示例
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