import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Grid, Input, Typography, notification } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { fn_loginMerchantApi } from "../../api/api";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const MerchantLogin = ({ authorization, setAuthorization, setMerchantVerified, setGlobalLoginType, setPermissionsData }) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  const [loginLoader, setLoginLoader] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    if (authorization) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (email && password) {
      const values = { email: email, password: password };
      onFinish(values)
    }
  }, []);

  const onFinish = async (values) => {
    try {
      setLoginLoader(true);
      const response = await fn_loginMerchantApi(values);
      if (response?.status) {
        notification.success({
          message: "Login Successful",
          description: "You have successfully logged in.",
          placement: "topRight",
        });

        setAuthorization(true);
        setGlobalLoginType(response?.type);
        setMerchantVerified(response?.merchantVerified);

        if (response?.type === "merchant") {
          navigate("/");
        } else {
          if (response?.permissions?.dashboard?.view) return navigate("/");
          if (response?.permissions?.transactionHistory?.view) return navigate("/transactions-table");
          if (response?.permissions?.directPayment?.view) return navigate("/direct-payment-page");
          if (response?.permissions?.approvalPoints?.view) return navigate("/approval-points");
          if (response?.permissions?.merchantProfile?.view) return navigate("/merchant-management");
          if (response?.permissions?.reportsAnalytics?.view) return navigate("/reports-and-analytics");
          if (response?.permissions?.support?.view) return navigate("/support-help-center");
          if (response?.permissions?.uploadStatement?.view) return navigate("/upload-statement");
        }
      } else {
        setLoginLoader(false);
        notification.error({
          message: "Login Failed",
          description: response?.message || "Invalid credentials. Please try again.",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Login error: ", error);
      setLoginLoader(false);
      notification.error({
        message: "Error",
        description: "An unexpected error occurred. Please try again later.",
        placement: "topRight",
      });
    }
  };

  const styles = {
    container: {
      margin: "0 auto",
      padding: screens.md ? "40px" : "30px 15px",
      width: "380px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    footer: {
      marginTop: "20px",
      textAlign: "center",
      width: "100%",
    },
    forgotPassword: {
      float: "right",
    },
    header: {
      marginBottom: "30px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    section: {
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      display: "flex",
      height: screens.sm ? "100vh" : "auto",
      padding: "40px 0",
    },
    text: {
      color: "#6c757d",
    },
    title: {
      fontSize: screens.md ? "24px" : "20px",
      marginTop: "10px",
    },
    logo: {
      width: "80px",
      height: "auto",
    },
    checkboxGroup: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    checkbox: {
      marginLeft: "20px",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          {/* <img src={logo} alt="Logo" style={styles.logo} /> */}
          <Title level={2} style={styles.title}>
            User Login
          </Title>
        </div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button w-full"
              loading={loginLoader}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
};

export default MerchantLogin;
