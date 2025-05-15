import "./App.css";
import Cookies from "js-cookie";
import { Routes, Route, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";

import Home from "./Components/Home/Home";
import Payout from "./Pages/Payout/Payout";
import Staff from "./Pages/Staff-Page/Staff";
import Reports from "./Pages/Reports/Reports";
import NavBar from "./Components/NabBar/NavBar";
import Footer from "./Components/Footer/Footer";
import SideBar from "./Components/Sidebar/SideBar";
import Withdraw from "./Pages/Withdraw-Page/Withdraw";
import PayoutDetails from "./Pages/Payout/PayoutDetails";
import NotVerfiedBar from "./Components/NotVerifiedBar/page";
import MerchantLogin from "./Pages/Merchant-Login/MerchantLogin";
import ApprovalPoints from "./Pages/ApprovalPoints/ApprovalPoints";
import UploadStatement from "./Pages/Upload-Statement/UploadStatement";
import TransactionsTable from "./Pages/Transaction-Table/TransactionsTable";
import DirectPaymentPage from "./Pages/Direct-Payment-Page/DirectPaymentPage";
import SupportHelpCenter from "./Pages/Support-Help-Center/SupportHelpCenter";
import MerchantManagement from "./Pages/Merchant-Management/MerchantManagement";
import ReportsAndAnalytics from "./Pages/Reports-&-Analytics/ReportsAndAnalytics";
import SystemConfigurationIntegration from "./Pages/System-Configuration-Integration/SystemConfigurationIntegration";

function App() {

  const [selectedPage, setSelectedPage] = useState("");
  const [loginType, setLoginType] = useState(Cookies.get("loginType") || "");
  const [permissionsData, setPermissionsData] = useState(JSON.parse(localStorage.getItem("permissions")) || {});

  const [showSidebar, setShowSide] = useState(window.innerWidth > 760 ? true : false);
  const [authorization, setAuthorization] = useState(Cookies.get("merchantToken") ? true : false);
  const [merchantVerified, setMerchantVerified] = useState(localStorage.getItem("merchantVerified") === "true" ? true : localStorage.getItem("merchantVerified") === "false" ? false : false);

const navigate = useNavigate();
const inactivityTimeoutRef = useRef(null);
const tabCloseTimeoutRef = useRef(null);

const fn_logout = () => {
  Cookies.remove("merchantToken");
  Cookies.remove("loginType");
  localStorage.removeItem("permissions");
  localStorage.removeItem("merchantVerified");
  localStorage.removeItem("lastTabClosedAt");
  setAuthorization(false);
  navigate("/login");
};

// ⏱️ Check if last closed time was over 1 minute ago
useEffect(() => {
  const token = Cookies.get("merchantToken");
  const lastClosedAt = localStorage.getItem("lastTabClosedAt");

  if (token && lastClosedAt) {
    const closedTime = parseInt(lastClosedAt, 10);
    const now = Date.now();
    const oneMinute = 1 * 60 * 1000;

    if (now - closedTime > oneMinute) {
      fn_logout(); // Session expired after tab close
    } else {
      // Still within 1 minute — clear it
      localStorage.removeItem("lastTabClosedAt");
    }
  }
}, []);

// 🕓 Inactivity and tab blur handling
useEffect(() => {
  if (!authorization) return;

  const activityEvents = ["mousemove", "keydown", "scroll", "click"];

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      fn_logout(); // 10 min inactivity logout
    }, 10 * 60 * 1000);
  };

  const handleTabBlur = () => {
    clearTimeout(tabCloseTimeoutRef.current);
    tabCloseTimeoutRef.current = setTimeout(() => {
      fn_logout(); // Optional: logout after 5 min tab blur
    }, 5 * 60 * 1000);
  };

  const handleTabFocus = () => {
    clearTimeout(tabCloseTimeoutRef.current);
  };

  activityEvents.forEach((event) =>
    window.addEventListener(event, resetInactivityTimer)
  );
  window.addEventListener("blur", handleTabBlur);
  window.addEventListener("focus", handleTabFocus);

  resetInactivityTimer();

  return () => {
    activityEvents.forEach((event) =>
      window.removeEventListener(event, resetInactivityTimer)
    );
    window.removeEventListener("blur", handleTabBlur);
    window.removeEventListener("focus", handleTabFocus);
    clearTimeout(inactivityTimeoutRef.current);
    clearTimeout(tabCloseTimeoutRef.current);
  };
}, [authorization]);

// 💾 Store tab close time
useEffect(() => {
  const handleTabClose = () => {
    localStorage.setItem("lastTabClosedAt", Date.now().toString());
  };

  window.addEventListener("beforeunload", handleTabClose);
  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
  };
}, []);

// ✅ If on login route, reset verified state
useEffect(() => {
  if (window.location.pathname === "/login") {
    setMerchantVerified(true);
  }
}, []);

  return (
    <>
      {!merchantVerified && <NotVerfiedBar />}
      {authorization && (
        <SideBar
          merchantVerified={merchantVerified}
          showSidebar={showSidebar}
          setShowSide={setShowSide}
          setAuthorization={setAuthorization}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          setMerchantVerified={setMerchantVerified}
          loginType={loginType}
          permissionsData={permissionsData}
        />
      )}
      <div>
        {authorization && (
          <NavBar setShowSide={setShowSide} showSidebar={showSidebar} loginType={loginType} />
        )}
        <Routes>
          <Route
            path="/login"
            element={
              <MerchantLogin
                authorization={authorization}
                setAuthorization={setAuthorization}
                setMerchantVerified={setMerchantVerified}
                loginType={loginType}
                setGlobalLoginType={setLoginType}
                setPermissionsData={setPermissionsData}
              />
            }
          />

          <Route
            path="/"
            element={
              <Home
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />

          <Route
            path="/transactions-table"
            element={
              <TransactionsTable
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route
            path="/merchant-management"
            element={
              <MerchantManagement
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
              />
            }
          />

          <Route
            path="/reports-and-analytics"
            element={
              <ReportsAndAnalytics
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
              />
            }
          />

          <Route
            path="/support-help-center"
            element={
              <SupportHelpCenter
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
              />
            }
          />

          <Route
            path="/system-configuration"
            element={
              <SystemConfigurationIntegration
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                setMerchantVerified={setMerchantVerified}
              />
            }
          />

          <Route
            path="/upload-statement"
            element={
              <UploadStatement
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
              />
            }
          />

          <Route
            path="/staff"
            element={
              <Staff
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
              />
            }
          />
          <Route
            path="/direct-payment-page"
            element={
              <DirectPaymentPage
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route
            path="/approval-points"
            element={
              <ApprovalPoints
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route
            path="/withdraw"
            element={
              <Withdraw
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route
            path="/reports"
            element={
              <Reports
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route
            path="/payout"
            element={
              <Payout
                setSelectedPage={setSelectedPage}
                authorization={authorization}
                showSidebar={showSidebar}
                permissionsData={permissionsData}
                loginType={loginType}
              />
            }
          />
          <Route path="/payout-details" element={<PayoutDetails showSidebar={showSidebar} />} />

        </Routes>
        {authorization && <Footer />}
      </div>
    </>
  );
}

export default App;
