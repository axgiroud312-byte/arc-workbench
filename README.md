# Arc Workbench

基于 React、TypeScript、Tailwind CSS 4 和 shadcn Base UI 的中文 AI 与 Agent 组件库。

[中文预览](https://axgiroud312-byte.github.io/arc-workbench/) · [发布记录](https://github.com/axgiroud312-byte/arc-workbench/releases)

## 安装

在已初始化 shadcn Base UI 的 React 19 + Tailwind CSS 4 项目中，按需安装单件或组合包。

```sh
npx shadcn@latest add axgiroud312-byte/arc-workbench/coding-kit#v0.1.0
npx shadcn@latest list axgiroud312-byte/arc-workbench
```

在 Tailwind CSS 入口的 `@import` 区域加入库样式。示例使用 shadcn 默认的 `@/components` 别名。

```css
@import "@/components/arc-workbench/library/styles.css";
```

```tsx
import { CodingAgentPanel, ThemeProvider } from "@/components/arc-workbench/library/coding-kit"

export default function Example() {
  return (
    <ThemeProvider storageKey="arc-workbench-theme">
      <CodingAgentPanel />
    </ThemeProvider>
  )
}
```

安装目标由接收项目的 `components.json` 决定，源码集中在其 `components` 目录下的 `arc-workbench` 子目录。

## 组合包

| 安装项 | 内容 |
| --- | --- |
| `foundation` | 40 个 Base UI 基础件，包括表单、浮层、侧栏、消息滚动、代码和轨迹 |
| `chat-kit` | 对话、输入框、模型、问卷、附件、引用和推理摘要 |
| `coding-kit` | 完整编程工作台、子 Agent 编排、文件与测试、审批、侧栏和设置 |
| `agent-kit` | 运行、任务、审批、服务、知识库、配置和评测 |

59 个业务组件分为「对话与输入」「推理与上下文」「编程与执行」「AI 工作流」「Agent 管理」。每个组件有独立预览、安装命令和使用示例。基础件可通过 `ui/button`、`ui/message-scroller` 等名称单独安装。

## 本地开发

使用 Node.js 24。

```sh
npm ci
npm run dev
```

目录和 Registry 共用 `src/library/catalog.ts`。修改组件或它的依赖后，运行 `npm run registry:generate` 更新根目录的 `registry.json`。`npm run registry:check` 检查清单与源码是否一致。

## 编程工作台预览

打开[编程工作台](https://axgiroud312-byte.github.io/arc-workbench/?embed=coding-agent-panel)。左边按项目找会话，筛选菜单可只看待处理或执行中的会话。右边默认显示执行概览，点文件进入更宽的审阅区。点对话中的轮次或子任务会改变右栏的范围。设置有独立导航，返回工作台后恢复原来查看的轮次、子任务和文件。

发送一条消息可体验并行委派、选择测试范围和写入审批。批准会应用示例改动并继续测试。拒绝或停止会保留已经完成的排查。对话、侧栏和右栏从同一轮执行记录读取状态。

顶部「状态预览」可以直接切换执行中、待回答、待审批、执行失败和已停止。每个状态都可以检查子任务和执行记录，点「正常对话」回到原来的会话。

顶部「多子 Agent 编排」和[独立预览](https://axgiroud312-byte.github.io/arc-workbench/?embed=multi-agent-orchestration)都能切换并行执行、等待前置任务和单个子 Agent 失败。点子任务查看它的记录，点失败任务旁的「重试」会追加一次执行，并保留之前的失败日志。

| 参考 | 用在工作台里 |
| --- | --- |
| [T3 Code](https://t3.codes/) 和 [会话侧栏文档](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md) | 让会话保持在项目里，状态贴在会话行上。对话内折叠子 Agent 列表，右栏先呈现执行概况。 |
| [Orca 的差异审阅](https://www.onorca.dev/docs/review/diff-viewer) 和 [设置](https://www.onorca.dev/docs/settings) | 差异审阅分为文件清单和代码，设置按类别进入，选项按用途成组。 |
| [OpenCode 的模型选择](https://opencode.ai/docs/models/) | 输入框内的模型切换针对当前会话，设置里的默认模型用于新会话。 |
| [assistant-ui Tool UI](https://www.assistant-ui.com/docs/tools/tool-ui)、[AG-UI 事件](https://docs.ag-ui.com/concepts/events) 和 [A2UI](https://a2ui.org/concepts/overview/) | 把任务、工具调用、待回答和审批分别建模。界面用项目现有的 shadcn Base UI 控件渲染本地示例状态。 |

## 演示与真实服务

这些是可交互的前端组件。聊天、评测、研究、提取、工具连接、定时任务和发布使用本地示例，不会调用模型、上传文件或操作真实外部服务；刷新页面会重置大部分示例状态。通话组件演示文字片段和播放进度，没有真实录音。

部分组件提供数据与事件 props，具体类型可在源码页查看。Eval suite 额外提供 `cases`、`onRun(cases, signal)` 和 `onTriage(caseId, action)`：`onRun` 可以返回逐条结果的异步迭代器，停止按钮会中止对应信号。接入自己的服务后应自行验证错误处理、权限和业务规则。

与原站的差异：本项目重新实现布局与主要交互，没有包含原站 Pro 源码；示例内容和部分动效有简化。目录、按钮、状态、提示和演示内容已改为简体中文，品牌名称与代码标识符保留原文。

基础组件保留 shadcn/ui 的 MIT 许可，详见 `src/components/ui/LICENSE-shadcn.txt`。

模型与应用标志使用实际引用的 SVG：Claude、OpenAI、Codex、Gemini、Google 来自 [Lobe Icons](https://github.com/lobehub/lobe-icons)，工具与服务标志来自 [SVG Logos / Iconify](https://github.com/gilbarbara/logos)。资产保存在 `src/assets/brands`，无需在线加载；来源、版本、许可和文件校验值见该目录的 `SOURCES.md` 与 `sources.json`。模型选择时，图标跟随当前选项切换。

## 文件位置

```text
src/components/blocks/ai-conversation/  对话、模型、提示词等 9 个组件
src/components/blocks/ai-workflows/     搜索、编辑、研究等 9 个组件
src/components/blocks/agents/          Agent 管理等 9 个组件
src/components/blocks/chat-elements/   独立对话组件和预览
src/components/blocks/coding-agent/    编程对话记录、侧栏、设置和组合面板
src/components/blocks/eval-suite.tsx   评测组件
src/components/ui/                    shadcn/ui 基础组件
src/registry.ts                       组件目录与用法
src/App.tsx                           组件浏览器
src/index.css                         主题和页面样式
```

## 检查

```bash
npm run typecheck
```

开发预览直接运行源码，不需要先生成 `dist`。需要自行部署时再运行 `npm run build`。

shadcn 的审批示例使用 AI SDK 继续执行工具。本项目用本地演示实现同样的等待、批准和拒绝流程。Base UI 的 Command 注册项仍使用 `cmdk`，项目中闲置的 Command 组件已随其 Radix 依赖移除。
