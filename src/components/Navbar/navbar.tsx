import { useEffect, useState } from "react";

import {
  Avatar,
  Button,
  Drawer,
  Flex,
  Grid,
  Layout,
  Menu,
  Switch,
  Typography,
} from "antd";

import type { MenuProps } from "antd";

import {
  AppstoreOutlined,
  CalendarOutlined,
  CommentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet } from 'react-router-dom';
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

const { Sider } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface NavbarProps {
  collapsed?: boolean;

  onCollapsedChange?: (
    collapsed: boolean
  ) => void;

  isDarkMode: boolean;

  onToggleTheme: () => void;
}

const Navbar = ({
  collapsed = false,
  onCollapsedChange,
  isDarkMode,
  onToggleTheme,
}: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  

  // -------------------------------
  // LOAD CURRENT USER
  // -------------------------------
useEffect(() => {
  const loadUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Get user error:", error);
        return;
      }

      if (!user) {
        return;
      }

      console.log("Auth user:", user);

      setUserName(user.user_metadata?.full_name || "");

      setUserEmail(user.email || "");

    } catch (error) {
      console.error("Load user error:", error);
    }
  };

  loadUser();
}, []);
console.log("UserName",userName)
  // -------------------------------
  // LOGOUT
  // -------------------------------
  const handleLogout = async () => {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );
        return;
      }

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // -------------------------------
  // CLOSE MOBILE SIDEBAR
  // -------------------------------
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  // -------------------------------
  // MENU
  // -------------------------------
  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
    },

    {
      key: "/patients",
      icon: <TeamOutlined />,
      label: "Patients",
    },

    {
      type: "divider",
    },

    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
  ];

  // -------------------------------
  // SELECTED MENU
  // -------------------------------
  const getSelectedKey = () => {
    const pathname =
      location.pathname;

    if (pathname === "/") {
      return "/";
    }

    const items = menuItems.filter(
      (item) =>
        item &&
        "key" in item &&
        typeof item.key === "string"
    );

    const matched = items.find(
      (item) => {
        if (
          !item ||
          !("key" in item) ||
          typeof item.key !==
          "string"
        ) {
          return false;
        }

        return (
          item.key !== "/" &&
          pathname.startsWith(
            item.key
          )
        );
      }
    );

    if (
      matched &&
      "key" in matched
    ) {
      return matched.key as string;
    }

    return "/";
  };

  // -------------------------------
  // MENU CLICK
  // -------------------------------
  const handleMenuClick: MenuProps["onClick"] =
    ({ key }) => {
      navigate(key);

      if (isMobile) {
        setMobileOpen(false);
      }
    };

  // -------------------------------
  // COLORS
  // -------------------------------
  const sidebarBackground =
    isDarkMode
      ? "#15171c"
      : "#ffffff";

  const borderColor =
    isDarkMode
      ? "#282c33"
      : "#e8ebf0";

  // -------------------------------
  // SIDEBAR CONTENT
  // -------------------------------
  const sidebarContent = (
    <Flex
      vertical
      style={{
        height: "100%",
      }}
    >
      {/* BRAND */}
      <Flex
        align="center"
        gap={10}
        style={{
          height: 68,
          padding: collapsed
            ? "0 17px"
            : "0 18px",
          borderBottom:
            `1px solid ${borderColor}`,
        }}
      >
        <Avatar
          shape="square"
          size={38}
          style={{
            flexShrink: 0,
            borderRadius: 10,
            background:
              "linear-gradient(135deg,#1677ff,#4096ff)",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          TC
        </Avatar>

        {!collapsed && (
          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Text
              strong
              style={{
                display: "block",
                fontSize: 15,
                lineHeight: "19px",
              }}
            >
              TC Dental
            </Text>

            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 10,
              }}
            >
              Dental Care
            </Text>
          </div>
        )}

        {!isMobile && (
          <Button
            type="text"
            size="small"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() =>
              onCollapsedChange?.(
                !collapsed
              )
            }
            style={{
              color: isDarkMode
                ? "#d1d5db"
                : "#667085",
              width: 32,
              height: 32,
            }}
          />
        )}
      </Flex>

      {/* MENU */}
      <div
        style={{
          flex: 1,
          padding: "14px 9px",
          overflowY: "auto",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[
            getSelectedKey(),
          ]}
          items={menuItems}
          onClick={
            handleMenuClick
          }
          inlineCollapsed={
            collapsed
          }
          style={{
            border: "none",
            background:
              "transparent",
          }}
        />
      </div>

      {/* THEME */}
      <div
        style={{
          padding: collapsed
            ? "12px 16px"
            : 12,
          borderTop:
            `1px solid ${borderColor}`,
        }}
      >
        {collapsed ? (
          <Button
            type="text"
            block
            icon={
              isDarkMode ? (
                <MoonOutlined />
              ) : (
                <SunOutlined />
              )
            }
            onClick={
              onToggleTheme
            }
            style={{
              height: 40,
              color: isDarkMode
                ? "#ffd666"
                : "#fa8c16",
            }}
          />
        ) : (
          <Flex
            align="center"
            justify="space-between"
            style={{
              padding:
                "9px 10px",
              borderRadius: 10,
              background:
                isDarkMode
                  ? "#1d2026"
                  : "#f6f8fb",
            }}
          >
            <Flex
              align="center"
              gap={9}
            >
              <Avatar
                size={30}
                style={{
                  background:
                    isDarkMode
                      ? "#2b2f36"
                      : "#fff7e6",
                  color: isDarkMode
                    ? "#ffd666"
                    : "#fa8c16",
                }}
                icon={
                  isDarkMode ? (
                    <MoonOutlined />
                  ) : (
                    <SunOutlined />
                  )
                }
              />

              <Text
                style={{
                  fontSize: 12,
                }}
              >
                {isDarkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </Text>
            </Flex>

            <Switch
              size="small"
              checked={isDarkMode}
              onChange={
                onToggleTheme
              }
            />
          </Flex>
        )}
      </div>

      {/* LOGOUT */}
      <div
        style={{
          padding: collapsed
            ? "10px 16px"
            : 12,
          borderTop:
            `1px solid ${borderColor}`,
        }}
      >
        <Button
          danger
          type="text"
          block={!collapsed}
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            height: 40,
            justifyContent: collapsed
              ? "center"
              : "flex-start",
          }}
        >
          {!collapsed && "Logout"}
        </Button>
      </div>

      {/* ADMIN */}
      {!collapsed && (
        <div
          style={{
            padding: 12,
            borderTop:
              `1px solid ${borderColor}`,
          }}
        >
          <Flex
            align="center"
            gap={10}
            style={{
              padding: 10,
              borderRadius: 10,
              background:
                isDarkMode
                  ? "#1d2026"
                  : "#f6f8fb",
            }}
          >
            <Avatar
              size={36}
              style={{
                background: "#1677ff",
                fontWeight: 600,
              }}
            >
             YC
            </Avatar>

            <div>
              <Typography.Text strong>
                {userName || ""}
              </Typography.Text>

              <br />

              <Typography.Text type="secondary">
                {userRole || ""}
              </Typography.Text>
            </div>
          </Flex>
        </div>
      )}
    </Flex>
  );

  // -------------------------------
  // MOBILE
  // -------------------------------
  if (isMobile) {
    return (
      <>
        <Button
          type="text"
          icon={
            <MenuOutlined />
          }
          onClick={() =>
            setMobileOpen(true)
          }
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1100,
            width: 40,
            height: 40,
            borderRadius: 10,
            background:
              sidebarBackground,
            color: isDarkMode
              ? "#ffffff"
              : "#1677ff",
            border:
              `1px solid ${borderColor}`,
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
          }}
        />

        <Drawer
          placement="left"
          width={280}
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          closable={false}
          styles={{
            body: {
              padding: 0,
              background:
                sidebarBackground,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
        <Outlet />
      </>
    );
  }

  // -------------------------------
  // DESKTOP
  // -------------------------------
  return (
    <>

      <Sider
        width={240}
        collapsedWidth={80}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          height: "100vh",
          background:
            sidebarBackground,
          borderRight:
            `1px solid ${borderColor}`,
        }}
      >
        {sidebarContent}
      </Sider>
      <Outlet />
    </>
  );
};

export default Navbar;