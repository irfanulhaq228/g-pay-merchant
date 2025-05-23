import { Bar } from "react-chartjs-2";
import { GoDotFill } from "react-icons/go";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCircleExclamation } from "react-icons/fa6";
import { Modal, Button, Input, notification, Space, DatePicker } from "antd";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, } from "chart.js";
import { fn_getAllMerchantApi, fn_getAllTransactionApi, fn_getCardDataByStatus, } from "../../api/api";

const Home = ({ setSelectedPage, authorization, showSidebar, loginType, permissionsData }) => {
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const [total, setTotal] = useState(0);
  const [total2, setTotal2] = useState(0);
  const [total3, setTotal3] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const containerHeight = window.innerHeight - 105;
  const [adminCharges, setAdminCharges] = useState("")
  const [transactions, setTransactions] = useState([]);
  const [merchantTotal, setMerchantTotal] = useState(0);
  const [generatedLink, setGeneratedLink] = useState("");
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [showLinkField, setShowLinkField] = useState(false);
  const [totalTransaction, setTotalTransactions] = useState(0);
  const [declineTransactions, setDeclineTransactions] = useState(0);
  const [verifiedTransactions, setVerifiedTransactions] = useState(0);
  const [unverifiedTransactions, setUnverifiedTransactions] = useState(0);
  const [transactionData, setTransactionData] = useState({ amount: "", username: "", });
  const [availableWithdraw, setAvailableWithdraw] = useState(0);

  // const totalHeight = window.innerHeight - (56+112+20+28+50);
  const totalHeight = window.innerHeight - 366;


  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
    }
    setSelectedPage("dashboard");
    fetchAllData();
  }, [authorization, navigate, setSelectedPage]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let startDate = null;
      let endDate = null;

      if (dateRange?.[0] && dateRange?.[1]) {
        // Convert moment objects to Date objects and set time
        const startDateObj = dateRange[0].startOf('day').toDate();
        const endDateObj = dateRange[1].endOf('day').toDate();

        // Format to ISO string
        startDate = startDateObj.toISOString();
        endDate = endDateObj.toISOString();

        console.log('Formatted dates:', {
          startDate,
          endDate,
          rawDateRange: dateRange
        });
      }

      const formattedDateRange = startDate && endDate ? { startDate, endDate } : null;

      const [
        approvedData,
        pendingData,
        declineData,
        totalData,
        merchantData,
      ] = await Promise.all([
        fn_getCardDataByStatus('Approved', activeFilter, dateRange),
        fn_getCardDataByStatus('Pending', activeFilter, dateRange),
        fn_getCardDataByStatus('Decline', activeFilter, dateRange),
        fn_getAllTransactionApi(),
        fn_getAllMerchantApi(null, 1, null, null, null, null, dateRange),
      ]);

      console.log('API Responses:', {
        approvedData,
        pendingData,
        declineData,
        totalData,
        merchantData
      });

      setVerifiedTransactions(approvedData?.data?.data || 0);
      setAdminCharges(approvedData?.data?.adminTotalSum || 0);
      setTotalTransactions(approvedData?.data?.totalTransaction || 0);
      setUnverifiedTransactions(pendingData?.data?.data || 0);
      setDeclineTransactions(declineData?.data?.data || 0);
      setTotal(approvedData?.data?.totalTransaction || 0);
      setTotal2(pendingData?.data?.totalTransaction || 0);
      setTotal3(declineData?.data?.totalTransaction || 0);
      setMerchantTotal(approvedData?.data?.merchantTotalSum || 0);
      setAvailableWithdraw(approvedData?.data?.availableWithdraw)

      if (merchantData?.status && merchantData?.data?.data) {
        const recentTransactions = merchantData.data.data.slice(0, 10);
        setTransactions(recentTransactions);
      } else {
        setTransactions([]);
        setError(merchantData?.message || "No transactions found");
      }

    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Unable to fetch transactions.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorization && dateRange) {
      console.log("Fetching data with date range:", dateRange);
      fetchAllData();
    }
  }, [dateRange, authorization]);

  const resetFilters = () => {
    setDateRange([null, null]);
    setActiveFilter('all');
    fetchAllData();
  };

  const handleFilterClick = async (filterType) => {
    setActiveFilter(filterType);
    setDateRange([null, null]);
    try {
      setLoading(true);
      const [
        approvedData,
        pendingData,
        declineData,
        totalData,
        merchantData,
      ] = await Promise.all([
        fn_getCardDataByStatus('Approved', filterType, null),
        fn_getCardDataByStatus('Pending', filterType, null),
        fn_getCardDataByStatus('Decline', filterType, null),
        fn_getAllTransactionApi(),
        fn_getAllMerchantApi(null, 1, null, null, null, null, null),
      ]);

      setVerifiedTransactions(approvedData?.data?.data || 0);
      setAdminCharges(approvedData?.data?.adminTotalSum || 0);
      setTotalTransactions(approvedData?.data?.totalTransaction || 0);
      setUnverifiedTransactions(pendingData?.data?.data || 0);
      setDeclineTransactions(declineData?.data?.data || 0);
      setTotal(approvedData?.data?.totalTransaction || 0);
      setTotal2(pendingData?.data?.totalTransaction || 0);
      setTotal3(declineData?.data?.totalTransaction || 0);
      setMerchantTotal(approvedData?.data?.merchantTotalSum || 0);

      if (merchantData?.status && merchantData?.data?.data) {
        const recentTransactions = merchantData.data.data.slice(0, 5);
        setTransactions(recentTransactions);
      } else {
        setTransactions([]);
        setError(merchantData?.message || "No transactions found");
      }

    } catch (err) {
      console.error("Error fetching filtered data:", err);
      setError("Unable to fetch filtered data.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      if (!transactionData.amount) {
        return notification.error({
          message: "Error",
          description: "Please enter amount",
          placement: "topRight",
        });
      }
      if (!transactionData.username) {
        return notification.error({
          message: "Error",
          description: "Please enter username",
          placement: "topRight",
        });
      }

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/payment?amount=${transactionData.amount}&username=${transactionData.username}`;
      setGeneratedLink(link);
      setShowLinkField(true);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to create transaction",
        placement: "topRight",
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    notification.success({
      message: "Success",
      description: "Link copied to clipboard!",
      placement: "topRight",
    });
  };

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Payment Link",
          text: "Here is your payment link",
          url: generatedLink,
        });
      } else {
        notification.info({
          message: "Info",
          description: "Web Share API is not supported in your browser",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Approved",
        data: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ],
        backgroundColor: "#009666",
      },
      {
        label: "Manual Varified",
        data: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ],
        backgroundColor: "#0C67E9",
      },
      {
        label: "Pending",
        data: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ],
        backgroundColor: "#F67A03",
      },
      {
        label: "Faild",
        data: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ],
        backgroundColor: "#FF3E5E",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    datasets: {
      bar: {
        barPercentage: 0.6,
        categoryPercentage: 0.9,
      },
    },
  };

  const handleDateRangeChange = (dates) => {
    console.log('Date range changed:', dates);
    if (!dates || !dates[0]) {
      setDateRange([null, null]);
      resetFilters();
    } else {
      setDateRange(dates);
      setActiveFilter('custom');
    }
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-5">
          <h1 className="text-[25px] font-[500]">Merchant Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="grid grid-cols-2 sm:flex gap-2 text-[12px]">
              <button
                onClick={() => handleFilterClick('all')}
                className={`${activeFilter === 'all' ? 'text-white bg-[#0864E8]' : 'text-black'} 
                border w-[120px] sm:w-[70px] p-2 sm:p-1.5 rounded`}>
                ALL
              </button>
              <button
                onClick={() => handleFilterClick('today')}
                className={`${activeFilter === 'today' ? 'text-white bg-[#0864E8]' : 'text-black'} 
                border w-[120px] sm:w-[70px] p-2 sm:p-1 rounded`}>
                TODAY
              </button>
              <button
                onClick={() => handleFilterClick('7days')}
                className={`${activeFilter === '7days' ? 'text-white bg-[#0864E8]' : 'text-black'} 
                border w-[120px] sm:w-[70px] p-2 sm:p-1 rounded`}>
                7 DAYS
              </button>
              <button
                onClick={() => handleFilterClick('30days')}
                className={`${activeFilter === '30days' ? 'text-white bg-[#0864E8]' : 'text-black'} 
                border w-[120px] sm:w-[70px] p-2 sm:p-1 rounded`}>
                30 DAYS
              </button>
            </div>
            {/* Date Range Picker */}
            <Space direction="vertical" size={10} className="w-full sm:w-auto">
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                className="bg-gray-100 w-full sm:w-auto"
              />
            </Space>
          </div>
        </div>

        {/* Boxes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 text-nowrap">
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{ backgroundImage: "linear-gradient(to right, rgba(0, 150, 102, 1), rgba(59, 221, 169, 1))" }}
          >
            <h2 className="text-[13px] uppercase font-[500]">AVAILABLE BALANCE</h2>
            <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(availableWithdraw).toFixed(2)}</p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              Approved Transactions: <span className="font-[700]">₹ {verifiedTransactions}</span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{ backgroundImage: "linear-gradient(to right, rgba(245, 118, 0, 1), rgba(255, 196, 44, 1))" }}
          >
            <h2 className="text-[13px] uppercase font-[500]">PENDING TRANSACTIONS</h2>
            <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(unverifiedTransactions).toFixed(2)}</p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Transactions: <span className="font-[700]">{total2}</span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{ backgroundImage: "linear-gradient(to right, rgba(255, 61, 92, 1), rgba(255, 122, 143, 1))" }}
          >
            <h2 className="text-[13px] uppercase font-[500]">FAILED TRANSACTIONS</h2>
            <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(declineTransactions).toFixed(2)}</p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Transactions: <span className="font-[700]">{total3}</span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{ backgroundImage: "linear-gradient(to right, rgba(148, 0, 211, 1), rgba(186, 85, 211, 1))" }}

          >
            <h2 className="text-[13px] uppercase font-[500]">CHARGES</h2>
            <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(adminCharges).toFixed(2)}</p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Transactions: <span className="font-[700]">{totalTransaction}</span>
            </p>
          </div>
        </div>

        {/* Graph and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Graph Section */}
          <div className="col-span-2 bg-white p-6 mb-4 md:mb-0 md:mr-4 rounded shadow flex-1 h-[100%]">
            <div className="w-full">
              <div className="justify-between items-center mb-4">
                <h2 className="text-[16px] font-[700]">TRANSACTION STATS</h2>
                <p className="text-[11px] font-[500] text-gray-500 mt-1">
                  Order status and tracking. Track your order from ship date to
                  arrival.To begin, enter your order number.
                </p>
                <div className="grid grid-cols-2 gap-4 md:flex md:gap-12 mt-3">
                  <Stat
                    label="System Approved"
                    value={verifiedTransactions}
                    color="#029868"
                  />
                  <Stat
                    label="Declined"
                    value={declineTransactions}
                    color="#FF3E5E"
                  />
                  <Stat
                    label="Pending"
                    value={unverifiedTransactions}
                    color="#F67A03"
                  />
                </div>
              </div>
              <div className="w-full h-[300px]">
                <Bar data={data} options={options} />
              </div>
            </div>
          </div>
          {/* Recent Transactions Section */}
          <div className="bg-white p-6 rounded shadow w-full flex-1 overflow-auto" style={{minHeight: `${totalHeight}px`, maxHeight: `${totalHeight}px`}}>
            <h2 className="text-[16px] font-[700]">RECENT TRANSACTIONS</h2>
            <p className="text-[11px] font-[500] text-gray-500 pt-1">
              Customer is an individual or business that purchases the goods or
              services, and the process has evolved to include real-time
              tracking.
            </p>
            {(loginType === "merchant" ||
              (loginType === "staff" && permissionsData?.merchantProfile)) && (
                <>
                  {loading ? (
                                  <p className="text-center py-4">Loading...</p>

                  ) : error ? (
                    <div className="flex items-center space-x-2 mt-2 text-gray-500">
                      <FaCircleExclamation className="text-gray-500" />
                      <p>{error}</p>
                    </div>
                  ) : (
                    <div>
                      {transactions && transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                          <RecentTransaction
                            key={index}
                            name={transaction?.bankId?.bankName || "UPI"}
                            utrId={transaction?.utr}
                            status={transaction?.status}
                            amount={`₹${transaction?.amount}`}
                          />
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500">
                        No recent transactions
                      </p>
                      )}
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Boxes = ({ number, amount, title, bgColor, link }) => (
  <Link
    to={link}
    className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
    style={{ backgroundImage: bgColor }}
  >
    <h2 className="text-[13px] uppercase font-[500]">{title}</h2>
    <p className="mt-[13px] text-[20px] font-[700]">₹ {number}</p>
    <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
      Amount: <span className="font-[700]">₹ {amount}</span>
    </p>
  </Link>
);

const Stat = ({ label, value, color }) => (
  <div>
    <p className="text-[15px] font-[700]">₹ {value}</p>
    <div className="flex pt-1 gap-1 items-center">
      <GoDotFill style={{ color }} />
      <p className="text-[12px] font-[500]">{label}</p>
    </div>
  </div>
);

const RecentTransaction = ({ name, utrId, status, color, amount }) => {
  const statusColor = {
    Approved: "#029868",
    Decline: "#FF3F5E",
    Pending: "#F67A03",
  };

  return (
    <div className="flex justify-between items-center py-3 border-b">
      {/* Left Section */}
      <div>
        <p className="text-[15px] font-[600]">{name}</p>
        <div className="flex items-center gap-2 text-[10px] pt-1 text-[#7987A1] font-[600]">
          {/* UTR ID label */}
          <span>UTR ID:</span>
          {/* UTR ID value */}
          <span>{utrId}</span>
          {/* Status with dynamic color */}
          <span
            className="text-[10px] font-[600]"
            style={{ color: statusColor[status] || color }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div>
        <p className="text-[16px] font-[600]">{amount}</p>
      </div>
    </div>
  );
};

export default Home;
