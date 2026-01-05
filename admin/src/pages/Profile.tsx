import { Card, Descriptions, Button, Modal, Form, Input, message } from "antd";
import { useState } from "react";
import { useAuthStore } from "@/stores";
import { authApi } from "@/services";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
    const res = await authApi.changePassword(values.oldPassword, values.newPassword);
    if (res.code === 0) {
      message.success("密码修改成功，请重新登录");
      setModalOpen(false);
      form.resetFields();
    }
  };

  return (
    <div>
      <h2>个人中心</h2>
      <Card>
        <Descriptions column={1}>
          <Descriptions.Item label="用户ID">{user?.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="显示名">{user?.displayName}</Descriptions.Item>
          <Descriptions.Item label="角色">{roles.join(", ") || "无"}</Descriptions.Item>
        </Descriptions>
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
          修改密码
        </Button>
      </Card>

      <Modal title="修改密码" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
