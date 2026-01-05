package testutil

import (
	"database/sql"
	"net/http"
	"testing"

	"github.com/go-resty/resty/v2"
	_ "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/require"
)

// 测试环境平台管理根账号约定：
// - 登录名：admin
// - 登录密码：admin123
// 所有从空数据库开始的测试场景，均应通过 init.sql 初始化该账号作为平台根账号。
const (
	TestRootUsername = "admin"
	TestRootPassword = "admin123"
)

// AdminPassword 返回测试用的平台管理员密码
func AdminPassword() string {
	return TestRootPassword
}

// Client 返回配置好 BaseURL 的 resty 客户端
func Client() *resty.Client {
	return resty.New().SetBaseURL(BaseURL())
}

// EnsureAdminToken 确保获取管理员 Token（登录或跳过）
func EnsureAdminToken(t *testing.T) string {
	ResetUserLock(t, TestRootUsername)
	c := Client()

	// 尝试使用预期的测试根账号直接登录
	loginResp := struct {
		Code int `json:"code"`
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
		Message string `json:"message"`
	}{}
	r, err := c.R().
		SetBody(map[string]interface{}{"username": TestRootUsername, "password": TestRootPassword}).
		SetResult(&loginResp).
		Post("/auth/login")
	require.NoError(t, err)
	if r.StatusCode() == http.StatusOK && loginResp.Code == 0 && loginResp.Data.Token != "" {
		return loginResp.Data.Token
	}

	t.Skipf("无法获取 admin token，login code=%d msg=%s", loginResp.Code, loginResp.Message)
	return ""
}

// MustProfile 断言 token 有效并能获取 profile
func MustProfile(t *testing.T, token string) {
	c := Client()
	prof := struct {
		Code int `json:"code"`
	}{}
	r, err := c.R().SetAuthToken(token).SetResult(&prof).Get("/auth/profile")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, prof.Code)
}

// ResetUserLock 将用户的 locked_until 与 login_failed_count 归零，需配置 db_dsn。
func ResetUserLock(t *testing.T, username string) {
	dsn := DBDSN()
	if dsn == "" {
		// 未配置 DB，跳过重置（允许纯 HTTP 用例继续）
		return
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Logf("[WARN] 打开 DB 失败，无法重置用户锁定状态 username=%s err=%v", username, err)
		return
	}
	defer db.Close()
	_, _ = db.Exec("UPDATE auth_user SET login_failed_count=0, locked_until=NULL WHERE username=?", username)
}

// ResetUserPassword 重置用户密码为默认密码（需要 password_hash）
func ResetUserPassword(t *testing.T, username string, passwordHash string) {
	dsn := RequireDB(t)
	db, err := sql.Open("mysql", dsn)
	require.NoError(t, err)
	defer db.Close()
	_, err = db.Exec("UPDATE auth_user SET password_hash=? WHERE username=?", passwordHash, username)
	require.NoError(t, err)
}

// CreateTestUser 创建测试用户（直接操作数据库）
func CreateTestUser(t *testing.T, username, displayName, passwordHash string) int64 {
	dsn := RequireDB(t)
	db, err := sql.Open("mysql", dsn)
	require.NoError(t, err)
	defer db.Close()

	result, err := db.Exec(
		"INSERT INTO auth_user (username, password_hash, display_name, status) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)",
		username, passwordHash, displayName,
	)
	require.NoError(t, err)

	id, _ := result.LastInsertId()
	return id
}

// DeleteTestUser 删除测试用户
func DeleteTestUser(t *testing.T, username string) {
	dsn := DBDSN()
	if dsn == "" {
		return
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return
	}
	defer db.Close()
	_, _ = db.Exec("DELETE FROM auth_user WHERE username=?", username)
}

// TryCleanup 注册清理函数（不影响测试结果）
func TryCleanup(t *testing.T, fn func()) {
	t.Cleanup(func() {
		defer func() {
			if r := recover(); r != nil {
				t.Logf("[WARN] 清理过程发生 panic: %v", r)
			}
		}()
		fn()
	})
}
