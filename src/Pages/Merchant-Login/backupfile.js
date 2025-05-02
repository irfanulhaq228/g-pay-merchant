import Cookies from "js-cookie";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { fn_loginMerchantApi, fn_loginStaffApi } from "../../api/api";
import {
    Button,
    Checkbox,
    Form,
    Grid,
    Input,
    Typography,
    notification,
} from "antd";

const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

const MerchantLogin = ({
    authorization,
    setAuthorization,
    setMerchantVerified,
    setGlobalLoginType,
    setPermissionsData,
}) => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const [loginType, setLoginType] = useState("merchant");

    useEffect(() => {
        if (authorization) {
            navigate("/");
        }
    }, []);

    const handleLoginTypeChange = (e) => {
        setLoginType(e.target.value);
    };

    const onFinish = async (values) => {
        try {
            if (loginType === "merchant") {
                setGlobalLoginType("merchant");
                Cookies.set("loginType", "merchant");
                const response = await fn_loginMerchantApi(values);
                if (response?.status) {
                    notification.success({
                        message: "Login Successful",
                        description: "You have successfully logged in!",
                        placement: "topRight",
                    });
                    Cookies.set("merchantId", response?.id);
                    Cookies.set("merchantToken", response?.token);
                    setMerchantVerified(response?.merchantVerified);
                    localStorage.setItem("merchantVerified", response?.merchantVerified);
                    navigate("/");
                    setAuthorization(true);
                } else {
                    notification.error({
                        message: "Login Failed",
                        description:
                            response?.message || "Invalid credentials. Please try again.",
                        placement: "topRight",
                    });
                }
            } else {
                setGlobalLoginType("staff");
                Cookies.set("loginType", "staff");
                const response = await fn_loginStaffApi(values);
                if (response?.status) {
                    notification.success({
                        message: "Login Successful",
                        description: "You have successfully logged in!",
                        placement: "topRight",
                    });
                    Cookies.set("merchantId", response?.id);
                    Cookies.set("merchantToken", response?.token);
                    setMerchantVerified(response?.merchantVerified);
                    localStorage.setItem("merchantVerified", response?.merchantVerified);
                    navigate("/");
                    setAuthorization(true);
                    setPermissionsData(() => ({
                        uploadStatement: response?.data?.uploadStatement,
                        merchantProfile: response?.data?.merchantProfile,
                    }));
                    localStorage.setItem("permissionsData", JSON.stringify({
                        uploadStatement: response?.data?.uploadStatement,
                        merchantProfile: response?.data?.merchantProfile,
                    }));
                } else {
                    notification.error({
                        message: "Login Failed",
                        description:
                            response?.message || "Invalid credentials. Please try again.",
                        placement: "topRight",
                    });
                }
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

    const handleCheckboxChange = (checkedValues) => {
        if (checkedValues.length > 1) {
            setLoginType(checkedValues[1]);
        } else {
            setLoginType(checkedValues[0]);
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
                        Welcome back! Please enter your details below to log in as an
                        Merchant.
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
                    <Form.Item>
                        <Checkbox.Group
                            style={{ width: "100%" }}
                            value={[loginType]}
                            onChange={handleCheckboxChange}
                        >
                            <Checkbox value="merchant" style={{ marginRight: "10px" }}>
                                Login as Merchant
                            </Checkbox>
                            <Checkbox value="staff">Login as Staff</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item
                        name="email"
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
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        <a style={styles.forgotPassword} href="#">
                            Forgot password?
                        </a>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: "0px" }}>
                        <Button block type="primary" htmlType="submit">
                            Log in
                        </Button>
                        <div style={styles.footer}>
                            <Text style={styles.text}>Don't have an account?</Text>
                            <Link href="#">Sign up now</Link>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </section>
    );
};

export default MerchantLogin;
