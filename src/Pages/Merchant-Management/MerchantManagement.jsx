import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { FiEdit, FiCamera, FiTrash2 } from "react-icons/fi";
import { Switch, Button, Modal, Input, notification, Select, Divider, Space } from "antd";

import { Banks } from "../../json-data/banks";
import upilogo2 from "../../assets/upilogo2.svg";
import Rectangle from "../../assets/Rectangle.jpg";
import BACKEND_URL, { fn_BankUpdate, fn_getBankByAccountTypeApi, fn_getMerchantData, fn_getAllBankNames } from "../../api/api";
import { TiPlusOutline } from "react-icons/ti";

const MerchantManagement = ({ setSelectedPage, authorization, showSidebar, permissionsData }) => {

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [name, setName] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [banksData, setBanksData] = useState([]);
  const [phoneData, setPhoneData] = useState(null);
  const containerHeight = window.innerHeight - 120;
  const [state, setState] = useState({ bank: "" });
  const [activeTab, setActiveTab] = useState("bank");
  const [websiteList, setWebsiteList] = useState([]);
  const [websiteName, setWebsiteName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [editAccountId, setEditAccountId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [items, setItems] = useState(Banks.map((bank) => bank.title));
  const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.merchantProfile?.edit : true;

  const [data, setData] = useState({
    image: null,
    bankName: "",
    accountNo: "",
    accountType: "",
    iban: "",
    accountHolderName: "",
  });

  const [bankNames, setBankNames] = useState([]);

  const fetchBankNames = async () => {
    const response = await fn_getAllBankNames();
    if (response.status) {
      setBankNames(response.data.map(bank => ({
        label: bank.bankName.toUpperCase(),
        value: bank.bankName.toUpperCase()
      })));
    }
  };

  useEffect(() => {
    if (open) {
      fetchBankNames();
    }
  }, [open]);

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
    }
    setSelectedPage("merchant-profile");
    fn_getBankByAccountType();
  }, [activeTab]);

  useEffect(() => {
    const bank = Banks.find((item) => item.title === state.bank);
    if (bank) {
      setSelectedBank(bank);
    }
  }, [state.bank]);

  const fetchMerchantData = async () => {
    const token = Cookies.get("merchantToken");
    if (token) {
      const result = await fn_getMerchantData();
      if (result.status) {
        setMerchantData(result.data?.data);
        setPhoneData(result.data?.data?.phone);
      } else {
        console.error(result.message);
      }
    }
  };

  useEffect(() => {
    fn_getWebsiteList();
    fetchMerchantData();
  }, []);

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    setState((prev) => {
      const updateState = { ...prev, [name]: value };
      if (name === "bank") {
        setData((prevData) => {
          const updatedData = {
            ...prevData,
            bankName: value,
          };
          console.log("Updated Data:", updatedData);
          return updatedData;
        });
      }
      // console.log('Updated State:', updateState);
      return updateState;
    });
  };

  const fn_getBankByAccountType = async () => {
    const response = await fn_getBankByAccountTypeApi(activeTab.toLowerCase());
    console.log(response);
    if (response?.status) {
      if (response?.data?.status === "ok") {
        setBanksData(response?.data?.data);
      }
    }
  };

  const fn_getWebsiteList = async () => {
    try {
      const token = Cookies.get("merchantToken");
      const response = await axios.get(`${BACKEND_URL}/website/getAllMerchant`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response?.status === 200) {
        setWebsiteList(response?.data?.data);
      }
    } catch (error) {
      console.log("error => ", error);
    };
  };

  const handleEdit = (account) => {
    setData({
      image: account.image,
      bankName: account.bankName?.toUpperCase(),
      accountNo: account.accountNo,
      iban: account.iban,
      accountHolderName: account.accountHolderName,
    });
    setEditAccountId(account._id);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleAddAccount = () => {
    setData({
      image: null,
      bankName: "",
      accountNo: "",
      accountType: "",
      iban: "",
      accountHolderName: "",
    });
    setIsEditMode(false);
    setEditAccountId(null);
    setOpen(true);
  };

  const fn_submit = async () => {
    try {
      if (activeTab === "upi" && !data?.image) {
        notification.error({
          message: "Error",
          description: "QR Code is required",
          placement: "topRight",
        });
        return;
      }

      if (data?.bankName === "") {
        if (activeTab === "bank") {
          notification.error({
            message: "Error",
            description: "Enter Bank Name",
            placement: "topRight",
          });
          return;
        }
      }
      if (data?.accountNo === "") {
        if (activeTab === "bank") {
          notification.error({
            message: "Error",
            description: "Enter Account Number",
            placement: "topRight",
          });
          return;
        }
      }
      if (data?.iban === "") {
        notification.error({
          message: "Error",
          description: `Enter ${activeTab === "bank" ? "IFSC Number" : "UPI ID"
            }`,
          placement: "topRight",
        });
        return;
      }
      if (data?.accountHolderName === "") {
        notification.error({
          message: "Error",
          description: "Enter Account Holder Name",
          placement: "topRight",
        });
        return;
      }
      const formData = new FormData();
      if (activeTab === "bank") {
        // Bank account - QR is optional
        if (data?.image) {
          formData.append("image", data?.image);
        }
        formData.append("bankName", data?.bankName);
        formData.append("phone", phoneData);
        formData.append("accountNo", data?.accountNo);
        formData.append("accountType", activeTab);
        formData.append("iban", data?.iban);
        formData.append("accountHolderName", data?.accountHolderName);
        formData.append("block", true);
      } else {
        // UPI account - QR is mandatory
        if (!data?.image) return;
        formData.append("image", data?.image);
        formData.append("accountType", activeTab);
        formData.append("iban", data?.iban);
        formData.append("accountHolderName", data?.accountHolderName);
        formData.append("block", true);
      }
      const token = Cookies.get("merchantToken");
      let response;
      if (isEditMode) {
        response = await axios.put(
          `${BACKEND_URL}/withdrawBank/update/${editAccountId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(`${BACKEND_URL}/withdrawBank/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      if (response?.status === 200) {
        setOpen(false);
        notification.success({
          message: "Success",
          description: isEditMode
            ? "Bank Updated Successfully!"
            : "Bank Created Successfully!",
          placement: "topRight",
        });
        setData({
          image: null,
          bankName: "",
          accountNo: "",
          iban: "",
          accountHolderName: "",
        });
        setIsEditMode(false);
        setEditAccountId(null);
        fn_getBankByAccountType();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Network Error";
      notification.error({
        message: "Error",
        description: errorMessage,
        placement: "topRight",
      });
    }
  };

  const fn_edit_phone = async () => {
    try {
      console.log('click');

      if (!phoneData) {
        notification.error({
          message: "Error",
          description: "Must enter phone number",
          placement: "topRight",
        });
        return;
      }

      const formData = new FormData();
      formData.append("phone", phoneData);

      const token = Cookies.get("merchantToken");
      let response;
      response = await axios.put(
        `${BACKEND_URL}/merchant/update/${merchantData?._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (response?.status === 200) {
        setOpen(false);
        notification.success({
          message: "Success",
          description: "Phone Updated Successfully!",
          placement: "topRight",
        });

        setEditModalOpen(false);
        fetchMerchantData();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Network Error";
      notification.error({
        message: "Error",
        description: errorMessage,
        placement: "topRight",
      });
    }
  };

  const handleProfileImageUpdate = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = Cookies.get("merchantToken");
      const response = await axios.put(
        `${BACKEND_URL}/merchant/update/${merchantData?._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        notification.success({
          message: "Success",
          description: "Profile image updated successfully!",
          placement: "topRight",
        });
        const result = await fn_getMerchantData();
        if (result.status) {
          setMerchantData(result.data?.data);
        }
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message || "Failed to update profile image",
        placement: "topRight",
      });
    }
  };

  const fn_createWebsite = async () => {
    if (websiteName === "") {
      notification.error({
        message: "Error",
        description: errorMessage,
        placement: "topRight",
      });
    };
    const token = Cookies.get("merchantToken");
    const response = await axios.post(`${BACKEND_URL}/website/create`, { url: websiteName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    if (response?.status === 200) {
      notification.success({
        message: "Success",
        description: "Website Added Successfully!",
        placement: "topRight",
      });
      setWebsiteName("");
      fn_getWebsiteList();
    }
  };

  const fn_deleteWebsute = async (id) => {
    try {
      const token = Cookies.get("merchantToken");
      const response = await axios.delete(`${BACKEND_URL}/website/delete/${id}`, {
        headers: {                                      
          Authorization: `Bearer ${token}`,
        }
      });                      
      if (response?.status === 200) {
        notification.success({
          message: "Success",
          description: "Website Deleted Successfully!",
          placement: "topRight",
        });
        fn_getWebsiteList();                                                    
      }
    } catch (error) {                                                   
      notification.error({                           
        message: "Error",
        description: error?.response?.data?.message || "Failed to delete website",
        placement: "topRight",
      });                                                                                
    }
  };

  const addItem = (e) => {
    e.preventDefault();
    if (name && !items.includes(name)) {
      setItems([...items, name]);
    }
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        {/* header */}
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
          <div className="w-full md:w-2/6">
            <h1 className="text-[25px] font-[500]">Banks Details</h1>
          </div>
          <div className="w-full md:w-3/4 flex items-center justify-between">
            <h1 className="hidden md:block text-[25px] font-[500] ps-[15px]">Withdraw</h1>
            <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
              Dashboard - Data Table
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-7 md:flex-row bg-gray-100 ">
          {/* Left side card section */}
          <div className="w-full md:w-2/6 bg-white rounded-lg lg:min-h-[550px] shadow-md border">
            <div className="flex flex-col z-[-1] items-center">
              <img
                src={Rectangle}
                alt="image"
                className="h-[130px] object-cover w-full rounded-t-lg"
              />
              <div
                className="w-[150px] h-[150px] rounded-full flex justify-center items-center bg-white mt-[-75px] z-[9] relative"
                style={{ boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)" }}
              >
                <img
                  src={`${BACKEND_URL}/${merchantData?.image}`}
                  alt="logo"
                  className="w-[100px]"
                />
                <div
                  className="absolute bottom-2 right-2 w-[35px] h-[35px] bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await handleProfileImageUpdate(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <FiCamera className="text-gray-600 text-xl" />
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-[19px] font-[600] text-center mt-4">
              {merchantData?.merchantName}
            </p>
            <div className="m-3 mt-6">
              <h3 className="text-[16px] font-[600] border-b pb-2">
                Personal Info
              </h3>
              <div className="space-y-3 pt-3">
                {/* <div className="flex">
                  <span className="text-[12px]">{merchantData?.name}</span>
                </div> */}
                <div className="flex">
                  <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px] ">
                    Email:
                  </span>
                  <span className="text-[12px]">{merchantData?.email}</span>
                </div>
                <div className="flex">
                  <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px]">
                    Phone:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]">{merchantData?.phone}</span>
                    <FiEdit className=" text-[12px] cursor-pointer" onClick={() => setEditModalOpen(true)} />
                  </div>
                </div>
                <div className="flex">
                  <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px]">
                    Website:
                  </span>
                  <span className="text-[12px]">{merchantData?.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Withdrawal heading */}
          <h1 className="md:hidden text-[25px] font-[500] mt-4 mb-2">Withdrawal</h1>

          {/* Right side Card */}
          <div className="w-full md:w-3/4 lg:min-h-[550px] bg-white rounded-lg shadow-md border">
            {/* Header */}
            <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b space-y-4 md:space-y-0">
              {/* Tab Buttons */}
              < div className="w-full md:w-auto">
                <button
                  className="text-[14px] font-[600] px-4 py-2 w-full md:w-auto border-t"
                  style={{
                    backgroundImage:
                      activeTab === "bank"
                        ? "linear-gradient(rgba(8, 100, 232, 0.1), rgba(115, 115, 115, 0))"
                        : "none",
                  }}
                  onClick={() => setActiveTab("bank")}
                >
                  Bank Accounts
                </button>
                <button
                  className="text-[14px] font-[600] px-4 py-2 w-full md:w-auto border-t"
                  style={{
                    backgroundImage:
                      activeTab === "upi"
                        ? "linear-gradient(rgba(8, 100, 232, 0.1), rgba(115, 115, 115, 0))"
                        : "none",
                  }}
                  onClick={() => setActiveTab("upi")}
                >
                  UPI Accounts
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                {editablePermission && (
                  <>
                    <Button
                      type="primary"
                      onClick={() => setWebsiteModalOpen(true)}
                    >
                      Website Management
                    </Button>
                    {/* <Button type="primary" onClick={handleAddAccount}>
                      Add Bank Account
                    </Button> */}
                  </>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#ECF0FA]">
                  <tr>
                    <th className="p-3 text-[13px] font-[600] text-nowrap">
                      Bank Name
                    </th>
                    <th className="pl-20 text-[13px] font-[600] text-nowrap">
                      {activeTab === "upi" ? "UPI ID" : "IFSC"}
                    </th>
                    <th className="p-5 text-[13px] font-[600] whitespace-nowrap">
                      Account Title
                    </th>
                    <th className="p-5 text-[13px] font-[600] pl-10">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {banksData.map((account, index) => {
                    return (
                      <tr
                        key={index}
                        className={`border-t border-b ${index % 2 === 0 ? "bg-white" : ""
                          }`}
                      >
                        <td className="p-3 text-[13px] font-[600]">
                          <div className="flex items-center space-x-2 flex-wrap md:flex-nowrap">
                            {activeTab === "bank" ? (
                              <div className="flex items-center gap-[3px]">
                                {/* <img
                                  src={
                                    Banks?.find(
                                      (bank) =>
                                        bank?.title === account?.bankName
                                    )?.img
                                  }
                                  alt=""
                                  className="w-[50px]"
                                /> */}
                                <span className="whitespace-nowrap">
                                  {account.bankName}
                                </span>
                              </div>
                            ) : (
                              <img src={upilogo2} alt="" className="w-[50px]" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-[13px]">
                          <div className="ml-14">
                            {" "}
                            <span className="whitespace-nowrap">
                              {account.iban}
                            </span>
                            {activeTab === "upi" && (
                              <div className="text-[12px] text-gray-600 mt-1">
                                {account.UPIID}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-[13px] whitespace-nowrap">
                          <div className="ml-2">
                            {account.accountHolderName}
                          </div>
                        </td>
                        {/* <td className="text-center">
                          <button
                            className={`px-3 py-[5px]  rounded-[20px] w-20 flex items-center justify-center text-[11px] font-[500] ${account?.block === false
                              ? "bg-[#10CB0026] text-[#0DA000]"
                              : "bg-[#FF173D33] text-[#D50000]"
                              }`}
                          >
                            {!account?.block ? "Active" : "Inactive"}
                          </button>
                        </td> */}
                        <td className="p-3 text-center">
                          <div className="flex ms-[10px]">
                            <Button
                              className="bg-green-100 text-green-600 rounded-full px-2 py-2 mx-2"
                              title="Edit"
                              onClick={() => handleEdit(account)}
                            >
                              <FiEdit />
                            </Button>
                            {/* {editablePermission && (
                              <>
                                <Switch
                                  size="small"
                                  checked={!account?.block}
                                  onChange={async (checked) => {
                                    const newStatus = checked;
                                    const response = await fn_BankUpdate(
                                      account?._id,
                                      {
                                        block: !newStatus
                                      }
                                    );

                                    if (response?.status) {
                                      fn_getBankByAccountType();
                                      notification.success({
                                        message: "Status Updated",
                                        description: `Bank Status Updated!.`,
                                        placement: "topRight",
                                      });
                                    } else {
                                      notification.error({
                                        message: "Error",
                                        description:
                                          response.message ||
                                          "Failed to update bank status.",
                                        placement: "topRight",
                                      });
                                    }
                                  }}
                                />
                                <Button
                                  className="bg-green-100 text-green-600 rounded-full px-2 py-2 mx-2"
                                  title="Edit"
                                  onClick={() => handleEdit(account)}
                                >
                                  <FiEdit />
                                </Button>
                              </>
                            )} */}
                            {!editablePermission && (
                              <p className="italic text-[12px] text-red-500 mt-[2px] text-nowrap">
                                Action Not Allowed
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* edit phone modal */}
      <Modal
        centered
        width={600}
        style={{ fontFamily: "sans-serif" }}
        title={
          <p className="text-[16px] font-[700] ">Edit Phone</p>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
      >
        <div className="flex flex-col gap-4">
          {/* Top Section */}
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Enter Phone Number"
              defaultValue={phoneData}
              onChange={(e) => setPhoneData(e.target.value)}
              className="text-[12px]"
            />
            <Button
              type="primary"
              className="w-24"
              onClick={fn_edit_phone}
            >
              Update
            </Button>
          </div>


        </div>
      </Modal>

      {/* website management modal */}
      <Modal
        centered
        width={600}
        style={{ fontFamily: "sans-serif" }}
        title={
          <p className="text-[16px] font-[700]">Website Management</p>
        }
        open={websiteModalOpen}
        onCancel={() => setWebsiteModalOpen(false)}
        footer={null}
      >
        <div className="flex flex-col gap-4">
          {/* Top Section */}
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Enter Website Name"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              className="text-[12px]"
            />
            <Button
              type="primary"
              className="w-24"
              onClick={fn_createWebsite}
            >
              Submit
            </Button>
          </div>

          {/* Divider Line */}
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#ECF0FA]">
                  <th className="p-3 text-[13px] font-[600] text-left">
                    Sr. No
                  </th>
                  <th className="p-3 text-[13px] font-[600] text-left">
                    Website Name
                  </th>
                  <th className="p-3 text-[13px] font-[600] text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {websiteList?.length > 0 ? websiteList?.map((web, index) => (
                  <tr className="border-b">
                    <td className="p-3 text-[13px]">{index + 1}</td>
                    <td className="p-3 text-[13px]">{web?.url}</td>
                    <td className="p-3 text-[13px]">
                      <Button
                        className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 flex items-center justify-center min-w-[32px] h-[32px] border-none"
                        title="Delete"
                        onClick={() => fn_deleteWebsute(web?._id)}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center text-[13px]">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Add bank modal */}
      <Modal
        centered
        width={600}
        style={{ fontFamily: "sans-serif" }}
        title={
          <p className="text-[16px] font-[700]">
            {isEditMode
              ? "Edit Your Bank Account"
              : "Add New Bank Account"}
          </p>
        }
        footer={
          <div className="flex gap-4 mt-6">
            <Button
              className="flex start px-10 text-[12px]"
              type="primary"
              onClick={fn_submit}
            >
              Save
            </Button>

            <Button
              className="flex start px-10 bg-white text-[#FF3D5C] border border-[#FF7A8F] text-[12px]"
              type=""
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        {activeTab === "bank" && (
          <>
            {/* bank image */}
            {selectedBank && (
              <div className="w-[120px] h-[120px]">
                <img alt="" src={selectedBank?.img} />
              </div>
            )}
            <div className="flex gap-4 ">
              {/* bank name */}
              <div className="flex-1 my-2">
                <p className="text-[12px] font-[500] pb-1">
                  Bank Name <span className="text-[#D50000]">*</span>
                </p>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Bank"
                  value={data?.bankName || undefined}
                  onChange={(value) => setData(prev => ({ ...prev, bankName: value }))}
                  options={bankNames}
                />
              </div>
              {/* Account Number */}
              <div className="flex-1 my-2">
                <p className="text-[12px] font-[500] pb-1">
                  Account Number{" "}
                  <span className="text-[#D50000]">*</span>
                </p>
                <Input
                  value={data?.accountNo}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      accountNo: e.target.value,
                    }))
                  }
                  className="w-full  text-[12px]"
                  placeholder="Enter Account Number"
                />
              </div>
            </div>
          </>
        )}
        <div className="flex gap-4">
          {/* IFCS No. */}
          <div className="flex-1 my-2">
            <p className="text-[12px] font-[500] pb-1">
              {activeTab === "bank" ? (
                <>
                  IFSC No. <span className="text-[#D50000]">*</span>
                </>
              ) : (
                <>
                  UPI ID <span className="text-[#D50000]">*</span>
                </>
              )}
            </p>
            <Input
              value={data?.iban}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  iban: e.target.value,
                }))
              }
              className="w-full text-[12px]"
              placeholder={`${activeTab === "bank"
                ? "Enter IFSC Number"
                : "Enter UPI ID"
                }`}
            />
          </div>
          {/* account Holder Name */}
          <div className="flex-1 my-2">
            <p className="text-[12px] font-[500] pb-1">
              Account Holder Name{" "}
              <span className="text-[#D50000]">*</span>
            </p>
            <Input
              value={data?.accountHolderName}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  accountHolderName: e.target.value,
                }))
              }
              className="w-full text-[12px]"
              placeholder="Account Holder Name"
            />
          </div>
        </div>
        <div className="flex gap-4">
          {/* Account QR Code - only show for UPI */}
          {activeTab === "upi" && (
            <div className="flex-1 my-2">
              <p className="text-[12px] font-[500] pb-1">
                UPI QR Code <span className="text-[#D50000]">*</span>
              </p>
              <Input
                type="file"
                required
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    image: e.target.files[0],
                  }));
                }}
                className="w-full text-[12px]"
                placeholder="Select QR Code"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MerchantManagement;
