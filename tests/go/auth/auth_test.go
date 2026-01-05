package auth_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	"scaff-ai/api-tests/internal/testutil"
)

// TestAuthFlow_LoginAndProfile 测试基本的登录和获取用户信息流程
func TestAuthFlow_LoginAndProfile(t *testing.T) {
	c := testutil.Client()

	token := testutil.EnsureAdminToken(t)

	// 获取用户信息
	prof := struct {
		Code int `json:"code"`
		Data struct {
			User struct {
				ID          int64  `json:"id"`
				Username    string `json:"username"`
				DisplayName string `json:"displayName"`
			} `json:"user"`
			Roles       []string `json:"roles"`
			Permissions []string `json:"permissions"`
		} `json:"data"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetResult(&prof).
		Get("/auth/profile")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, prof.Code)
	require.Equal(t, testutil.TestRootUsername, prof.Data.User.Username)
}

// TestAuthFlow_LoginFailure 测试登录失败场景
func TestAuthFlow_LoginFailure(t *testing.T) {
	c := testutil.Client()

	// 错误密码登录
	loginResp := struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	}{}
	r, err := c.R().
		SetBody(map[string]interface{}{
			"username": testutil.TestRootUsername,
			"password": "wrong_password",
		}).
		SetResult(&loginResp).
		Post("/auth/login")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.NotEqual(t, 0, loginResp.Code, "错误密码应返回非零错误码")
}

// TestAuthFlow_Logout 测试登出流程
func TestAuthFlow_Logout(t *testing.T) {
	c := testutil.Client()

	token := testutil.EnsureAdminToken(t)

	// 验证 token 有效
	testutil.MustProfile(t, token)

	// 登出
	logoutResp := struct {
		Code int `json:"code"`
	}{}
	r, err := c.R().
		SetAuthToken(token).
		SetResult(&logoutResp).
		Post("/auth/logout")
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, r.StatusCode())
	require.Equal(t, 0, logoutResp.Code)

	// 登出后 token 应失效
	r, err = c.R().SetAuthToken(token).Get("/auth/profile")
	require.NoError(t, err)
	// 可能返回 401 或 code != 0
	if r.StatusCode() == http.StatusOK {
		var resp struct {
			Code int `json:"code"`
		}
		require.NoError(t, r.Unmarshal(&resp))
		require.NotEqual(t, 0, resp.Code, "登出后 token 应失效")
	}
}

// TestAuthFlow_UnauthorizedAccess 测试未授权访问
func TestAuthFlow_UnauthorizedAccess(t *testing.T) {
	c := testutil.Client()

	// 无 token 访问需要认证的接口
	r, err := c.R().Get("/auth/profile")
	require.NoError(t, err)
	// 应返回 401 或错误码
	if r.StatusCode() == http.StatusOK {
		var resp struct {
			Code int `json:"code"`
		}
		require.NoError(t, r.Unmarshal(&resp))
		require.NotEqual(t, 0, resp.Code, "无 token 应返回错误")
	} else {
		require.Equal(t, http.StatusUnauthorized, r.StatusCode())
	}
}

// TestAuthFlow_InvalidToken 测试无效 token
func TestAuthFlow_InvalidToken(t *testing.T) {
	c := testutil.Client()

	// 使用无效 token
	r, err := c.R().
		SetAuthToken("invalid_token_12345").
		Get("/auth/profile")
	require.NoError(t, err)
	// 应返回 401 或错误码
	if r.StatusCode() == http.StatusOK {
		var resp struct {
			Code int `json:"code"`
		}
		require.NoError(t, r.Unmarshal(&resp))
		require.NotEqual(t, 0, resp.Code, "无效 token 应返回错误")
	} else {
		require.Equal(t, http.StatusUnauthorized, r.StatusCode())
	}
}
