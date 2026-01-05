# 测试策略与模板

> 测试分层策略和各层测试代码模板。

---

## 一、测试分层策略

### 1.1 测试金字塔

```
        /\
       /  \        E2E 测试（少量）
      /----\       - 用户完整流程
     /      \      - 跨系统集成
    /--------\     集成测试（适量）
   /          \    - API 端点测试
  /            \   - 数据库交互
 /--------------\  单元测试（大量）
/                \ - 纯函数
                   - Service 方法
                   - 工具函数
```

### 1.2 各层职责

| 层级 | 类型 | 覆盖范围 | 工具 | 数量占比 |
|------|------|----------|------|----------|
| L1 | 单元测试 | 纯函数、工具类、Service 方法 | Bun test / node:test | 70% |
| L2 | 集成测试 | API 端点、数据库交互、外部服务 | Go + resty + testify | 20% |
| L3 | E2E 测试 | 完整用户流程 | Playwright | 10% |

### 1.3 测试原则

1. **快速反馈**：单元测试应在秒级完成
2. **隔离性**：测试之间不应互相影响
3. **可重复**：多次运行结果一致
4. **自描述**：测试名称应清晰描述预期行为
5. **边界覆盖**：覆盖正常流程和异常边界

---

## 二、Go 集成测试（推荐）

本项目采用 Go 语言编写 API 集成测试，具有以下优势：
- 编译型语言，类型安全
- 并发性能优异
- 与 API 无关（黑盒测试）
- 可独立于业务代码运行

### 2.1 目录结构

```
tests/go/
├── go.mod                    # Go 模块定义
├── testsuite.yaml            # 测试套件配置
├── internal/
│   └── testutil/             # 测试工具包
│       ├── config.go         # 配置加载（API 地址、DB DSN）
│       └── testutil.go       # 通用工具函数
├── auth/                     # 认证测试
│   └── auth_test.go
├── rbac/                     # 权限测试
│   └── rbac_test.go
└── ...                       # 其他模块测试
```

### 2.2 运行测试

```bash
# 进入测试目录
cd tests/go

# 安装依赖
go mod tidy

# 运行全部测试（需要先启动 API 服务）
go test ./... -v

# 运行指定模块
go test ./auth -v

# 运行指定用例
go test ./auth -run TestAuthFlow_LoginAndProfile -v

# 带数据库直连（用于数据重置）
go test ./auth -v -args \
  -api_base=http://127.0.0.1:7100 \
  -db_dsn='root:password@tcp(127.0.0.1:3306)/scaff_ai'
```

### 2.3 测试用例模板

```go
package auth_test

import (
    "net/http"
    "testing"

    "github.com/stretchr/testify/require"
    "scaff-ai/api-tests/internal/testutil"
)

func TestAuthFlow_LoginAndProfile(t *testing.T) {
    c := testutil.Client()

    // 获取管理员 Token
    token := testutil.EnsureAdminToken(t)

    // 获取用户信息
    prof := struct {
        Code int `json:"code"`
        Data struct {
            User struct {
                ID       int64  `json:"id"`
                Username string `json:"username"`
            } `json:"user"`
        } `json:"data"`
    }{}

    r, err := c.R().
        SetAuthToken(token).
        SetResult(&prof).
        Get("/auth/profile")

    require.NoError(t, err)
    require.Equal(t, http.StatusOK, r.StatusCode())
    require.Equal(t, 0, prof.Code)
    require.Equal(t, "admin", prof.Data.User.Username)
}
```

### 2.4 testutil 工具包

#### config.go - 配置管理

```go
// 通过命令行参数传入配置
// go test ./auth -args -api_base=http://127.0.0.1:7100 -db_dsn='...'

var (
    flagAPIBase = flag.String("api_base", "", "API Base URL")
    flagDBDSN   = flag.String("db_dsn", "", "MySQL DSN")
)

func BaseURL() string {
    if v := *flagAPIBase; v != "" {
        return v + "/api"
    }
    return "http://127.0.0.1:7100/api"
}

func RequireDB(t *testing.T) string {
    dsn := *flagDBDSN
    if dsn == "" {
        t.Skip("未配置 db_dsn，跳过需要直连 DB 的用例")
    }
    return dsn
}
```

#### testutil.go - 通用工具

```go
const (
    TestRootUsername = "admin"
    TestRootPassword = "admin123"
)

// Client 返回配置好 BaseURL 的 resty 客户端
func Client() *resty.Client {
    return resty.New().SetBaseURL(BaseURL())
}

// EnsureAdminToken 确保获取管理员 Token
func EnsureAdminToken(t *testing.T) string {
    ResetUserLock(t, TestRootUsername)
    c := Client()

    loginResp := struct {
        Code int    `json:"code"`
        Data struct { Token string `json:"token"` } `json:"data"`
    }{}

    r, err := c.R().
        SetBody(map[string]interface{}{
            "username": TestRootUsername,
            "password": TestRootPassword,
        }).
        SetResult(&loginResp).
        Post("/auth/login")

    require.NoError(t, err)
    if r.StatusCode() == http.StatusOK && loginResp.Code == 0 {
        return loginResp.Data.Token
    }

    t.Skipf("无法获取 admin token")
    return ""
}

// ResetUserLock 重置用户锁定状态
func ResetUserLock(t *testing.T, username string) {
    dsn := DBDSN()
    if dsn == "" {
        return
    }
    db, _ := sql.Open("mysql", dsn)
    defer db.Close()
    db.Exec("UPDATE auth_user SET login_failed_count=0 WHERE username=?", username)
}
```

### 2.5 testsuite.yaml 配置

```yaml
suites:
  # 集成测试
  - id: integration
    name: 集成测试（API 级）
    kind: integration
    cases:
      - id: integ.auth.login
        name: 认证：登录与获取用户信息
        command: ["go", "test", "./auth", "-run", "TestAuthFlow_LoginAndProfile", "-v"]

      - id: integ.auth.all
        name: 认证：全部测试
        command: ["go", "test", "./auth", "-v"]

      - id: integ.all
        name: 集成测试：全部
        command: ["go", "test", "./...", "-v"]

  # 链路测试
  - id: flow
    name: 链路测试（E2E）
    kind: flow
    cases:
      - id: flow.auth.basic
        name: 认证链路：登录→获取信息→登出
        command: ["go", "test", "./auth", "-run", "TestAuthFlow_", "-v"]
```

---

## 三、单元测试模板（API 模块内部）

### 3.1 使用 Bun 内置测试框架

```typescript
// api/src/utils/crypto.test.ts
import { describe, test, expect } from "bun:test";
import { hashPassword, verifyPassword } from "./crypto";

describe("crypto utils", () => {
  test("hashPassword 生成有效的 bcrypt 哈希", async () => {
    const hash = await hashPassword("password123");
    expect(hash).toMatch(/^\$2[ab]\$\d+\$/);
  });

  test("verifyPassword 验证正确密码", async () => {
    const hash = await hashPassword("password123");
    const result = await verifyPassword("password123", hash);
    expect(result).toBe(true);
  });

  test("verifyPassword 拒绝错误密码", async () => {
    const hash = await hashPassword("password123");
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });
});
```

### 3.2 运行单元测试

```bash
cd api
bun test
```

---

## 四、E2E 测试模板（Playwright）

### 4.1 目录结构

```
tests/e2e/
├── package.json
├── playwright.config.ts
├── tests/
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
└── pages/
    └── LoginPage.ts
```

### 4.2 Playwright 配置

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:7101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 4.3 E2E 测试用例

```typescript
// tests/e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('用户认证流程', () => {
  test('成功登录并跳转到仪表盘', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('控制台');
  });

  test('登录失败显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.ant-message-error')).toBeVisible();
  });
});
```

---

## 五、测试覆盖率

### 5.1 Bun 测试覆盖率

```bash
cd api
bun test --coverage
```

### 5.2 Go 测试覆盖率

```bash
cd tests/go
go test ./... -cover -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

---

## 六、CI 集成

### 6.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: cd api && bun install && bun test

  integration-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: scaff_ai
        ports:
          - 3306:3306
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.23'

      # 启动 API 服务
      - uses: oven-sh/setup-bun@v2
      - run: |
          cd api
          bun install
          bun run dev &
          sleep 5

      # 运行集成测试
      - run: |
          cd tests/go
          go mod tidy
          go test ./... -v -args \
            -api_base=http://127.0.0.1:7100 \
            -db_dsn='root:root@tcp(127.0.0.1:3306)/scaff_ai'
```

---

## 七、最佳实践

1. **测试命名**：使用 `Test<模块>_<场景>_<预期结果>` 格式
2. **数据隔离**：每个测试用例应独立，不依赖其他用例的数据
3. **清理机制**：使用 `t.Cleanup()` 确保测试数据被清理
4. **跳过机制**：对于依赖外部环境的测试，合理使用 `t.Skip()`
5. **并行执行**：Go 测试默认并行，注意数据竞争
6. **Mock 策略**：单元测试 Mock，集成测试用真实服务
