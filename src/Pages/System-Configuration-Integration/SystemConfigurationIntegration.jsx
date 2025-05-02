import { Input } from "antd";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import gold from "../../assets/gold.svg";
import { fn_getMerchantLoginHistoryApi, fn_updateApiKeys, fn_getApiKeys } from "../../api/api"

const SystemConfigurationIntegration = ({ setSelectedPage, authorization, showSidebar, setMerchantVerified }) => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [loginData, setLoginData] = useState([]);
  const [secretKey, setSecretKey] = useState("");
  const containerHeight = window.innerHeight - 120;
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
    } else {
      setSelectedPage("setting")
      fetchApiKeys();
      fetchMerchantLoginHistory();
    }
  }, [authorization]);

  const fetchMerchantLoginHistory = async () => {
    const adminId = Cookies.get("MerchantId");
    const response = await fn_getMerchantLoginHistoryApi(adminId);
    if (response?.status) {
      setLoginData(response?.data || []);
    } else {
      console.error("Error fetching login history:", response.message);
    }
  };

  const fetchApiKeys = async () => {
    const response = await fn_getApiKeys();
    if (response?.status) {
      setApiKey(response?.data?.data?.apiKey || "");
      setSecretKey(response?.data?.data?.secretKey || "");
    } else {
      console.error("Error fetching API keys:", response.message);
    }
  };

  const handleApiKeySubmission = async () => {
    if (!apiKey || !secretKey) {
      setStatusMessage("Both API Key and Secret Key are required.");
      return;
    }
    const response = await fn_updateApiKeys(apiKey, secretKey);
    if (response?.status) {
      setMerchantVerified(true);
      localStorage.setItem('merchantVerified', 'true');
    }
    setStatusMessage(response.message);
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
          <h1 className="text-[20px] md:text-[25px] font-[500]">
            System Configuration Integration
          </h1>
          <p>Dashboard - Data Table</p>
        </div>

        {/* API keys section */}
        <div className="bg-white rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4  pb-3">
            {/* First Row: API Key and Secret Key */}
            <div className="flex flex-col ">
              <p className="text-black text-[14px] font-[600]">API Key:</p>
              <Input.Password
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 p-2 text-[14px]"
                placeholder="Enter API Key"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-black text-[14px] font-[600]">Secret Key:</p>
              <Input.Password
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="mt-1 p-2 text-[14px]"
                placeholder="Enter Secret Key"
              />
            </div>

            {/* Second Row: Membership and Tier */}
            <div className="flex flex-col">
              <p className="text-black text-[14px] font-[600]">Membership:</p>
              <Input
                className="mt-1 p-2 text-[14px]"
                placeholder="Enter Phone Number"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-black text-[14px] font-[600]">Tier:</p>
              <div className="flex items-center mt-1 border border-gray-300 rounded px-2">
                <img className="" src={gold} alt="Gold Icon" />
                <Input
                  className="flex-1 p-2 text-[14px] outline-none border-none"
                  placeholder="Gold"
                />
              </div>
            </div>

            <div className="flex">
              <button
                onClick={handleApiKeySubmission}
                className="bg-[#0864E8] text-white px-10  items-center rounded-md hover:bg-[#065BCC]"
              >
                <p className="text-[14px] py-2 px-3"> Save</p>
              </button>
              {statusMessage && (
                <p
                  className={`mt-2 ms-2 text-[14px] ${statusMessage.includes("Merchant Verified Successfully")
                    ? "text-green-500"
                    : "text-red-500"
                    }`}
                >
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Login history section */}
        <div className="bg-white rounded-lg p-4 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between pb-3">
            <div>
              <p className="text-black text-[14px] font-[600]">Login History</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                  <th className="p-4">Login Date & Time</th>
                  <th className="p-4">IP Address</th>
                  {/* <th className="p-4">ISP</th> */}
                  <th className="p-4">City</th>
                </tr>
              </thead>
              <tbody>
                {loginData.length > 0 ? (
                  loginData.map((entry, index) => (
                    <tr key={index} className="text-gray-800 text-sm border-b">
                      <td className="p-4">{entry.loginDate || "-"}</td>
                      <td className="p-4">{(entry.ip?.split("::ffff:")[1]) || "-"}</td>
                      {/* <td className="p-4">{entry.isp || "-"}</td> */}
                      <td className="p-4">{entry.city || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No login history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationIntegration;
