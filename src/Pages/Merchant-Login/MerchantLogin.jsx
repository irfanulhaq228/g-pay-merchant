import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Grid, Input, Typography, notification } from "antd";

import logo from "../../assets/logo.png";
import { fn_loginMerchantApi } from "../../api/api";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const MerchantLogin = ({ authorization, setAuthorization, setMerchantVerified, setGlobalLoginType, setPermissionsData }) => {

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email"); // Get the 'id' query parameter
  const password = searchParams.get("password"); // Get the 'id' query parameter

  console.log(email, password);
  

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
      const response = await fn_loginMerchantApi(values, setPermissionsData);
      if (response?.status) {
        notification.success({
          message: response?.message,
          description: "You have successfully logged in!",
          placement: "topRight",
        });
        setMerchantVerified(response?.merchantVerified);
        setGlobalLoginType(response?.type);
        setAuthorization(true);
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
          localStorage.removeItem("permissions");
          Cookies.remove("merchantId");
          Cookies.remove("loginType");
          Cookies.remove("website");
          Cookies.remove("merchantToken");
          localStorage.removeItem("merchantVerified");
          window.location.reload();
        }
      } else {
        notification.error({
          message: "Login Failed",
          description: response?.message || "Invalid credentials. Please try again.",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Login error: ", error);
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
          <img src={logo} alt="Logo" style={styles.logo} />
          <Title style={styles.title}>Merchant Login</Title>
          <Text style={styles.text}>
            Welcome back! Please enter your details below to log in as an Merchant.
          </Text>
        </div>
        <Form
          name="merchant_login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="email"
            id="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            id="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
};

export default MerchantLogin;
