import { useEffect, useState } from "react";
import { Tabs, Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { roleApi, permissionApi } from "@/services";
import type { Role, Permission } from "@/types";

export default function RbacManage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.list(),
        permissionApi.list(),
      ]);
      if (rolesRes.code === 0) setRoles(rolesRes.data || []);
      if (permsRes.code === 0) setPermissions(permsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (values: { code: string; name: string; description?: string }) => {
    const res = await roleApi.create(values);
    if (res.code === 0) {
      message.success("创建成功");
      setModalOpen(false);
      form.resetFields();
      loadData();
    }
  };

  const handleDeleteRole = async (id: number) => {
    const res = await roleApi.delete(id);
    if (res.code === 0) {
      message.success("删除成功");
      loadData();
    }
  };

  const roleColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    {
      title: "操作",
      render: (_: unknown, record: Role) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteRole(record.id)}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  const permissionColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "资源", dataIndex: "resource" },
    { title: "操作", dataIndex: "action" },
  ];

  return (
    <div>
      <h2>权限管理</h2>
      <Tabs
        items={[
          {
            key: "roles",
            label: "角色管理",
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                    新建角色
                  </Button>
                </div>
                <Table rowKey="id" columns={roleColumns} dataSource={roles} loading={loading} pagination={false} />
              </>
            ),
          },
          {
            key: "permissions",
            label: "权限列表",
            children: (
              <Table rowKey="id" columns={permissionColumns} dataSource={permissions} loading={loading} pagination={false} />
            ),
          },
        ]}
      />

      <Modal title="新建角色" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input placeholder="如 editor" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如 编辑员" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
