import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (values: LoginValues) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setError(
          error.message || 'Invalid email or password.'
        );
        return;
      }

      if (!data.session) {
        setError('Unable to create a secure session.');
        return;
      }

      message.success('Login successful');

      navigate('/dashboard', {
        replace: true,
      });
    } catch (err) {
      console.error('Login error:', err);

      setError(
        'Unable to login right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          background:
            'linear-gradient(135deg, #383636 10%, #4c8ce6 100%)',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 16,
            boxShadow:
              '0 12px 40px rgba(0, 0, 0, 0.10)',
          }}
          styles={{
            body: {
              padding: 32,
            },
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 30,
            }}
          >
            <img
              src='./icon.png'
              alt="Logo"
              style={{
                width: 350,
                height: 100,
                objectFit: 'contain',
              }}
            />

            <Title
              level={2}
              style={{
                marginBottom: 4,
              }}
            >
              TC Dental
            </Title>

            <Text type="secondary">
              Dental Clinic Dashboard
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{
                marginBottom: 20,
              }}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleLogin}
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please enter your email',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email',
                },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please enter your password',
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            <Text type="secondary">
              Authorized staff only
            </Text>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Login;

