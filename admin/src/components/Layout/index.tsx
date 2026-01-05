import { Layout, Menu, Dropdown, Avatar, theme } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { authApi } from "@/services";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "控制台" },
  { key: "/users", icon: <UserOutlined />, label: "用户管理" },
  { key: "/rbac", icon: <SafetyOutlined />, label: "权限管理" },
  { key: "/settings", icon: <SettingOutlined />, label: "系统设置" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    navigate("/login");
  };

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "个人中心", onClick: () => navigate("/profile") },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "SA" : "Scaff AI"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: "pointer" }} />
          ) : (
            <MenuFoldOutlined onClick={() => setCollapsed(true)} style={{ fontSize: 18, cursor: "pointer" }} />
          )}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.displayName || user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
