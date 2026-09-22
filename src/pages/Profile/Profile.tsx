import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { supabase } from "../../lib/supabase";

const { Title, Text } = Typography;

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string;
}

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [passwordForm] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Get user error:", userError);
        message.error("Unable to load user information.");
        return;
      }

      if (!user) {
        message.error("User not found.");
        return;
      }

      // Get profile information
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, email, role, phone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
      }
      console.log("profileDetails",user.role)
      setProfile({
        id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          profileData?.full_name ||
          "",
        email: user.email || profileData?.email || "",
        phone: profileData?.phone || "",
        role: user?.role || "",
        email_verified: !!user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || "",
      });
    } catch (error) {
      console.error("Load profile error:", error);
      message.error("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePassword = async (
    values: PasswordValues
  ) => {
    try {
      setPasswordLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        message.error("Unable to identify the logged-in user.");
        return;
      }

      /*
       * Supabase does not provide a direct "verify current password"
       * method.
       *
       * We verify it by signing in with the current password.
       */
      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: values.currentPassword,
        });

      if (verifyError) {
        message.error("Current password is incorrect.");
        return;
      }

      // Update password
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: values.newPassword,
        });

      if (updateError) {
        console.error(
          "Password update error:",
          updateError
        );

        message.error(
          updateError.message ||
            "Unable to change password."
        );

        return;
      }

      message.success(
        "Password changed successfully."
      );

      passwordForm.resetFields();

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      message.error(
        "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Card loading style={{ margin: 24 }} />
    );
  }

  if (!profile) {
    return (
      <Card style={{ margin: 24 }}>
        <Text>
          Unable to load profile information.
        </Text>
      </Card>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          My Profile
        </Title>

        <Text type="secondary">
          Manage your account information and password.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              height: "100%",
              textAlign: "center",
            }}
          >
            <Avatar
              size={100}
              style={{
                backgroundColor: "#1677ff",
                fontSize: 32,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {getInitials(profile.full_name)}
            </Avatar>

            <Title
              level={3}
              style={{ marginBottom: 4 }}
            >
              {profile.full_name || "User"}
            </Title>

            <Text type="secondary">
              {profile.email}
            </Text>

            <div style={{ marginTop: 16 }}>
              {profile.role && (
                <Tag color="blue">
                  {profile.role
                    .charAt(0)
                    .toUpperCase() +
                    profile.role.slice(1)}
                </Tag>
              )}

              {profile.email_verified && (
                <Tag
                  color="success"
                  icon={<CheckCircleOutlined />}
                >
                  Verified
                </Tag>
              )}
            </div>

            <Divider />

            <Space
              direction="vertical"
              size={12}
              style={{ width: "100%" }}
            >
              <div>
                <Text type="secondary">
                  Account ID
                </Text>

                <br />

                <Text
                  copyable
                  style={{
                    fontSize: 12,
                  }}
                >
                  {profile.id}
                </Text>
              </div>

              <div>
                <Text type="secondary">
                  Account Created
                </Text>

                <br />

                <Text>
                  {formatDate(profile.created_at)}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Personal Information</span>
              </Space>
            }
           
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Space align="start">
                  <MailOutlined
                    style={{
                      color: "#1677ff",
                      fontSize: 18,
                      marginTop: 4,
                    }}
                  />

                  <div>
                    <Text type="secondary">
                      Email
                    </Text>

                    <br />

                    <Text strong>
                      {profile.email}
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space align="start">
                  <PhoneOutlined
                    style={{
                      color: "#1677ff",
                      fontSize: 18,
                      marginTop: 4,
                    }}
                  />

                  <div>
                    <Text type="secondary">
                      Phone
                    </Text>

                    <br />

                    <Text strong>
                      {profile.phone || "Not provided"}
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space align="start">
                  <SafetyOutlined
                    style={{
                      color: "#1677ff",
                      fontSize: 18,
                      marginTop: 4,
                    }}
                  />

                  <div>
                    <Text type="secondary">
                      Role
                    </Text>

                    <br />

                    <Text strong>
                      {profile.role
                        ? profile.role
                            .charAt(0)
                            .toUpperCase() +
                          profile.role.slice(1)
                        : "Staff"}
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space align="start">
                  <CheckCircleOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: 18,
                      marginTop: 4,
                    }}
                  />

                  <div>
                    <Text type="secondary">
                      Email Status
                    </Text>

                    <br />

                    <Text strong>
                      {profile.email_verified
                        ? "Verified"
                        : "Not Verified"}
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col xs={24}>
                <Divider />

                <Text type="secondary">
                  Last Sign In
                </Text>

                <br />

                <Text strong>
                  {formatDate(
                    profile.last_sign_in_at
                  )}
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Change Password */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Change Password</span>
              </Space>
            }
          >
            <Row>
              <Col
                xs={24}
                md={16}
                lg={12}
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Current Password"
                    name="currentPassword"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter your current password",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter current password"
                    />
                  </Form.Item>

                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter your new password",
                      },
                      {
                        min: 8,
                        message:
                          "Password must be at least 8 characters",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter new password"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Confirm New Password"
                    name="confirmPassword"
                    dependencies={[
                      "newPassword",
                    ]}
                    rules={[
                      {
                        required: true,
                        message:
                          "Please confirm your new password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue(
                              "newPassword"
                            ) === value
                          ) {
                            return Promise.resolve();
                          }

                          return Promise.reject(
                            new Error(
                              "Passwords do not match"
                            )
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirm new password"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                    icon={<LockOutlined />}
                  >
                    Change Password
                  </Button>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;