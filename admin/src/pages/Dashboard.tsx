import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, TeamOutlined, ApiOutlined } from "@ant-design/icons";
import { statsApi } from "@/services";
import type { DashboardStats } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getDashboard();
      if (res.code === 0) {
        setStats(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={stats?.userCount || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="角色总数"
              value={stats?.roleCount || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="今日请求"
              value={stats?.todayRequests || 0}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
