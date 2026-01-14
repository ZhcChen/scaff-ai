# Git 工作流

## 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>
```

## Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具 |

## 示例

```bash
feat(user): 添加用户头像上传功能
fix(auth): 修复 token 过期判断逻辑
docs(api): 更新用户接口文档
refactor(service): 拆分订单服务
```

## 提交策略

- 完成一个功能点或修复一个 bug 后提交
- 提交信息要清晰描述改动内容
- 推送前确保代码可运行、测试通过
