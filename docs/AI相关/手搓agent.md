# 手搓 agent

agent 实则是 Loop(LLM + Context + Tools)。

LLM 为大模型，是整个 agent 的大脑，负责思考问题，操作工具
Context 为上下文记忆，负责对用户输入 AI 输出做存储记忆，避免 AI 不知道上一个提问&回答内容
Tools 为工具集，根据各种规范形式为 LLM 提供可控制的工具，如 skill

agent 对比传统的问答客户端差异在于：

1. 可以循环思考，直到完成任务
2. 可以操控各种工具，如本地文件读写，浏览器控制

## 实现一个查询天气的 agent

```js
import ollama from "ollama";

// ---------- 模拟天气查询工具（可替换为真实 API）----------
function getCurrentWeather({ location, unit = "celsius" }) {
  const mockWeatherDB = {
    北京: { temperature: 22, condition: "晴", humidity: 40 },
    上海: { temperature: 25, condition: "多云", humidity: 65 },
    深圳: { temperature: 28, condition: "阵雨", humidity: 80 },
  };

  const weather = mockWeatherDB[location] || {
    temperature: 20,
    condition: "未知",
    humidity: 50,
  };

  return {
    location,
    temperature: weather.temperature,
    unit,
    condition: weather.condition,
    humidity: weather.humidity,
  };
}

// ---------- 定义工具（与 OpenAI 格式兼容）----------
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "获取指定地点的当前天气情况",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "城市名称，例如：北京、上海",
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "温度单位，默认为摄氏度",
          },
        },
        required: ["location"],
      },
    },
  },
];

// ---------- Agent 主逻辑 ----------
async function weatherAgent(userQuery) {
  // 第一轮：模型可能返回工具调用请求
  let response = await ollama.chat({
    model: "qwen3.5:0.8b", // 你指定的模型
    messages: [{ role: "user", content: userQuery }],
    tools, // 传入工具定义
    think: true, // 开启深度思考
    options: { temperature: 0.1 },
  });

  const assistantMessage = response.message;

  // 检查是否需要调用工具
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    // 构建第二轮消息：包含用户请求、助手工具调用、工具执行结果
    const messages = [
      { role: "user", content: userQuery },
      assistantMessage, // 助手返回的工具调用请求
    ];

    // 遍历所有工具调用（本例中只有一个）
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = toolCall.function.arguments;

      if (functionName === "get_current_weather") {
        const weatherResult = getCurrentWeather(functionArgs);
        messages.push({
          role: "tool",
          content: JSON.stringify(weatherResult, null, 2),
          tool_call_id: toolCall.id, // 必须匹配调用ID
        });
      }
    }

    // 第二轮：将工具结果发送给模型，生成最终回答
    response = await ollama.chat({
      model: "qwen3.5:0.8b",
      messages,
      tools, // 仍可传入，但模型一般不再调用
      think: false,
      options: { temperature: 0.1 },
    });

    return response.message.content;
  } else {
    // 模型未请求工具，直接返回回答
    return assistantMessage.content;
  }
}

// ---------- 测试 ----------
(async () => {
  const queries = ["北京今天天气怎么样？", "深圳热不热？湿度多少？", "帮我看看上海的温度，用华氏度表示"];

  for (const q of queries) {
    console.log(`用户：${q}`);
    try {
      const answer = await weatherAgent(q);
      console.log(`Agent：${answer}\n`);
    } catch (error) {
      console.error("出错：", error.message);
    }
  }
})();
```

# skill 接入

上面的 getCurrentWeather 可以算作为内置的 skill，下面引入可插拔的 skill

OpenSkills 是一个“技能加载器”，它能让你的 Agent 像调用 get_current_weather 一样，动态加载和执行外部的“技能”（如处理 PDF、网页爬虫等）

> OpenSkills 安装

```bash
npm install -g openskills

openskills install anthropics/skills # 这里可以选择不引入技能

openskills sync # 同步技能列表，运行此命令，OpenSkills 会扫描所有已安装的技能，并生成一个 AGENTS.md 文件，这个文件就像是 Agent 的“技能菜单”，里面用 <available_skills> 格式记录了每个技能的名字和描述。你的 Agent 在后续步骤中就需要读取这个文件来了解自己有什么“超能力”。
```

> 在代码里面加入 openskills

## 先预设一些技能，在`.claude\skills`目录下增加对应文件夹，设置 SKILL.md 文件

掷骰子
|-dice-roller
|--SKILL.md

```md
---
name: dice-roller
description: "掷骰子。当用户要求'掷骰子'、'扔个骰子'、'roll a dice'时调用。"
---

# 掷骰子技能

返回一个 1~6 的随机整数。

## 使用方式

调用此技能后，无需额外输入，直接生成随机结果。
```

占卜
|-fortune-demo
|--SKILL.md

```md
---
name: fortune-demo
description: "提供简单的趣味占卜。当用户说'占卜'、'今日运势'、'抽签'时使用。"
---

# 简易占卜 Demo

直接随机返回一句运势语。

## 可用运势库

| 编号 | 运势语                          |
| ---- | ------------------------------- |
| 1    | 🌟 大吉：今日心想事成，宜行动。 |
| 2    | ☀️ 吉：小事可成，保持乐观。     |
| 3    | ☁️ 平：平平淡淡才是真。         |
| 4    | 🌧️ 小凶：诸事谨慎，忌冲动。     |
| 5    | ⚡ 凶：宜静不宜动，改日再试。   |

## 使用方式

当用户请求占卜时，从上述列表中随机选择一条返回，并用友好的语气告知用户。

无需调用外部脚本或 API。
```

## 加载技能，运行`openskills sync`，更新文件

```md
# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:

- Invoke: `npx openskills read <skill-name>` (run in your shell)
- For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:

- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
  </usage>

<available_skills>

<skill>
<name>dice-roller</name>
<description>"掷骰子。当用户要求'掷骰子'、'扔个骰子'、'roll a dice'时调用。"</description>
<location>project</location>
</skill>

<skill>
<name>fortune-demo</name>
<description>"提供简单的趣味占卜。当用户说'占卜'、'今日运势'、'抽签'时使用。"</description>
<location>project</location>
</skill>

</available_skills>

<!-- SKILLS_TABLE_END -->

</skills_system>
```

### 代码接入

```js
import ollama from "ollama";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const MODEL = "qwen3.5:0.8b"; // 根据诊断结果，该模型支持工具调用但需清理输出

// ---------- 模拟天气数据库 ----------
const mockWeatherDB = {
  北京: { temperature: 22, condition: "晴", humidity: 40 },
  上海: { temperature: 25, condition: "多云", humidity: 65 },
  深圳: { temperature: 28, condition: "阵雨", humidity: 80 },
};

function getCurrentWeather({ location, unit = "celsius" }) {
  const weather = mockWeatherDB[location] || { temperature: 20, condition: "未知", humidity: 50 };
  return { location, temperature: weather.temperature, unit, condition: weather.condition, humidity: weather.humidity };
}

// ---------- 读取 OpenSkills 系统提示 ----------
function loadSkillsSystemPrompt() {
  const agentsPath = path.join(process.cwd(), "AGENTS.md");
  try {
    return fs.readFileSync(agentsPath, "utf-8");
  } catch {
    return "";
  }
}

const SKILLS_SYSTEM_PROMPT = loadSkillsSystemPrompt();

// ---------- 工具定义 ----------
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "获取指定地点的当前天气情况",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "城市名称，例如：北京、上海" },
          unit: { type: "string", enum: ["celsius", "fahrenheit"], description: "温度单位" },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_skills",
      description: "列出所有通过 OpenSkills 安装的可用技能",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "use_skill",
      description: "调用指定的 OpenSkills 技能执行复杂任务（如占卜、PDF处理等）",
      parameters: {
        type: "object",
        properties: {
          skill_name: { type: "string", description: "要调用的技能名称，必须从 AGENTS.md 中的可用技能列表选取" },
          prompt: { type: "string", description: "传递给技能的提示词（可选）" },
        },
        required: ["skill_name"],
      },
    },
  },
];

// ---------- 清理助手消息中的思考内容 ----------
function cleanAssistantMessage(msg) {
  if (msg.content && typeof msg.content === "string") {
    const thinkIndex = msg.content.indexOf("</think>");
    if (thinkIndex !== -1) {
      msg.content = msg.content.substring(thinkIndex + 8).trim();
    }
    if (msg.content === "") {
      delete msg.content; // 删除空内容避免干扰
    }
  }
  return msg;
}

// ---------- 解析工具参数（容错处理）----------
function parseToolArguments(rawArgs) {
  if (typeof rawArgs === "object" && rawArgs !== null) return rawArgs;
  if (typeof rawArgs === "string") {
    try {
      return JSON.parse(rawArgs);
    } catch {
      // 尝试从XML中提取字段
      const skillMatch = rawArgs.match(/<skill_name>(.*?)<\/skill_name>/i);
      if (skillMatch) return { skill_name: skillMatch[1] };
      const locMatch = rawArgs.match(/<location>(.*?)<\/location>/i);
      if (locMatch) return { location: locMatch[1] };
      return {};
    }
  }
  return {};
}

// ---------- Agent 核心 ----------
async function agent(userQuery) {
  const messages = [];
  if (SKILLS_SYSTEM_PROMPT) {
    messages.push({ role: "system", content: SKILLS_SYSTEM_PROMPT });
  }
  messages.push({ role: "user", content: userQuery });

  let response = await ollama.chat({
    model: MODEL,
    messages,
    tools,
    think: true,
    options: { temperature: 0.1 },
  });

  let assistantMessage = response.message;
  assistantMessage = cleanAssistantMessage(assistantMessage);

  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const args = parseToolArguments(toolCall.function.arguments);
      let toolResult;

      try {
        if (functionName === "get_current_weather") {
          toolResult = getCurrentWeather(args);
        } else if (functionName === "list_skills") {
          const agentsPath = path.join(process.cwd(), ".claude", "skills", "AGENTS.md");
          const content = fs.readFileSync(agentsPath, "utf-8");
          toolResult = { skills_xml: content };
        } else if (functionName === "use_skill") {
          const cmd = `npx openskills read ${args.skill_name}`;
          const output = execSync(cmd, { encoding: "utf-8" });
          toolResult = { skill_output: output };
        } else {
          toolResult = { error: `未知工具: ${functionName}` };
        }
      } catch (error) {
        toolResult = { error: error.message };
      }

      messages.push({
        role: "tool",
        content: JSON.stringify(toolResult, null, 2),
        tool_call_id: toolCall.id,
      });
    }

    // 第二轮：不传 tools 防止再次调用
    response = await ollama.chat({
      model: MODEL,
      messages,
      think: true,
      options: { temperature: 0.1 },
    });
    let finalMessage = response.message;
    finalMessage = cleanAssistantMessage(finalMessage);
    return finalMessage.content;
  } else {
    return assistantMessage.content;
  }
}

// ---------- 测试 ----------
(async () => {
  const queries = ["北京今天天气怎么样？", "帮我占卜一下今天的运势", "掷个骰子"];

  for (const q of queries) {
    console.log(`👤 用户：${q}`);
    try {
      const answer = await agent(q);
      console.log(`🤖 Agent：${answer}\n`);
    } catch (error) {
      console.error("❌ 出错：", error.message);
    }
  }
})();
```

> 运行效果

```bash
👤 用户：北京今天天气怎么样？
🤖 Agent：北京今天天气晴朗，温度为22摄氏度，湿度为40%。

👤 用户：帮我占卜一下今天的运势
🤖 Agent：好的！我已经为你准备好了今天的运势占卜。

**🎲 幸运运势：** 🌟 大吉：今日心想事成，宜行动！

---

### 💡 今日运势解读

根据你提供的信息，我为你预测了以下运势：

| 编号 | 运势语                          |
|------|---------------------------------|
| 1    | 🌟 大吉：今日心想事成，宜行动。 |
| 2    | ☀️ 吉：小事可成，保持乐观。     |
| 3    | ☁️ 平：平平淡淡才是真。         |
| 4    | 🌧️ 小凶：诸事谨慎，忌冲动。     |
| 5    | ⚡ 凶：宜静不宜动，改日再试。   |

---

### 📝 今日建议

1. **行动**：今天非常适合采取行动，无论是工作还是生活，保持积极的心态会帮助你更好地完成目标。
2. **乐观**：保持乐观的心态，相信事情会有转机。
3. **谨慎**：虽然运势是吉利的，但也要注意避免冲动行事，做好充分准备。

---

### 🎯 幸运提示

- **今日宜做什么**：行动、学习、工作
- **适合做什么**：小事可成、保持乐观
- **注意事项**：诸事谨慎、忌冲动

希望今天的运势顺利！如果有其他问题或需要更多建议，随时告诉我哦～ 😊

👤 用户：掷个骰子
🤖 Agent：好的，我为您掷了一个骰子！🎲

**结果：** 6（六）
```
