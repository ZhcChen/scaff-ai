# 指令

## 指令列表

| 指令 | 作用 |
|------|------|
| `/cc-status` | 查看当前任务状态 |
| `/cc-tasks` | 列出所有任务 |
| `/cc-switch <id>` | 切换任务 |
| `/cc-confirm` | 确认当前阶段 |
| `/cc-back` | 返回上一阶段 |

---

## /cc-status

查看当前任务状态。

### 执行逻辑

```
1. 读取 .cc-agent/index.yaml 获取 current
2. 读取 .cc-agent/tasks/{current}.yaml
3. 输出任务详情
```

### 输出格式

```
📋 当前任务

任务ID: 001
名称: 用户登录功能
阶段: 技术设计
PRD: docs/requirements/PRD-001.md
技术方案: -

下一步: 等待 Architect 输出技术方案
```

---

## /cc-tasks

列出所有任务。

### 执行逻辑

```
1. 读取 .cc-agent/index.yaml
2. 输出 tasks 列表，标记 current
```

### 输出格式

```
📋 任务列表

| ID | 名称 | 阶段 |
|----|------|------|
| → 001 | 用户登录功能 | 技术设计 |
| 002 | 权限管理 | 需求分析 |

当前任务: 001
```

---

## /cc-switch <id>

切换到指定任务。

### 参数

- `<id>`: 任务 ID

### 执行逻辑

```
1. 读取 .cc-agent/index.yaml
2. 检查任务 ID 是否存在于 tasks 列表
3. 更新 current 为指定 ID
4. 写回 .cc-agent/index.yaml
5. 读取 .cc-agent/tasks/{id}.yaml 加载上下文
6. 输出切换结果
```

### 输出格式

```
✅ 已切换到任务 002

任务ID: 002
名称: 权限管理
阶段: 需求分析

上下文已加载，可以继续工作。
```

### 错误处理

```
❌ 任务 003 不存在

可用任务: 001, 002
```

---

## /cc-confirm

确认当前阶段，进入下一阶段。

### 适用阶段

- `PRD确认` → 进入 `技术设计`
- `方案确认` → 进入 `编码`

### 执行逻辑

```
1. 读取 .cc-agent/index.yaml 获取 current
2. 读取 .cc-agent/tasks/{current}.yaml
3. 检查是否在确认节点（PRD确认/方案确认）
4. 更新 stage 到下一阶段
5. 写回 tasks/{current}.yaml
6. 同步更新 index.yaml 中的 stage
7. 调用下一阶段的子 Agent
```

### 输出格式

```
✅ PRD 已确认

进入阶段: 技术设计
调用: Architect

---
(Architect 输出技术方案)
---
```

### 错误处理

```
❌ 当前阶段不是确认节点

当前阶段: 编码
确认节点: PRD确认, 方案确认

如需跳过当前阶段，请说明原因。
```

---

## /cc-back

返回上一阶段重新执行。

### 执行逻辑

```
1. 读取 .cc-agent/index.yaml 获取 current
2. 读取 .cc-agent/tasks/{current}.yaml
3. 计算上一阶段
4. 更新 stage
5. 写回 tasks/{current}.yaml
6. 同步更新 index.yaml 中的 stage
7. 提示用户提供修改意见
```

### 阶段回退映射

| 当前阶段 | 回退到 |
|----------|--------|
| PRD确认 | 需求分析 |
| 技术设计 | PRD确认 |
| 方案确认 | 技术设计 |
| 编码 | 方案确认 |
| 审查 | 编码 |
| 测试 | 编码 |

### 输出格式

```
↩️ 已回退

从: 技术设计
到: PRD确认

请提供修改意见，或直接说"重新生成"。
```

### 错误处理

```
❌ 无法回退

当前阶段: 需求分析（已是第一阶段）
```
