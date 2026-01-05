import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { userApi } from "@/services";
import type { User, PaginatedData } from "@/types";

export default function UserList() {
  const [data, setData] = useState<PaginatedData<User>>({ list: [], total: 0, page: 1, size: 20 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData(1);
  }, []);

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await userApi.list(page, 20);
      if (res.code === 0 && res.data) {
        setData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { username: string; password: string; displayName?: string }) => {
    const res = await userApi.create(values);
    if (res.code === 0) {
      message.success("创建成功");
      setModalOpen(false);
      form.resetFields();
      loadData(1);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await userApi.delete(id);
    if (res.code === 0) {
      message.success("删除成功");
      loadData(data.page);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "用户名", dataIndex: "username" },
    { title: "显示名", dataIndex: "displayName" },
    { title: "邮箱", dataIndex: "email" },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: number) => (
        <Tag color={status === 1 ? "green" : "red"}>
          {status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    { title: "创建时间", dataIndex: "createdAt" },
    {
      title: "操作",
      render: (_: unknown, record: User) => (
        <Space>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger disabled={record.id === 1}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <h2>用户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建用户
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.list}
        loading={loading}
        pagination={{
          current: data.page,
          pageSize: data.size,
          total: data.total,
          onChange: loadData,
        }}
      />

      <Modal
        title="新建用户"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="displayName" label="显示名">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
