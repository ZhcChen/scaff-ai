import { Card, Form, Input, Button, message } from "antd";

export default function Settings() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success("设置已保存");
  };

  return (
    <div>
      <h2>系统设置</h2>
      <Card title="基础配置">
        <Form form={form} layout="vertical" style={{ maxWidth: 500 }} onFinish={handleSave}>
          <Form.Item name="siteName" label="站点名称" initialValue="Scaff AI">
            <Input />
          </Form.Item>
          <Form.Item name="siteDescription" label="站点描述" initialValue="项目脚手架">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
