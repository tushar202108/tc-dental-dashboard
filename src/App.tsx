import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Flex,
  Grid,
  Layout,
  Spin,
  Typography,
  theme,
} from "antd";

import {
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { ROUTES } from "./constant/Link";

import Navbar from "./components/Navbar/navbar";

import Login from "../src/pages/login/Login";

import ProtectedRoute from "./routes/ProtectedRoute";

const { Header, Content } =
  Layout;

const { Text } =
  Typography;

const { useBreakpoint } =
  Grid;

function App() {
  const screens =
    useBreakpoint();

  const isMobile =
    !screens.md;

  const [
    isDarkMode,
    setIsDarkMode,
  ] = useState<boolean>(() => {
    return (
      localStorage.getItem(
        "theme"
      ) === "dark"
    );
  });

  const [
    collapsed,
    setCollapsed,
  ] = useState<boolean>(
    false
  );

  const [
    pendingCount,
  ] = useState<number>();

  useEffect(() => {
    localStorage.setItem(
      "theme",
      isDarkMode
        ? "dark"
        : "light"
    );

    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode
        ? "dark"
        : "light"
    );
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(
      (previous) =>
        !previous
    );
  };

  const sidebarWidth =
    isMobile
      ? 0
      : collapsed
        ? 80
        : 240;

  const background =
    isDarkMode
      ? "#0f1115"
      : "#f5f7fb";

  const headerBackground =
    isDarkMode
      ? "#15171c"
      : "#ffffff";

  return (
    <ConfigProvider
      theme={{
        algorithm:
          isDarkMode
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,

        token: {
          colorPrimary:
            "#1677ff",

          borderRadius: 12,

          colorBgLayout:
            background,

          colorBgContainer:
            isDarkMode
              ? "#181b21"
              : "#ffffff",

          colorText:
            isDarkMode
              ? "#f5f7fa"
              : "#172033",

          colorTextSecondary:
            isDarkMode
              ? "#9ca3af"
              : "#6b7280",

          colorBorder:
            isDarkMode
              ? "#2a2e36"
              : "#e6eaf0",
        },

        components: {
          Layout: {
            headerBg:
              headerBackground,

            bodyBg:
              background,

            siderBg:
              isDarkMode
                ? "#15171c"
                : "#ffffff",
          },

          Card: {
            borderRadiusLG: 18,
          },

          Button: {
            borderRadius: 9,
          },

          Input: {
            borderRadius: 9,
          },

          Select: {
            borderRadius: 9,
          },

          Tag: {
            borderRadiusSM: 20,
          },

          Menu: {
            itemBorderRadius: 10,

            itemMarginInline: 0,

            itemSelectedBg:
              isDarkMode
                ? "#111f33"
                : "#e6f4ff",

            itemSelectedColor:
              "#1677ff",

            darkItemBg:
              "#15171c",

            darkItemSelectedBg:
              "#111f33",

            darkItemSelectedColor:
              "#69b1ff",
          },

          Table: {
            headerBg:
              isDarkMode
                ? "#202329"
                : "#f7f9fc",

            rowHoverBg:
              isDarkMode
                ? "#20242b"
                : "#fafcff",
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>

          {/* ========================= */}
          {/* PUBLIC ROUTE               */}
          {/* ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ========================= */}
          {/* PROTECTED APPLICATION      */}
          {/* ========================= */}

          <Route
            element={
              <ProtectedRoute />
            }
          >
            <Route
              path="*"
              element={
                <Layout
                  style={{
                    minHeight:
                      "100vh",

                    background,
                  }}
                >
                  {/* SIDEBAR */}

                  <Navbar
                    collapsed={
                      collapsed
                    }
                    onCollapsedChange={
                      setCollapsed
                    }
                    isDarkMode={
                      isDarkMode
                    }
                    onToggleTheme={
                      toggleTheme
                    }
                  />

                  {/* MAIN AREA */}

                  <Layout
                    style={{
                      minHeight:
                        "100vh",

                      marginLeft:
                        sidebarWidth,

                      background,

                      transition:
                        "margin-left 0.2s ease",
                    }}
                  >
                    {/* HEADER */}

                    <Header
                      style={{
                        height:
                          isMobile
                            ? 64
                            : 68,

                        padding:
                          isMobile
                            ? "0 16px 0 64px"
                            : "0 28px",

                        background:
                          headerBackground,

                        borderBottom:
                          isDarkMode
                            ? "1px solid #252930"
                            : "1px solid #e8ebf0",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        position:
                          "relative",

                        zIndex: 10,
                      }}
                    >
                      {/* LEFT */}

                      <Flex
                        align="center"
                        gap={12}
                      >
                        <Avatar
                          shape="square"
                          size={38}
                          style={{
                            background:
                              "linear-gradient(135deg,#1677ff,#4096ff)",

                            borderRadius:
                              10,

                            fontWeight:
                              700,
                          }}
                        >
                          TC
                        </Avatar>

                        <div>
                          <Text
                            strong
                            style={{
                              display:
                                "block",

                              fontSize:
                                16,

                              lineHeight:
                                "20px",
                            }}
                          >
                            TC Dental
                          </Text>

                          <Text
                            type="secondary"
                            style={{
                              display:
                                "block",

                              fontSize:
                                11,

                              lineHeight:
                                "15px",
                            }}
                          >
                            Patient Management
                          </Text>
                        </div>
                      </Flex>

                    </Header>

                    {/* CONTENT */}

                    <Content
                      style={{
                        minHeight:
                          "calc(100vh - 68px)",

                        background,

                        padding:
                          isMobile
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
                              minHeight:
                                "70vh",
                            }}
                          >
                            <Spin
                              size="large"
                            />
                          </Flex>
                        }
                      >
                        <Routes>
                          {ROUTES.map(
                            (
                              route
                            ) => {
                              const Component =
                                route.component;

                              return (
                                <Route
                                  key={
                                    route.key
                                  }
                                  path={
                                    route.path
                                  }
                                  element={
                                    <Component />
                                  }
                                />
                              );
                            }
                          )}
                        </Routes>
                      </Suspense>
                    </Content>
                  </Layout>
                </Layout>
              }
            />
          </Route>

          {/* UNKNOWN URL */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;