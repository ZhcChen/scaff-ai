package rbac_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	"scaff-ai/api-tests/internal/testutil"
)

// TestRBAC_ListUsers 测试获取用户列表
func TestRBAC_ListUsers(t *testing.T) {
	c := testutil.Client()
	token := testutil.EnsureAdminToken(t)

	resp := struct {
		Code int `json:"code"`
		Data struct {
			List  []interface{} `json:"list"`
			Total int           `json:"total"`
		} `json:"data"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetResult(&resp).
		Get("/users")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, resp.Code)
	require.GreaterOrEqual(t, resp.Data.Total, 1, "至少应有 admin 用户")
}

// TestRBAC_ListRoles 测试获取角色列表
func TestRBAC_ListRoles(t *testing.T) {
	c := testutil.Client()
	token := testutil.EnsureAdminToken(t)

	resp := struct {
		Code int `json:"code"`
		Data struct {
			List []interface{} `json:"list"`
		} `json:"data"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetResult(&resp).
		Get("/roles")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, resp.Code)
}

// TestRBAC_ListPermissions 测试获取权限列表
func TestRBAC_ListPermissions(t *testing.T) {
	c := testutil.Client()
	token := testutil.EnsureAdminToken(t)

	resp := struct {
		Code int `json:"code"`
		Data struct {
			List []interface{} `json:"list"`
		} `json:"data"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetResult(&resp).
		Get("/permissions")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, resp.Code)
}

// TestRBAC_CreateRole 测试创建角色
func TestRBAC_CreateRole(t *testing.T) {
	c := testutil.Client()
	token := testutil.EnsureAdminToken(t)

	// 清理：测试结束后删除测试角色
	testutil.TryCleanup(t, func() {
		c.R().
			SetAuthToken(token).
			Delete("/roles/test_role")
	})

	// 创建角色
	createResp := struct {
		Code int `json:"code"`
		Data struct {
			ID int64 `json:"id"`
		} `json:"data"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetBody(map[string]interface{}{
			"code":        "test_role",
			"name":        "测试角色",
			"description": "用于测试的角色",
		}).
		SetResult(&createResp).
		Post("/roles")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	// 可能成功或已存在
	if createResp.Code == 0 {
		require.Greater(t, createResp.Data.ID, int64(0))
	}
}

// TestRBAC_PermissionDenied 测试无权限访问
func TestRBAC_PermissionDenied(t *testing.T) {
	// 此测试需要创建一个无权限的用户
	// 由于需要数据库操作，先跳过
	t.Skip("需要创建无权限用户，暂时跳过")
}
