import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  Layout,
  Spin,
  Flex,
  Avatar,
  Badge,
  Button,
  Typography,
  Grid,
} from "antd";

import {
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";

import Navbar from "../components/Navbar/navbar";
import { Outlet } from "react-router-dom";

const { Header, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface DashboardLayoutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DashboardLayout = ({
  isDarkMode,
  onToggleTheme,
}: DashboardLayoutProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [collapsed, setCollapsed] =
    useState(false);

  const sidebarWidth = isMobile
    ? 0
    : collapsed
      ? 80
      : 240;

  const background = isDarkMode
    ? "#0f1115"
    : "#f5f7fb";

  const headerBackground = isDarkMode
    ? "#15171c"
    : "#ffffff";

  const pendingCount = 3;

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background,
      }}
    >
      <Navbar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      <Layout
        style={{
          minHeight: "100vh",
          marginLeft: sidebarWidth,
          background,
          transition:
            "margin-left 0.2s ease",
        }}
      >
        <Header
          style={{
            height: isMobile ? 64 : 68,
            padding: isMobile
              ? "0 16px 0 64px"
              : "0 28px",
            background: headerBackground,
            borderBottom: isDarkMode
              ? "1px solid #252930"
              : "1px solid #e8ebf0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Flex align="center" gap={12}>
            <Avatar
              shape="square"
              size={38}
              style={{
                background:
                  "linear-gradient(135deg,#1677ff,#4096ff)",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              TC
            </Avatar>

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 16,
                  lineHeight: "20px",
                }}
              >
                TC Dental
              </Text>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 11,
                  lineHeight: "15px",
                }}
              >
                Patient Management
              </Text>
            </div>
          </Flex>

          <Flex align="center" gap={18}>
            <Badge
              count={pendingCount}
              size="small"
              offset={[-2, 2]}
            >
              <Button
                type="text"
                shape="circle"
                icon={
                  <BellOutlined
                    style={{
                      fontSize: 19,
                    }}
                  />
                }
                style={{
                  color: isDarkMode
                    ? "#f5f5f5"
                    : "#344054",
                }}
              />
            </Badge>

            <Flex
              align="center"
              gap={9}
            >
              {!isMobile && (
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: 13,
                    }}
                  >
                    Admin
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      fontSize: 10,
                    }}
                  >
                    Administrator
                  </Text>
                </div>
              )}

              <Avatar
                size={38}
                style={{
                  background: "#1677ff",
                }}
                icon={<UserOutlined />}
              />
            </Flex>
          </Flex>
        </Header>

        <Content
          style={{
            minHeight:
              "calc(100vh - 68px)",
            background,
            padding: isMobile
              ? "20px 14px 30px"
              : "28px 32px 40px",
          }}
        >
          <Suspense
            fallback={
              <Flex
                align="center"
                justify="center"
                style={{
                  minHeight: "70vh",
                }}
              >
                <Spin size="large" />
              </Flex>
            }
          >
            {/* Child routes render here */}
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;