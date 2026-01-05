package testutil

import (
	"flag"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

// 说明：Go 集成/链路测试的运行时配置统一通过 go test 的自定义 flags 传入。
//
// 使用方式（CLI 示例）：
// go test ./auth -run TestXXX -args -api_base=http://127.0.0.1:7100/api -db_dsn='user:pass@tcp(127.0.0.1:3306)/scaff_ai'
var (
	flagAPIBase  = flag.String("api_base", "", "API Base URL（例如 http://127.0.0.1:7100 或 http://127.0.0.1:7100/api）")
	flagDBDSN    = flag.String("db_dsn", "", "MySQL DSN（用于直连 DB 的用例断言/重置）")
	flagRedisURL = flag.String("redis_url", "", "Redis URL（用于标记 API 是否启用 Redis 会话相关用例）")
)

// BaseURL 返回 API 基址。
// 注意：默认值与项目端口约定保持一致，便于"空配置"时也能直接跑只依赖 HTTP 的用例。
func BaseURL() string {
	if v := strings.TrimSpace(*flagAPIBase); v != "" {
		v = strings.TrimRight(v, "/")
		if !strings.Contains(v, "://") {
			v = "http://" + v
		}
		// 如果包含 /api，认为是完整 base URL
		if strings.Contains(v, "/api") {
			return v
		}
		// 仅提供 origin，自动拼接 /api
		return v + "/api"
	}
	return "http://127.0.0.1:7100/api"
}

// APIOrigin 返回 API 服务的 origin（scheme://host:port）。
func APIOrigin() string {
	base := strings.TrimRight(BaseURL(), "/")
	idx := strings.Index(base, "/api")
	if idx == -1 {
		return base
	}
	return strings.TrimRight(base[:idx], "/")
}

// DBDSN 返回当前运行配置的 MySQL DSN（可能为空）。
func DBDSN() string {
	return strings.TrimSpace(*flagDBDSN)
}

// RequireDB 用于需要直连 DB 的用例：未配置 DSN 时直接跳过。
func RequireDB(t *testing.T) string {
	t.Helper()
	dsn := DBDSN()
	if dsn == "" {
		t.Skip("未配置 db_dsn（CLI：-args -db_dsn=...），跳过需要直连 DB 的用例")
	}
	return dsn
}

// RedisURL 返回 Redis URL（可能为空）。
func RedisURL() string {
	return strings.TrimSpace(*flagRedisURL)
}

func isLocalOrigin(origin string) bool {
	raw := strings.TrimSpace(origin)
	if raw == "" {
		return true
	}
	if !strings.Contains(raw, "://") {
		raw = "http://" + raw
	}
	u, err := url.Parse(raw)
	if err != nil {
		return false
	}
	host := strings.TrimSpace(u.Hostname())
	switch host {
	case "127.0.0.1", "localhost", "::1", "0.0.0.0":
		return true
	default:
		return false
	}
}

var (
	apiDotEnvOnce sync.Once
	apiDotEnvMap  map[string]string
)

// loadApiDotEnv 读取项目 api/.env（若存在）。
func loadApiDotEnv() map[string]string {
	apiDotEnvOnce.Do(func() {
		root, err := findRepoRoot()
		if err != nil {
			return
		}
		envPath := filepath.Join(root, "api", ".env")
		if _, err := os.Stat(envPath); err != nil {
			return
		}
		m, err := parseDotEnv(envPath)
		if err != nil {
			return
		}
		apiDotEnvMap = m
	})
	return apiDotEnvMap
}

// findRepoRoot 从当前工作目录向上查找项目根目录（约定根目录下存在 api/ 目录）。
func findRepoRoot() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	dir, err := filepath.Abs(wd)
	if err != nil {
		dir = wd
	}
	for i := 0; i < 10; i++ {
		apiDir := filepath.Join(dir, "api")
		if st, statErr := os.Stat(apiDir); statErr == nil && st.IsDir() {
			return dir, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", os.ErrNotExist
}

// parseDotEnv 解析 .env 文件（最小实现）。
func parseDotEnv(path string) (map[string]string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	out := make(map[string]string)
	lines := strings.Split(string(b), "\n")
	for _, raw := range lines {
		line := strings.TrimSpace(strings.TrimRight(raw, "\r"))
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if strings.HasPrefix(line, "export ") {
			line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
		}
		key, val, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k := strings.TrimSpace(key)
		v := strings.TrimSpace(val)
		if len(v) >= 2 {
			if (v[0] == '"' && v[len(v)-1] == '"') || (v[0] == '\'' && v[len(v)-1] == '\'') {
				v = v[1 : len(v)-1]
			}
		}
		if k != "" {
			out[k] = v
		}
	}
	return out, nil
}
