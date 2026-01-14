# 状态管理

## 目录结构

```
.cc-agent/
├── index.yaml              # 索引 + 当前任务指针（轻量）
└── tasks/
    ├── 001.yaml            # 任务详情
    ├── 002.yaml
    └── ...
```

## index.yaml

任务索引，保持轻量，快速读取。

```yaml
current: "001"

tasks:
  - id: "001"
    name: "用户登录功能"
    stage: "技术设计"
  - id: "002"
    name: "权限管理"
    stage: "需求分析"
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `current` | 当前任务 ID |
| `tasks` | 任务列表（轻量索引） |
| `tasks[].id` | 任务 ID |
| `tasks[].name` | 任务名称 |
| `tasks[].stage` | 当前阶段 |

## tasks/xxx.yaml

任务详情，按任务 ID 命名。

```yaml
id: "001"
name: "用户登录功能"
stage: "技术设计"
created_at: "2025-01-13"
prd: "docs/requirements/PRD-001.md"
spec: "docs/specs/SPEC-001.md"
commits:
  - "a1b2c3d"
  - "e4f5g6h"
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `id` | 任务 ID |
| `name` | 任务名称 |
| `stage` | 当前阶段 |
| `created_at` | 创建时间 |
| `prd` | PRD 文件路径（未生成则为 null） |
| `spec` | 技术方案文件路径（未生成则为 null） |
| `commits` | 关联的 git 提交 ID 列表 |

## 阶段枚举

| 阶段 | 说明 |
|------|------|
| `需求分析` | PM 分析需求中 |
| `PRD确认` | 等待用户确认 PRD |
| `技术设计` | Architect 设计中 |
| `方案确认` | 等待用户确认技术方案 |
| `编码` | Developer 编码中 |
| `审查` | Reviewer 审查中 |
| `测试` | Tester 测试中 |
| `完成` | 任务完成 |

## 任务保留

所有任务保留在 `tasks/` 目录，不提供删除功能，便于问题回归。

## 读写逻辑

### 读取任务列表

```
读取 .cc-agent/index.yaml
返回 tasks 列表
```

### 读取当前任务详情

```
1. 读取 .cc-agent/index.yaml 获取 current
2. 读取 .cc-agent/tasks/{current}.yaml
3. 返回任务详情
```

### 创建新任务

```
1. 生成新 ID（递增）
2. 创建 .cc-agent/tasks/{id}.yaml
3. 更新 .cc-agent/index.yaml：
   - 添加到 tasks 列表
   - 设置 current 为新 ID
```

### 更新任务状态

```
1. 更新 .cc-agent/tasks/{id}.yaml 的 stage
2. 同步更新 .cc-agent/index.yaml 中对应任务的 stage
```

### 切换任务

```
更新 .cc-agent/index.yaml 的 current
```

### 关联 commit

```
提交代码后，将 commit ID 追加到 .cc-agent/tasks/{id}.yaml 的 commits 列表
```

## 产出物目录

```
docs/
├── requirements/           # PRD 存储
│   ├── PRD-001.md
│   └── PRD-002.md
└── specs/                  # 技术方案存储
    ├── SPEC-001.md
    └── SPEC-002.md
```

## 指令

详见 [commands/](../commands/)
