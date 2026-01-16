> ⚠️ 本项目已归档并停止维护，后续工作转向 skill 形式的 AI 软件开发流程项目：devflow-core  
> 项目地址：https://github.com/ZhcChen/devflow-core

# Scaff AI

AI 辅助开发的项目脚手架模板。

## 核心理念

**让 AI 按照标准化流程开发，而不是随意发挥。**

- `AGENTS.md` - AI 入口文件，定义角色和工作流程
- `docs/` - 文档驱动开发，AI 按文档规范执行
- `.cc-agent/` - 任务状态持久化，支持跨会话续接

## 工作流程

```
用户
  ↓
Orchestrator（主 Agent）
  ↓
PM → [确认] → Architect → [确认] → Developer → Reviewer → Tester
```

**8 个阶段**：需求分析 → PRD确认 → 技术设计 → 方案确认 → 编码 → 审查 → 测试 → 完成

**2 个确认节点**：PRD 和技术方案必须用户确认后才能继续

## 使用方式

### 初始化新项目

```bash
# 复制核心文件到你的项目
cp AGENTS.md /your-project/
cp -r docs/ /your-project/docs/
```

### 开始工作

1. 打开 AI 工具（Claude Code / Cursor / 等）
2. AI 读取 `AGENTS.md`，自动进入 Orchestrator 角色
3. 输入需求，AI 按流程执行

### 指令

| 指令 | 作用 |
|------|------|
| `/cc-status` | 查看当前任务 |
| `/cc-tasks` | 列出所有任务 |
| `/cc-switch <id>` | 切换任务 |
| `/cc-confirm` | 确认当前阶段 |
| `/cc-back` | 回退上一阶段 |

## 项目结构

```
scaff-ai/
├── AGENTS.md                 # AI 入口文件
├── docs/
│   ├── index.md              # 文档索引
│   ├── workflow/             # 工作流程（核心）
│   │   ├── orchestrator/     # 主 Agent
│   │   ├── pm/               # PM 子 Agent
│   │   ├── architect/        # Architect 子 Agent
│   │   ├── developer/        # Developer 子 Agent
│   │   ├── reviewer/         # Reviewer 子 Agent
│   │   ├── tester/           # Tester 子 Agent
│   │   ├── state/            # 状态管理
│   │   └── commands/         # 指令详情
│   ├── requirements/         # PRD 产出
│   ├── specs/                # 技术方案产出
│   └── ...                   # 其他文档模板
├── api/                      # 后端示例 (Bun + Elysia)
├── admin/                    # 管理后台示例 (React + Vite)
├── web-app/                  # 前端应用示例 (Nuxt.js)
└── tests/                    # 测试模块
```

## 状态文件

```
.cc-agent/
├── index.yaml        # 任务索引 + 当前任务指针
└── tasks/
    └── {id}.yaml     # 任务详情（含 git commit 关联）
```

## 技术栈（示例代码）

| 模块 | 技术 | 端口 |
|------|------|------|
| API | Bun + Elysia + Drizzle + MySQL | 7100 |
| Admin | React + Vite + Ant Design | 7101 |
| Web App | Nuxt.js 3 + Vue 3 | 7102 |
| 测试 | Go + resty + testify | - |

## 快速开始（示例代码）

```bash
# 安装依赖
bun install

# 启动开发服务
bun run dev

# 数据库配置
cp api/.env.example api/.env
cd api && bun run db:push
```

## 文档

详见 [docs/index.md](./docs/index.md)

## 许可证

MIT
