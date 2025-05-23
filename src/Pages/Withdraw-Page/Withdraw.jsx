import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment/moment";
import ReactQuill from "react-quill";
import PhoneInput from 'react-phone-input-2';
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Select, Button, notification, Radio, Pagination } from "antd";

import 'react-quill/dist/quill.snow.css';
import 'react-phone-input-2/lib/style.css';

import { Banks } from "../../json-data/banks";
import BACKEND_URL, { fn_getBankByAccountTypeApi, fn_getAllBankNames, fn_getAllLocations, fn_getAllPortals, fn_getAllLocationsById } from "../../api/api";

import { FiEye } from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaExclamationCircle } from "react-icons/fa";

const Withdraw = ({ setSelectedPage, authorization, showSidebar }) => {

    const navigate = useNavigate();
    const [banks, setBanks] = useState([]);
    const [exchanges, setChanges] = useState([])
    const containerHeight = window.innerHeight - 120;
    const [transactions, setTransactions] = useState([]);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

    const inputRef = useRef(null);
    const [utr, setUtr] = useState("");
    const [note, setNote] = useState("");
    const [name, setName] = useState(null);
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [portal, setPortal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newOpen, setNewOpen] = useState(false);
    const [exchange, setExchange] = useState(null);
    const [bankNames, setBankNames] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("bank");
    const [isEditMode, setIsEditMode] = useState(false);
    const [exchangeData, setExchangeData] = useState({});
    const [editAccountId, setEditAccountId] = useState(null);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [merchantWallet, setMerchantWallet] = useState({});
    const [disableButton, setDisableButton] = useState(false);
    const [newSelectedBank, setNewSelectedBank] = useState(null);
    const [selectedPortal, setSelectedPortal] = useState(null);
    const [items, setItems] = useState(Banks.map((bank) => bank.title));
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState(null);

    // Add new state variables for AED
    const [location, setLocation] = useState(null);
    const [contactNumber, setContactNumber] = useState('');
    const [token, setToken] = useState('');
    const [locations, setLocations] = useState([]);
    const [portals, setPortals] = useState([]);


    const [data, setData] = useState({
        image: null,
        bankName: null,
        accountNo: "",
        accountType: "",
        iban: "",
        accountHolderName: "",
    });

    useEffect(() => {
        window.scroll(0, 0);
        if (!authorization) {
            navigate("/login");
            return;
        }
        setSelectedPage("withdraw");
        fn_getMerchantBanks();
        fn_getExchanges();
        fn_getWithdraws();
        fn_merchantWallet();
        fetchPortals();
    }, []);

    useEffect(() => {
        fn_getWithdraws();
    }, [currentPage]);

    useEffect(() => {
        setNote("");
        setExchange(null);
        setNewSelectedBank(null);
        setWithdrawAmount('');
    }, [withdrawModalOpen])

    useEffect(() => {
        if (exchange) {
            setExchangeData(exchanges?.find((e) => e?.value === exchange));
        }
    }, [exchange]);

    const fetchLocations = async (id) => {
        const response = await fn_getAllLocationsById(id);
        if (response.status) {
            setLocations(response.data.map(location => ({
                value: location._id,
                label: location.location
            })));
        }
    };

    const fn_getMerchantBanks = async () => {
        const response = await fn_getBankByAccountTypeApi("");
        if (response?.status) {
            setBanks(response?.data?.data?.map((item) => {
                return { value: item?._id, label: `${item?.accountType === "upi" ? `UPI - ${item?.iban}` : `${item?.bankName} - ${item?.accountNo}`}` }
            }));
        }
    };

    const fn_getExchanges = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/exchange/get`)
            if (response?.status === 200) {
                setChanges(response?.data?.data?.map((item) => {
                    return { value: item?._id, label: item?.currency, rate: item?.currencyRate, charges: item?.charges }
                }))
            }
        } catch (error) {
            console.log("error while fetching exchange ", error);
        }
    };

    const fn_getWithdraws = async () => {
        try {
            const token = Cookies.get("merchantToken");
            const response = await axios.get(`${BACKEND_URL}/withdraw/getAll?type=merchant&page=${currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response?.status === 200) {
                setLoading(false);
                setTransactions(response?.data?.data);
                setTotalPages(response?.data?.totalPages);
            }
        } catch (error) {
            setLoading(false);
            console.log("error while withdraws get ", error);
        }
    };

    const fn_merchantWallet = async () => {
        try {
            const token = Cookies.get("merchantToken");
            const response = await axios.get(`${BACKEND_URL}/ledger/withdrawData`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response?.status === 200) {
                setMerchantWallet(response?.data);
            }
        } catch (error) {
            console.log(`error while getting wallet `, error);
        }
    }

    const handleWithdrawRequest = () => {
        setWithdrawModalOpen(true);
    };

    const handleQrCodeChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrCodeImage(file);
            const previewUrl = URL.createObjectURL(file);
            setQrCodePreview(previewUrl);
        }
    };

    const handleWithdrawSubmit = async () => {
        if (!withdrawAmount || !exchange) {
            return notification.error({
                message: "Error",
                description: "Please fill all required fields",
                placement: "topRight",
            });
        };

        if (exchange === "67c1e65de5d59894e5a19435" && !newSelectedBank) {
            return notification.error({
                message: "Error",
                description: "Please Select Bank",
                placement: "topRight",
            });
        };

        if (merchantWallet?.pendingAmount < parseFloat(withdrawAmount)) {
            return notification.error({
                message: "Error",
                description: "Not Enough Balance",
                placement: "topRight",
            });
        };

        if (exchangeData?.label === "USDT" && !qrCodeImage) {
            return notification.error({
                message: "Error",
                description: "Please upload USDT QR code",
                placement: "topRight",
            });
        };

        if (exchangeData?.label === "AED" || exchangeData?.label === "By Cash") {
            if (location === null || name === "" || contactNumber === "" || token === "") {
                return notification.error({
                    message: "Error",
                    description: "Please Fill all Fields",
                    placement: "topRight",
                });
            };
        };

        if (exchangeData?.label === "Portal") {
            if (portal === null || name === "") {
                return notification.error({
                    message: "Error",
                    description: "Please Fill all Fields",
                    placement: "topRight",
                });
            };
        };

        const formData = new FormData();

        formData.append("note", note || "");
        formData.append("exchangeId", exchange);
        formData.append("amountINR", withdrawAmount);
        formData.append("merchantId",  Cookies.get('merchantId'));
        formData.append("amount", ((parseFloat(withdrawAmount) - (parseFloat(exchangeData?.charges) * parseFloat(withdrawAmount)) / 100) / parseFloat(exchangeData?.rate)).toFixed(2));

        // for bank
        if (exchange === "67c1e65de5d59894e5a19435" && newSelectedBank) {
            formData.append("withdrawBankId", newSelectedBank);
        }

        // for USDT
        if (exchangeData?.label === "USDT" && qrCodeImage) {
            formData.append("image", qrCodeImage);
        };

        // for Cash / AED
        if ((exchangeData?.label === "AED" || exchangeData?.label === "By Cash")) {
            formData.append("locationId", location);
            formData.append("customerName", name);
            formData.append("contactNumber", contactNumber);
            formData.append("token", token);
        };

        // for Portal
        if (exchangeData?.label === "Portal") {
            formData.append("portalId", portal);
            formData.append("customerName", name);
        };

        try {
            const token = Cookies.get("merchantToken");
            setDisableButton(true);
            const response = await axios.post(`${BACKEND_URL}/withdraw/create`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response?.status === 200) {
                fn_getWithdraws();
                setCurrentPage(1);
                fn_merchantWallet();
                setDisableButton(false);
                setWithdrawModalOpen(false);
                setLocation(null);
                setName('');
                setContactNumber('');
                setToken('');
                setSelectedPortal(null);
                setQrCodeImage(null);
                notification.success({
                    message: "Success",
                    description: "Withdraw Request Created!",
                    placement: "topRight",
                });
            }
        } catch (error) {
            console.log("error while creating withdraw request ", error);
            setDisableButton(false);
            notification.error({
                message: "Error",
                description: error?.response?.data?.message || "Network Error",
                placement: "topRight",
            });
        }
    };

    const resetAEDFields = () => {
        setLocation(null);
        setName('');
        setContactNumber('');
        setToken('');
    };

    const handleWithdrawModalClose = () => {
        setWithdrawModalOpen(false);
        resetAEDFields();
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
                    description: `Enter ${activeTab === "bank" ? "IFSC Number" : "UPI ID"}`,
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
            setDisableButton(true);
            if (activeTab === "bank") {
                if (data?.image) {
                    formData.append("image", data?.image);
                }
                formData.append("bankName", data?.bankName);
                formData.append("accountNo", data?.accountNo);
                formData.append("accountType", activeTab);
                formData.append("iban", data?.iban);
                formData.append("accountHolderName", data?.accountHolderName);
                formData.append("block", true);
            } else {
                if (!data?.image) return;
                formData.append("image", data?.image);
                formData.append("accountType", activeTab);
                formData.append("iban", data?.iban);
                formData.append("accountHolderName", data?.accountHolderName);
                formData.append("block", true);
            };
            const token = Cookies.get("merchantToken");
            let response;
            if (isEditMode) {
                response = await axios.put(`${BACKEND_URL}/withdrawBank/update/${editAccountId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                response = await axios.post(`${BACKEND_URL}/withdrawBank/create`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            if (response?.status === 200) {
                setOpen(false);
                setDisableButton(false);
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
                fn_getMerchantBanks();
            }
        } catch (error) {
            setDisableButton(false);
            const errorMessage = error?.response?.data?.message || "Network Error";
            notification.error({
                message: "Error",
                description: errorMessage,
                placement: "topRight",
            });
        }
    };

    const handleModeChange = (e) => {
        setActiveTab(e.target.value);
    };

    const handleChange = (value) => {
        setData((prevData) => ({
            ...prevData,
            bankName: value,
        }));
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

    const handleViewTransaction = (transaction) => {
        setUtr("");
        setImage(null);
        setSelectedTransaction(transaction);
        setNewOpen(true);
    };

    const handleModalClose = () => {
        setUtr("");
        setImage(null);
        setNewOpen(false);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        const cleanPath = imagePath.replace('uploads/', '');
        return `${BACKEND_URL}/uploads/${cleanPath}`;
    };

    const fetchBankNames = async () => {
        const response = await fn_getAllBankNames();
        if (response.status) {
            setBankNames(response.data.map(bank => ({
                label: bank.bankName.toUpperCase(),
                value: bank.bankName.toUpperCase()
            })));
        }
    };

    const handleEdit = (account) => {
        setData({
            image: account.image,
            bankName: account.bankName?.toUpperCase(),
            accountNo: account.accountNo,
            iban: account.iban,
            accountHolderName: account.accountHolderName,
        });
        setActiveTab(account.accountType);
        setEditAccountId(account._id);
        setIsEditMode(true);
        setOpen(true);
    };

    useEffect(() => {
        if (open) {
            fetchBankNames();
        }
    }, [open]);

    // Add fetchPortals function
    const fetchPortals = async () => {
        const response = await fn_getAllPortals();
        if (response.status) {
            setPortals(response.data.map(portal => ({
                value: portal._id,
                label: portal.portalName || portal.name
            })));
        }
    };

    return (
        <>
            <div
                style={{ minHeight: `${containerHeight}px` }}
                className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"}`}
            >
                <div className="p-7">
                    <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-4">
                        <h1 className="text-[25px] font-[500]">Withdraw Transactions</h1>
                        <div className="flex flex-col sm:flex-row items-center gap-[20px] w-full sm:w-auto">
                            <div className="text-[12px] w-full sm:w-auto text-center sm:text-left">
                                <p className="text-gray-600">Withdraw Amount:</p>
                                <p className="text-green-500 font-[500]">
                                    <FaIndianRupeeSign className="inline-block mt-[-1px]" />
                                    {merchantWallet?.approvedWithdraw || 0}
                                </p>
                            </div>
                            <div className="text-[12px] w-full sm:w-auto text-center sm:text-left">
                                <p className="text-gray-600">Pending Withdrawal:</p>
                                <p className="text-yellow-500 font-[500]">
                                    <FaIndianRupeeSign className="inline-block mt-[-1px]" />
                                    {merchantWallet?.withdrawAmounts || 0}
                                </p>
                            </div>
                            <div className="text-[12px] w-full sm:w-auto text-center sm:text-left">
                                <p className="text-gray-600">Available Amount:</p>
                                <p className="text-blue-600 font-[500]">
                                    <FaIndianRupeeSign className="inline-block mt-[-1px]" />
                                    {merchantWallet?.pendingAmount ? merchantWallet.pendingAmount.toFixed(2) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between pb-3">
                            <div>
                                <p className="text-black font-medium text-lg mb-3 md:mb-0">
                                    List of withdraw Transactions
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-[10px]">
                                <Button
                                    type="primary"
                                    onClick={handleAddAccount}
                                    className="w-full sm:w-auto"
                                >
                                    Add Bank Account
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleWithdrawRequest}
                                    className="w-full sm:w-auto"
                                >
                                    Create Withdraw Request
                                </Button>
                            </div>
                        </div>
                        <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead>
                                    <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                                        <th className="p-4 text-nowrap">Sr No.</th>
                                        <th className="p-4">DATE</th>
                                        <th className="p-4 text-nowrap">Amount</th>
                                        <th className="p-4 text-nowrap">Withdraw Amount</th>
                                        <th className="p-4 text-nowrap">Exchange</th>
                                        <th className="p-4 text-nowrap">UTR</th>
                                        <th className="pl-8">Status</th>
                                        <th className="">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading ? transactions?.length > 0 ? transactions?.map((transaction, index) => (
                                        <tr key={transaction?._id} className="text-gray-800 text-sm border-b">
                                            <td className="p-4 text-[13px] font-[600] text-[#000000B2]">{index + 1}</td>
                                            <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                                                {moment.utc(transaction?.createdAt).format('DD MMM YYYY, hh:mm A')}
                                            </td>
                                            <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                                                {/* {transaction?.amountINR} {transaction?.exchangeId?._id === "67c1cb2ffd672c91b4a769b2" ? "INR" : transaction?.exchangeId?._id === "67c1e65de5d59894e5a19435" ? "INR" : transaction?.exchangeId?.currency} */}
                                                {transaction?.amountINR} INR
                                            </td>
                                            <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">{transaction?.amount} {transaction?.exchangeId?._id === "67c1cb2ffd672c91b4a769b2" ? "INR" : transaction?.exchangeId?._id === "67c1e65de5d59894e5a19435" ? "INR" : transaction?.exchangeId?.currency}</td>
                                            <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">{transaction?.exchangeId?.currency}</td>
                                            <td className="p-4 text-[13px] font-[700] text-[#000000B2]">{(transaction?.utr && transaction?.utr !== "") ? transaction?.utr : "-"}</td>
                                            <td className="relative p-4 text-[13px] font-[500] flex items-center gap-[10px]">
                                                <span className={`relative px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] w-20 flex items-center justify-center ${transaction?.status === "Decline" ? "bg-[#FF7A8F33] text-[#FF002A]" : transaction?.status === "Pending" ? "bg-[#FFC70126] text-[#FFB800]" : "bg-[#10CB0026] text-[#0DA000]"}`}>
                                                    {transaction?.status}
                                                </span>
                                                {transaction?.createdBy === "admin" && (
                                                    <p className="absolute bottom-[-2px] left-[20px] text-[10px] text-gray-600">Created by Admin</p>
                                                )}
                                            </td>
                                            <td >
                                                <button
                                                    onClick={() => handleViewTransaction(transaction)}
                                                    className="bg-blue-100 text-blue-600 rounded-full px-2 py-2 mx-2"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="text-center w-full text-gray-600 italic py-[15px] text-[14px] font-[500]"><FaExclamationCircle className="inline-block text-[20px] mt-[-4px] me-[7px]" />No Transaction Found</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="text-center w-full text-gray-600 italic py-[15px] text-[14px] font-[500]">Loading...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex justify-end">
                                <Pagination
                                    onChange={(e) => setCurrentPage(e)}
                                    className="self-center md:self-end mt-[15px]"
                                    defaultCurrent={1}
                                    total={totalPages * 10}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Withdraw Request Modal */}
            <Modal
                width={600}
                title="Withdraw Request"
                open={withdrawModalOpen}
                onOk={handleWithdrawSubmit}
                onCancel={handleWithdrawModalClose}
                okText="Submit"
                cancelText="Cancel"
                confirmLoading={disableButton}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <Input
                            prefix={<FaIndianRupeeSign />}
                            type="number"
                            placeholder="Enter amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-gray-500 text-[13px] font-[500]">
                            Available for Withdraw: <span className="text-green-500">
                                {merchantWallet?.pendingAmount ? merchantWallet.pendingAmount.toFixed(2) : 0} INR
                            </span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exchange
                        </label>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Select Exchange"
                            value={exchange}
                            onChange={(e) => {setExchange(e); fetchLocations(e)}}
                            options={exchanges}
                        />
                        {exchangeData?.label === "By Cash" && (
                            <p className="text-[10px] text-red-600 font-[500]">Note: Only in Dehli</p>
                        )}
                    </div>

                    {exchange && (
                        <div>
                            <p className="text-[12px] font-[500] flex items-center"><span className="text-gray-400 w-[150px] block">Exchange Rate:</span>{" "}1 {exchangeData?.label} = {exchangeData?.rate} INR</p>
                            <p className="text-[12px] font-[500] flex items-center"><span className="text-gray-400 w-[150px] block">Exchange Charges:</span>{" "}{exchangeData?.charges}%</p>
                            <p className="text-[13px] font-[500] flex items-center text-green-500">
                                <span className="text-gray-500 w-[150px] block">Withdrawal Amount:</span>
                                {" "}
                                {((parseFloat(withdrawAmount) - (parseFloat(exchangeData?.charges) * parseFloat(withdrawAmount)) / 100) / parseFloat(exchangeData?.rate)).toFixed(2)}
                                {" "}
                                {exchangeData?.label === "Bank/UPI" ? "INR" : exchangeData?.label === "By Cash" ? "INR" : exchangeData?.label}
                            </p>
                        </div>
                    )}

                    {exchange === "67c1e65de5d59894e5a19435" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Bank
                            </label>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Select Your Bank"
                                onChange={(value) => setNewSelectedBank(value)}
                                value={newSelectedBank}
                                options={banks}
                                loading={!banks.length}
                                showSearch
                                filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </div>
                    )}

                    {exchangeData?.label === "USDT" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload QR Code
                            </label>
                            <input
                                type="file"
                                onChange={handleQrCodeChange}
                                accept="image/*"
                                className="mb-2"
                            />
                            {qrCodePreview && (
                                <div className="mt-2">
                                    <p className="text-gray-600 text-[12px] font-[600] mb-1">QR Code Preview:</p>
                                    <img
                                        src={qrCodePreview}
                                        alt="QR Code Preview"
                                        className="max-w-[200px] h-auto rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {(exchangeData?.label === "AED" || exchangeData?.label === "By Cash") && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Location
                                </label>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Location"
                                    value={location}
                                    onChange={(value) => setLocation(value)}
                                    options={locations}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <Input
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <PhoneInput
                                    country={'in'}
                                    value={contactNumber}
                                    onChange={phone => setContactNumber(phone)}
                                    inputStyle={{ width: '100%', height: '32px' }}
                                    containerStyle={{ width: '100%' }}
                                    inputProps={{
                                        name: 'phone',
                                        required: true,
                                        autoFocus: true
                                    }}
                                    enableSearch={true}
                                    searchPlaceholder="Search country..."
                                    searchNotFound="Country not found"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                                <ReactQuill
                                    value={token}
                                    onChange={setToken}
                                    theme="snow"
                                />
                            </div>
                        </div>
                    )}

                    {exchange === "67c20f130213c2d397da36c9" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Portal Name
                                </label>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select Portal Name"
                                    value={portal}
                                    onChange={(value) => setPortal(value)}
                                    options={portals}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User Name
                                </label>
                                <Input
                                    placeholder="Enter username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                        </label>
                        <TextArea
                            placeholder="Write anything about Transaction"
                            autoSize={{ minRows: 4, maxRows: 8 }}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Add bank modal */}
            <Modal
                centered
                width={600}
                style={{ fontFamily: "sans-serif" }}
                confirmLoading={disableButton}
                title={
                    <p className="text-[16px] font-[700]">
                        {isEditMode ? "Edit Your Bank Account" : "Add New Bank Account"}
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
                <>
                    <Radio.Group
                        onChange={handleModeChange}
                        value={activeTab}
                        style={{ marginBottom: 8, marginTop: 8 }}
                    >
                        <Radio.Button style={{ width: "100px", textAlign: "center" }} value="bank">Bank</Radio.Button>
                        <Radio.Button style={{ width: "100px", textAlign: "center" }} value="upi">UPI</Radio.Button>
                    </Radio.Group>
                    {activeTab === "bank" && (
                        <>
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
                                        onChange={handleChange}
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
                </>
            </Modal>

            {/* view withdraw */}
            <Modal
                title="Transaction Details"
                open={newOpen}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                width={selectedTransaction?.status === "Pending" || selectedTransaction?.status === "Decline" || (selectedTransaction?.status === "Approved" && !selectedTransaction?.utr) ? 600 : 900}
                style={{ fontFamily: "sans-serif" }}
                footer={null}
            >
                {selectedTransaction && (
                    <div className="flex justify-between gap-4">
                        <div className={`${(selectedTransaction.status === "Pending" ||
                            (selectedTransaction.status === "Approved" && !selectedTransaction.utr)) ? "w-full" : "w-[450px]"}`}>
                            <div className="flex flex-col gap-2 mt-3">
                                <p className="text-[12px] font-[500] text-gray-600 mt-[-18px]">Request Creation Time: <span className="font-[600]">{moment.utc(selectedTransaction?.createdAt).format('DD MMM YYYY, hh:mm A')}</span></p>
                                {/* Merchant Name */}
                                <div className="flex items-center gap-4 mt-[10px]">
                                    <p className="text-[12px] font-[600] w-[200px]">Merchant Name:</p>
                                    <Input
                                        className="text-[12px] bg-gray-200"
                                        readOnly
                                        value={selectedTransaction?.merchantId?.merchantName || 'N/A'}
                                    />
                                </div>

                                {/* Exchange */}
                                <div className="flex items-center gap-4">
                                    <p className="text-[12px] font-[600] w-[200px]">Exchange:</p>
                                    <Input
                                        className="text-[12px] bg-gray-200"
                                        readOnly
                                        value={selectedTransaction?.exchangeId?.currency || 'N/A'}
                                    />
                                </div>

                                {/* Withdrawal Amount */}
                                <div className="flex items-center gap-4">
                                    <p className="text-[12px] font-[600] w-[200px]">Withdrawal Amount:</p>
                                    <Input
                                        className="text-[12px] bg-gray-200"
                                        readOnly
                                        value={`${selectedTransaction?.amount} ${selectedTransaction?.exchangeId?._id === "67c1cb2ffd672c91b4a769b2" ? "INR" : selectedTransaction?.exchangeId?._id === "67c1e65de5d59894e5a19435" ? "INR" : selectedTransaction?.exchangeId?.currency}`}
                                    />
                                </div>

                                {/* Portal Specific Fields */}
                                {selectedTransaction?.exchangeId?._id === "67c20f130213c2d397da36c9" && (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <p className="font-[600] text-[14px] mb-2">Portal Details</p>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Exchange Rate:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`1 ${selectedTransaction?.exchangeId?.currency} = ${selectedTransaction?.exchangeId?.currencyRate} INR`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Exchange Charges:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`${selectedTransaction?.exchangeId?.charges}%`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Amount in INR:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`${selectedTransaction?.amountINR} INR`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Portal Name:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.portalId?.portalName || selectedTransaction?.portalId?.name || 'N/A'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">User Name:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.customerName || 'N/A'}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* AED Specific Fields */}
                                {(selectedTransaction?.exchangeId?.currency === "AED" || selectedTransaction?.exchangeId?.currency === "By Cash") && (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <p className="font-[600] text-[14px] mb-2">{selectedTransaction?.exchangeId?.currency} Details</p>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Exchange Rate:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`1 ${selectedTransaction?.exchangeId?.currency} = ${selectedTransaction?.exchangeId?.currencyRate} INR`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Exchange Charges:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`${selectedTransaction?.exchangeId?.charges}%`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Amount in INR:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={`${selectedTransaction?.amountINR} INR`}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Location:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.locationId?.location || 'N/A'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Customer Name:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.customerName || 'N/A'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Contact Number:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.contactNumber || 'N/A'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Token:</p>
                                            <div 
                                                className="text-[12px] bg-gray-200 p-2 rounded w-full"
                                                dangerouslySetInnerHTML={{ __html: selectedTransaction?.token || 'N/A' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Bank Details Section */}
                                {selectedTransaction?.withdrawBankId && (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <p className="font-[600] text-[14px] mb-2">Bank Details</p>

                                        <div className="flex items-center gap-4">
                                            <p className="text-[12px] font-[600] w-[200px]">Bank Name:</p>
                                            <Input
                                                className="text-[12px] bg-gray-200"
                                                readOnly
                                                value={selectedTransaction?.withdrawBankId?.bankName || 'N/A'}
                                            />
                                        </div>
                                        {selectedTransaction?.withdrawBankId?.bankName !== "UPI" && (
                                            <div className="flex items-center gap-4">
                                                <p className="text-[12px] font-[600] w-[200px]">Account Title:</p>
                                                <Input
                                                    className="text-[12px] bg-gray-200"
                                                    readOnly
                                                    value={selectedTransaction?.withdrawBankId?.accountHolderName || 'N/A'}
                                                />
                                            </div>
                                        )}

                                        {selectedTransaction?.withdrawBankId?.accountType === "bank" ? (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[12px] font-[600] w-[200px]">IFSC Code:</p>
                                                    <Input
                                                        className="text-[12px] bg-gray-200"
                                                        readOnly
                                                        value={selectedTransaction?.withdrawBankId?.iban || 'N/A'}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[12px] font-[600] w-[200px]">Account Number:</p>
                                                    <Input
                                                        className="text-[12px] bg-gray-200"
                                                        readOnly
                                                        value={selectedTransaction?.withdrawBankId?.accountNo || 'N/A'}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <p className="text-[12px] font-[600] w-[200px]">UPI ID:</p>
                                                <Input
                                                    className="text-[12px] bg-gray-200"
                                                    readOnly
                                                    value={selectedTransaction?.withdrawBankId?.iban || 'N/A'}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {selectedTransaction?.exchangeId?._id === "67c1caa1fd672c91b4a7679f" && (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <p className="font-[600] text-[14px] mb-2">QR Code</p>

                                        <img
                                            src={`${BACKEND_URL}/${selectedTransaction?.image}`}
                                            alt="QR Code"
                                            width={200}
                                        />
                                    </>
                                )}

                                {/* Note Section */}
                                <div className="border-t mt-2 mb-1"></div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-[12px] font-[600]">Note From Merchant:</p>
                                    <textarea
                                        className="w-full p-2 text-[12px] border rounded resize-none outline-none"
                                        rows={3}
                                        readOnly
                                        value={selectedTransaction?.note || 'N/A'}
                                    />
                                </div>
                                {(selectedTransaction.status === "Decline" || (selectedTransaction.status === "Approved" && !selectedTransaction.utr)) ? (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <div>
                                            <div className={`w-[100px] px-3 py-2 rounded-[20px] text-center text-[13px] font-[600] ${selectedTransaction.status === "Decline" ?
                                                "bg-[#FF7A8F33] text-[#FF002A]" :
                                                "bg-[#10CB0026] text-[#0DA000]"
                                                }`}>
                                                {selectedTransaction.status}
                                            </div>
                                        </div>
                                    </>
                                ) : selectedTransaction.status === "Pending" && (
                                    <>
                                        <div className="border-t mt-2 mb-1"></div>
                                        <div>
                                            <div className={`w-[100px] px-3 py-2 rounded-[20px] text-center text-[13px] font-[600] bg-[#FFC70126] text-[#FFB800]`}>
                                                Pending
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Only show for Approved with UTR */}
                        {selectedTransaction.status !== "Pending" &&
                            selectedTransaction.status !== "Decline" &&
                            selectedTransaction.utr && (
                                <div className="w-[350px] border-l pl-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Proof Image */}
                                        {selectedTransaction.image && (
                                            <div>
                                                <p className="text-[14px] font-[600] mb-2">Payment Proof</p>
                                                <div className="max-h-[400px] overflow-auto">
                                                    <img
                                                        src={getImageUrl(selectedTransaction.image)}
                                                        alt="Payment Proof"
                                                        className="w-full object-contain cursor-pointer"
                                                        style={{ maxHeight: '400px' }}
                                                        onClick={() => window.open(getImageUrl(selectedTransaction.image), '_blank')}
                                                        onError={(e) => {
                                                            console.error('Image load error:', e);
                                                            e.target.src = 'fallback-image-url';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* UTR Details */}
                                        <div>
                                            <p className="text-[14px] font-[600] mb-2">UTR Number</p>
                                            <Input
                                                className="text-[12px] bg-gray-100"
                                                readOnly
                                                value={selectedTransaction.utr}
                                            />
                                        </div>

                                        {/* Current Status */}
                                        <div>
                                            <div className="px-3 w-[100px] py-2 rounded-[20px] text-center text-[13px] font-[600] bg-[#10CB0026] text-[#0DA000]">
                                                {selectedTransaction.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Withdraw;
