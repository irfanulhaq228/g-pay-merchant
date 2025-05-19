import Cookies from "js-cookie";
import OtpInput from 'react-otp-input';
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Grid, Input, Modal, Typography, notification } from "antd";

import logo from "../../assets/logo.png";
import { fn_loginMerchantApi, fn_otpVerifyApi } from "../../api/api";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const MerchantLogin = ({ authorization, setAuthorization, setMerchantVerified, setGlobalLoginType, setPermissionsData }) => {

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  const resendTimer = 60;
  const timerRef = useRef(null);
  const [otp, setOtp] = useState('');
  const [otpModal, setOtpModal] = useState(false);
  const [timer, setTimer] = useState(resendTimer || 10);

  const [loginLoader, setLoginLoader] = useState(false);
  const [verifyLoader, setVerifyLoader] = useState(false);

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

  useEffect(() => {
    if (otpModal) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [otpModal]);

  const onFinish = async (values) => {
    try {
      setLoginLoader(true);
      const response = await fn_loginMerchantApi(values);
      if (response?.status) {
        notification.success({
          message: "OTP sent Successfully",
          description: "Check your email for the OTP",
          placement: "topRight",
        });
        setOtpModal(true);
        setLoginLoader(false);
        // setMerchantVerified(response?.merchantVerified);
        // setGlobalLoginType(response?.type);
        // setAuthorization(true);
        // sessionStorage.setItem("session", "session");
        // if (response?.type === "merchant") {
        //   navigate("/");
        // } else {
        //   if (response?.permissions?.dashboard?.view) return navigate("/");
        //   if (response?.permissions?.transactionHistory?.view) return navigate("/transactions-table");
        //   if (response?.permissions?.directPayment?.view) return navigate("/direct-payment-page");
        //   if (response?.permissions?.approvalPoints?.view) return navigate("/approval-points");
        //   if (response?.permissions?.merchantProfile?.view) return navigate("/merchant-management");
        //   if (response?.permissions?.reportsAnalytics?.view) return navigate("/reports-and-analytics");
        //   if (response?.permissions?.support?.view) return navigate("/support-help-center");
        //   if (response?.permissions?.uploadStatement?.view) return navigate("/upload-statement");
        //   localStorage.removeItem("permissions");
        //   Cookies.remove("merchantId");
        //   Cookies.remove("loginType");
        //   Cookies.remove("website");
        //   Cookies.remove("merchantToken");
        //   localStorage.removeItem("merchantVerified");
        //   window.location.reload();
        // }
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

  const fn_closeOtpModal = () => {
    setOtpModal(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fn_verifyOTP = async () => {
    setVerifyLoader(true);
    const response = await fn_otpVerifyApi({ email: emailInput, otp, password: passwordInput }, setPermissionsData);
    if (response?.status) {
      notification.success({
        message: "Login Successful",
        description: "You have successfully logged in.",
        placement: "topRight",
      });

      setVerifyLoader(false);
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
      setVerifyLoader(false);
      notification.error({
        message: "Login Failed",
        description:
          response?.message || "Invalid credentials. Please try again.",
        placement: "topRight",
      });
    }
  };

  const fn_resendOtp = async () => {
    await onFinish({ email: emailInput, password: passwordInput });
    setTimer(resendTimer);
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
            onChange={(e) => setEmailInput(e.target.value)}
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
            onChange={(e) => setPasswordInput(e.target.value)}
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
            <Button block type="primary" htmlType="submit" loading={loginLoader}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Modal title="Enter OTP" open={otpModal} onClose={fn_closeOtpModal} onCancel={fn_closeOtpModal} centered width={400} style={{ fontFamily: "sans-serif" }} footer={null}>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mt-[23px] mb-[10px] w-[max-content] gap-[20px]">
            <OtpInput
              value={otp}
              numInputs={6}
              onChange={setOtp}
              renderSeparator={<span className='mx-[5px]'></span>}
              renderInput={(props) => <input {...props} />}
              inputStyle={{ width: "45px", height: "45px", border: "1px solid gray", fontSize: "17px", fontWeight: "600", borderRadius: "8px" }}
            />
            <div className="w-full">
              <Button type="primary" loading={verifyLoader} className="h-[35px] text-[14px] font-[500] text-white w-full bg-[#1476ff] rounded-[8px]" onClick={fn_verifyOTP}>Verify OTP</Button>
            </div>
            {timer > 0 ? (
              <div className="text-[13px] text-gray-800">
                Resend OTP in <span className="font-[600]">{formatTime(timer)}</span>
              </div>
            ) : (
              <div
                className="text-[14px] text-blue-600 cursor-pointer hover:underline"
                onClick={fn_resendOtp}
              >
                Resend OTP
              </div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default MerchantLogin;
