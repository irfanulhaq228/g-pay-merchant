import 'jspdf-autotable';
import axios from "axios";
import jsPDF from 'jspdf';
import { Button } from "antd";
import moment from 'moment-timezone';
import { FiEye } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck, FaIndianRupeeSign } from "react-icons/fa6";
import { Pagination, Modal, Input, notification, DatePicker, Space, Select } from "antd";
import BACKEND_URL, { fn_deleteTransactionApi, fn_getAllDirectPaymentApi, fn_updateTransactionStatusApi, fn_getAllBanksData2 } from "../../api/api";
// import { io } from "socket.io-client";


const DirectPaymentPage = ({ setSelectedPage, authorization, showSidebar, permissionsData, loginType }) => {

  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // const socket = io(`${BACKEND_URL}/payment`);

  const { RangePicker } = DatePicker;
  const [open, setOpen] = useState(false);
  const status = searchParams.get("status");
  const [isEdit, setIsEdit] = useState(false);
  const [merchant, setMerchant] = useState(loginType === "minor" ? "Points Pending" : "");
  const [totalPages, setTotalPages] = useState(1);
  const containerHeight = window.innerHeight - 120;
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedTrns, setSelectedTrns] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [reasonForDecline, setReasonForDecline] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTrnId, setSearchTrnId] = useState("");
  const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.directPayment?.edit : true;
  const [allBanks, setAllBanks] = useState([]);
  const [selectedFilteredBank, setSelectedFilteredBank] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });


  // useEffect(() => {
  //   socket.on("getMerchantLedger", (data) => {

  //     console.log("data ", data);
  //     fetchTransactions(currentPage || 1, merchant);
  //   });


  //   socket.on("error", (error) => {
  //     console.error("Socket Error:", error.message);
  //   });

  // }, []);


  const fetchTransactions = async (pageNumber) => {
    try {
      const formattedStartDate = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : '';
      const formattedEndDate = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : '';

      const result = await fn_getAllDirectPaymentApi(
        status || null,
        pageNumber,
        merchant,
        searchQuery,
        searchTrnId,
        selectedFilteredBank || null,  // Pass null if no bank selected
        formattedStartDate && formattedEndDate ? [formattedStartDate, formattedEndDate] : null
      );
      if (result?.status) {
        if (result?.data?.status === "ok") {
          console.log('Received transactions:', result?.data?.data); // Debug log
          setTransactions(result?.data?.data);
          setTotalPages(result?.data?.totalPages);
        } else {
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTransactions([]);
    }
  };

  const fetchBanks = async () => {
    try {
      const result = await fn_getAllBanksData2();
      console.log('Received banks:', result)
      if (result?.status) {
        setAllBanks(result?.data?.data?.map((item) => {
          return {
            value: item._id,
            label: item.bankName === "UPI" ? `UPI - ${item.iban}` : item.bankName,
          };
        })
        );
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
      return;
    }
    setSelectedPage("direct-payment");

  }, []);


  useEffect(() => {
    fetchTransactions(currentPage);
    fetchBanks();

  }, [currentPage, merchant, searchQuery, searchTrnId, dateRange, selectedFilteredBank]);

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleTransactionAction = async (action, transactionId) => {
    const response = await fn_updateTransactionStatusApi(transactionId, {
      status: action,
    });
    if (response.status) {
      fetchTransactions(currentPage);
      notification.success({
        message: "Success",
        description: "Transaction Updated!",
        placement: "topRight",
      });
      setIsEdit(false);
      setOpen(false);
    } else {
      setIsEdit(false);
      console.error(`Failed to ${action} transaction:`, response.message);
    }
  };

  const handleEditTransactionAction = async (status, id, amount, utr) => {
    const response = await fn_updateTransactionStatusApi(id, {
      status: status,
      total: parseInt(amount),
      utr: utr,
    });
    if (response.status) {
      fetchTransactions(currentPage);
      notification.success({
        message: "Success",
        description: "Transaction Updated!",
        placement: "topRight",
      });
      setOpen(false);
      setIsEdit(false);
    } else {
      setIsEdit(false);
      console.error(`Failed to ${action} transaction:`, response.message);
    }
  };

  const fn_deleteTransaction = async (id) => {
    const response = await fn_deleteTransactionApi(id);
    if (response?.status) {
      notification.success({
        message: "Success",
        description: "Transaction Deleted!",
        placement: "topRight",
      });
      fetchTransactions(currentPage);
    }
  };

  const fn_checkPoints = async (item) => {
    console.log("item ", item);
    const data = {
      merchantId: item?.merchantId,
      ledgerId: item?._id
    };
    const response = await axios.post(`${BACKEND_URL}/approval/create`, data);
    if (response?.data?.status === "ok") {
      fetchTransactions(currentPage);
      notification.success({
        message: "Updated Successfully",
        description: "Added to Approval Points Table",
        placement: "topRight",
      });
    } else {
      notification.error({
        message: "Failed",
        description: "Failed to add to Approval Points Table",
        placement: "topRight",
      });
    };
  };

  const fn_declinePoints = async (item) => {
    const response = await fn_updateTransactionStatusApi(item?._id, { reason: reasonForDecline, trnStatus: "Points Decline" });
    if (response?.data?.status === "ok") {
      fetchTransactions(currentPage);
      notification.success({
        message: "Updated Successfully",
        description: "Transaction Updated",
        placement: "topRight",
      });
    } else {
      notification.error({
        message: "Failed",
        description: "Failed",
        placement: "topRight",
      });
    };
  };

  const downloadPDF = async () => {
    try {
      notification.info({
        message: "Generating PDF",
        description: "Fetching transactions...",
        duration: 3
      });

      // Format dates correctly
      const formattedStartDate = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : null;
      const formattedEndDate = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : null;

      const allTransactions = [];
      let page = 1;
      let hasMore = true;

      // Create separate query parameters for the API call
      const queryParams = {
        status: status || null,
        page: page,
        merchant: merchant,
        searchQuery: searchQuery,
        searchTrnId: searchTrnId,
        bankId: selectedFilteredBank || null,
        dateRange: formattedStartDate && formattedEndDate ? [formattedStartDate, formattedEndDate] : null
      };

      while (hasMore) {
        try {
          const result = await fn_getAllDirectPaymentApi(
            queryParams.status,
            queryParams.page,
            queryParams.merchant,
            queryParams.searchQuery,
            queryParams.searchTrnId,
            queryParams.bankId,
            queryParams.dateRange
          );

          if (result?.status && result?.data?.status === "ok" && result.data.data.length > 0) {
            allTransactions.push(...result.data.data);

            if (result.data.data.length < 10) {
              hasMore = false;
            }
            page++;
            queryParams.page = page;
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error("Error fetching page:", error);
          hasMore = false;
        }
      }

      if (allTransactions.length === 0) {
        notification.warning({
          message: "No Data",
          description: "No transactions found to generate PDF",
          placement: "topRight"
        });
        return;
      }

      // Create PDF
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;

      // Add title and date centered
      doc.setFontSize(16);
      doc.text('Direct Payment Transactions Report', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 25, { align: 'center' });

      // Define columns
      const columns = [
        { header: 'TRN-ID', dataKey: 'trnNo', width: 20 },
        { header: 'Date', dataKey: 'date', width: 25 },
        { header: 'User Name', dataKey: 'username', width: 30 },
        { header: 'Website URL', dataKey: 'website', width: 35 },
        { header: 'Bank Name', dataKey: 'bank', width: 25 },
        { header: 'Total Amount', dataKey: 'amount', width: 25 },
        { header: 'UTR', dataKey: 'utr', width: 30 },
        { header: 'Status', dataKey: 'status', width: 25 }
      ];

      // Calculate total amount for summary
      const totalAmount = allTransactions.reduce((sum, transaction) =>
        sum + (parseFloat(transaction.total) || 0), 0
      );

      // Format the data
      const data = allTransactions.map(transaction => ({
        trnNo: transaction.trnNo || '-',
        date: transaction.createdAt ? moment.utc(transaction?.createdAt).format('DD MMM YYYY, hh:mm A') : '-',
        username: transaction.username || 'GUEST',
        website: transaction.site || '-',
        bank: transaction.bankId && transaction.bankId.bankName ?
          (transaction.bankId.bankName === "UPI" ? `UPI - ${transaction.bankId.iban}` : transaction.bankId.bankName)
          : (transaction.paymentMethod || ''),
        amount: transaction.total ? `${transaction.total} INR` : '-',
        utr: transaction.utr || '-',
        status: transaction.status === "Decline" ? "Transaction Decline"
          : transaction.status === "Pending" ? "Transaction Pending"
            : transaction.approval === true ? "Points Approved"
              : (transaction.reason && transaction.reason !== "") ? "Points Decline"
                : "Points Pending"
      }));

      // Add subtotal row to data with TOTAL on the left side
      data.push({
        trnNo: '',
        date: '',
        username: 'TOTAL',
        website: '',
        bank: '',
        amount: `${totalAmount.toFixed(2)} INR`,
        utr: '',
        status: ''
      });

      // Generate table
      doc.autoTable({
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => item[col.dataKey])),
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: { top: 2, right: 5, bottom: 2, left: 2 },
        },
        headStyles: {
          fillColor: [66, 139, 202],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: columns.reduce((acc, col) => {
          acc[col.dataKey] = { cellWidth: col.width, halign: 'left' };
          return acc;
        }, {}),
        didDrawCell: (data) => {
          if (data.row.index === data.table.body.length - 1) {
            doc.setFillColor(180, 220, 240); // Change subtotal row color
          }
        }
      });

      // Save PDF with date in filename
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`direct-payment-transactions-${dateStr}.pdf`);

      notification.success({
        message: "Success",
        description: "PDF generated successfully",
        placement: "topRight"
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      notification.error({
        message: "Error",
        description: "Failed to generate PDF report",
        placement: "topRight"
      });
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <>
      <div
        className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
          }`}
        style={{ minHeight: `${containerHeight}px` }}
      >
        <div className="p-7">
          <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-4">
            <h1 className="text-[25px] font-[500]">Direct Transactions</h1>
            <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
              Dashboard - Data Table
            </p>
          </div>
          {loginType !== "minor" && (
            <div className="flex justify-end mb-2">
              <div className="w-full flex justify-center md:justify-end">
                <Button type="primary" onClick={downloadPDF}>
                  <p className="">Download Report</p>
                </Button>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between pb-3">
              <div>
                <p className="text-black font-[500] text-[24px] mr-2">
                  Filters
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

                {/* DropDown of status */}
                {loginType !== "minor" && (
                  <div>
                    <Select
                      className="min-w-[180px]"
                      placeholder="Status"
                      value={merchant}
                      onChange={(value) => setMerchant(value)}
                      options={[
                        { value: '', label: <span className="text-gray-400">All Status</span> },
                        { value: 'Points Pending', label: 'Points Pending' },
                        { value: 'Points Decline', label: 'Points Decline' },
                        { value: 'Points Approved', label: 'Points Approved' },
                        { value: 'Transaction Pending', label: 'Transaction Pending' },
                        { value: 'Transaction Decline', label: 'Transaction Decline' }
                      ]}
                      dropdownStyle={{ minWidth: '180px' }}
                    />
                  </div>
                )}
                <Space direction="vertical" size={10}>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      setDateRange(dates);
                    }}
                  />
                </Space>
                <div className="flex flex-col w-full md:w-40">
                  <input
                    type="text"
                    placeholder="Search by UTR / Trn-ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {/* Search by Bank */}
                {/* <div>
                  <Select
                    className="w-40"
                    placeholder="Select Bank"
                    value={selectedFilteredBank}
                    onChange={(e) => {
                      setSelectedFilteredBank(e);
                    }}
                    options={[
                      {
                        value: "",
                        label: (
                          <span className="text-gray-400">All Bank</span>
                        ),
                      },
                      ...allBanks,
                    ]}
                  />
                </div> */}
              </div>
            </div>
            <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                    <th className="p-4 text-nowrap">TRN-ID</th>
                    <th className="p-4">DATE</th>
                    <th className="p-4 text-nowrap">User Name</th>
                    <th className="p-4 text-nowrap">Website URL</th>
                    <th className="p-4 text-nowrap">BANK NAME</th>
                    <th className="p-4 text-nowrap">TOTAL AMOUNT</th>
                    <th className="p-4 ">UTR#</th>
                    <th className="pl-8">Status</th>
                    <th className="pl-7 cursor-pointer">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction?._id}
                        className="text-gray-800 text-sm border-b"
                      >
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2]">
                          {transaction?.trnNo}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                          {moment.utc(transaction?.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </td>
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {transaction?.username && transaction?.username !== "" ? transaction?.username : "GUEST"}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] text-nowrap">
                          {transaction?.site}
                        </td>
                        <td className="p-4 text-nowrap">
                          {transaction?.bankId?.bankName !== "UPI" ? (
                            <div className="">
                              <span className="text-[13px] font-[700] text-black whitespace-nowrap">
                                {transaction?.bankId?.bankName}
                              </span>
                            </div>
                          ) : (
                            <div className="">
                              <p className="text-[13px] font-[700] text-black ">
                                UPI<span className="font-[400]"> - {transaction?.bankId?.iban}</span>
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
                          {transaction?.total}
                        </td>
                        <td className="p-4 text-[12px] font-[700] text-[#0864E8]">
                          {transaction?.utr}
                        </td>
                        <td className="p-4 text-[13px] font-[500]">
                          <span
                            className={`px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center
                              ${transaction?.status === "Decline" ? "bg-[#FF7A8F33] text-[#FF002A]" : transaction?.status === "Pending" ? "bg-[#FFC70126] text-[#FFB800]" : transaction?.approval === true ? "bg-[#10CB0026] text-[#0DA000]" : (transaction?.reason && transaction?.reason !== "") ? "bg-[#cc7aff33] text-[#9929d5]" : "bg-[#00000026] text-[#5a5a5a]"}`}
                          >
                            {transaction?.status === "Decline" ? "Transaction Decline" : transaction?.status === "Pending" ? "Transaction Pending" : transaction?.approval === true ? "Points Approved" : (transaction?.reason && transaction?.reason !== "") ? "Points Decline" : "Points Pending"}
                          </span>
                        </td>
                        <td className="p-4 flex space-x-2 transaction-view-model">
                          <button
                            className="bg-blue-100 text-blue-600 rounded-full px-2 py-2"
                            title="View"
                            onClick={() => handleViewTransaction(transaction)}
                          >
                            <FiEye />
                          </button>
                          {transaction?.status === "Approved" && loginType === "minor" && (
                            <>
                              <button
                                disabled={transaction?.approval || transaction?.reason && transaction?.reason !== ""}
                                className={`px-2 py-2 rounded-full ${(transaction?.approval || transaction?.reason && transaction?.reason !== "") ? "cursor-not-allowed bg-gray-300" : "cursor-pointer bg-green-300"}`}
                                onClick={() => fn_checkPoints(transaction)}
                              >
                                <FaCheck />
                              </button>
                              <button
                                disabled={transaction?.approval || transaction?.reason && transaction?.reason !== ""}
                                className={`px-2 py-2 rounded-full ${(transaction?.approval || transaction?.reason && transaction?.reason !== "") ? "cursor-not-allowed bg-gray-300" : "cursor-pointer bg-red-300"}`}
                                onClick={() => { setShowPopup(true); setSelectedTrns(transaction) }}
                              >
                                <RxCross2 />
                              </button>
                            </>
                          )}

                          {showPopup && (
                            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
                              <div className="bg-white p-5 rounded-lg shadow-sm w-80">
                                <h3 className="text-lg font-bold mb-4">Select Reason</h3>
                                <div className="space-y-3">
                                  {[
                                    "Site Name Incorrect",
                                    "User ID Incorrect",
                                    "Both UserID and Site Name are Incorrect",
                                  ].map((reason, index) => (
                                    <label
                                      key={index}
                                      onChange={() => setReasonForDecline(reason)}
                                      className="flex items-center space-x-3 bg-gray-200 py-2 px-3 rounded-lg hover:bg-gray-300 cursor-pointer"
                                    >
                                      <input type="radio" name="same" className="w-5 h-5 cursor-pointer" />
                                      <span>{reason}</span>
                                    </label>
                                  ))}
                                </div>
                                <button
                                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                  onClick={() => { setShowPopup(false); fn_declinePoints(selectedTrns) }}
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500">
                        No Transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row items-center p-4 justify-between space-y-4 md:space-y-0">
              <p className="text-[13px] font-[500] text-gray-500 text-center md:text-left"></p>
              <Pagination
                className="self-center md:self-auto"
                onChange={(e) => setCurrentPage(e)}
                defaultCurrent={1}
                total={totalPages * 10}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        centered
        footer={null}
        width={900}
        style={{ fontFamily: "sans-serif", padding: "20px" }}
        title={
          <p className="text-[20px] font-[700]">
            Transaction Details
          </p>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setIsEdit(false);
        }}
        onClose={() => {
          setOpen(false);
          setIsEdit(false);
        }}
      >
        {selectedTransaction && (
          <div className="flex flex-col md:flex-row">
            {/* Left side input fields */}
            <div className="flex flex-col gap-2 mt-3 w-full md:w-1/2">
              <p className="font-[500] mt-[-20px] mb-[15px]">Transaction Id: <span className="text-gray-500 font-[700]">{selectedTransaction.trnNo}</span></p>
              {[
                {
                  label: "Website:",
                  value: selectedTransaction?.site || selectedTransaction?.website,
                },
                {
                  label: "User ID:",
                  value: selectedTransaction?.username,
                },
                {
                  label: "Amount:",
                  value: selectedTransaction?.total,
                },
                {
                  label: "UTR#:",
                  value: selectedTransaction?.utr,
                },
                {
                  label: "Date & Time:",
                  value: `${moment.utc(selectedTransaction?.createdAt).format('DD MMM YYYY, hh:mm A')}`,
                },
                {
                  label: "Bank Name:",
                  value:
                    selectedTransaction.bankId?.bankName ||
                    "UPI",
                },
                {
                  label: "Trn Status:",
                  value:
                    selectedTransaction.status,
                },
                // {
                //   label: "Description:",
                //   value:
                //     selectedTransaction.description || "",
                //   isTextarea: true,
                // },
              ].map((field, index) => (
                <div
                  className="flex items-center gap-4"
                  key={index}
                >
                  <p className="text-[12px] font-[600] w-[150px]">
                    {field.label}
                  </p>
                  {field.isTextarea ? (
                    <textarea
                      className="w-[50%] text-[11px] border rounded p-1 resize-none outline-none input-placeholder-black overflow-hidden"
                      value={field.value}
                      rows={3}
                      readOnly
                      style={{
                        overflow: "auto",
                        resize: "none",
                      }}
                    />
                  ) : (
                    <Input
                      prefix={
                        field.label === "Amount:" ? (
                          <FaIndianRupeeSign className="mt-[2px]" />
                        ) : null
                      }
                      className={`w-[50%] text-[12px] input-placeholder-black ${isEdit && (field.label === "Website:" || field?.label === "User ID:") ? "bg-white" : "bg-gray-200"}`}
                      readOnly={isEdit && (field.label === "Website:" || field?.label === "User ID:") ? false : true}
                      value={field?.value}
                      onChange={(e) => {
                        if (field?.label === "Website:") {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            site: e.target.value,
                          }));
                        } else {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }));
                        }
                      }}
                    />
                  )}



                </div>
              ))}


              <div className="border-b w-[370px] mt-4">
                {loginType === "major" && selectedTransaction?.status === "Approved" && (selectedTransaction?.reason && selectedTransaction?.reason !== "") && !selectedTransaction?.approval && (
                  <>
                    {!isEdit && (<button className="bg-[#F6790233] flex text-[#F67A03] h-[35px] items-center mb-[10px] px-[10px] rounded-[5px]" onClick={() => setIsEdit(!isEdit)}>Edit Information</button>)}
                    {isEdit && (<button
                      className="bg-[#F6790233] flex text-[#F67A03] h-[35px] items-center mb-[10px] px-[10px] rounded-[5px]"
                      onClick={async () => {
                        console.log("selectedTransaction ", selectedTransaction);
                        const response = await fn_updateTransactionStatusApi(selectedTransaction?._id, { ...selectedTransaction, reason: "", trnStatus: "Points Pending" });
                        if (response?.status) {
                          fetchTransactions(currentPage);
                          notification.success({
                            message: "Success",
                            description: "Transaction Updated!",
                            placement: "topRight",
                          });
                          setIsEdit(false);
                          setOpen(false);
                        }
                      }
                      }>
                      Update Information</button>)}
                  </>
                )}
              </div>
              {selectedTransaction?.reason && selectedTransaction?.reason !== "" && (
                <div>
                  <p className="font-[600]">Reason For Decline Points:</p>
                  <p className="font-[400] text-[13px]">{selectedTransaction?.reason}</p>
                </div>
              )}
              {selectedTransaction?.trnStatus === "Transaction Decline" ?
                <>
                  <div className="flex items-center mt-4">
                    <p className="text-[14px] font-[700] mr-2">Transaction Activity:</p>
                  </div>
                  {selectedTransaction?.trnStatus !== "Transaction Pending" && (
                    <div className="flex items-center">
                      <span
                        className={`text-nowrap text-[16px] font-[700] flex items-center justify-center ${selectedTransaction?.status === "Approved"
                          ? "text-[#0DA000]"
                          : selectedTransaction?.status === "Pending"
                            ? "text-[#FFB800]"
                            : selectedTransaction?.status === "Manual Verified"
                              ? "text-[#0864E8]"
                              : "text-[#FF002A]"
                          }`}
                      >
                        {selectedTransaction?.status === "Decline"
                          ? "Transaction Decline"
                          : selectedTransaction?.status === "Pending"
                            ? "Transaction Pending"
                            : selectedTransaction?.approval === true
                              ? "Points Approved"
                              : (selectedTransaction?.reason && selectedTransaction?.reason !== "")
                                ? "Points Decline"
                                : "Points Pending"}
                      </span>
                      <p className="text-[14px] font-[400] ml-6">
                        {moment(selectedTransaction?.updatedAt).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A')}
                      </p>
                    </div>
                  )}
                  <p className="text-[14px] font-[700] mt-3">
                    Reason for Decline Transaction
                  </p>

                  <p className="text-[14px] font-[400]">
                    {selectedTransaction?.transactionReason}
                  </p>
                </>
                : null}


            </div>
            {/* Right side with border and image */}
            <div className="w-full md:w-1/2 md:border-l my-10 md:mt-0 pl-0 md:pl-6 flex flex-col justify-between items-center h-full">
              <div className="relative w-full max-w-[400px] overflow-hidden cursor-zoom-in" style={{ aspectRatio: "1" }}>
                <img
                  src={`${BACKEND_URL}/${selectedTransaction?.image}`}
                  alt="Payment Proof"
                  className="w-full h-full object-contain"
                  style={{
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transform: isHovering ? "scale(2)" : "scale(1)",
                    transition: "transform 0.1s ease-out"
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onMouseMove={handleMouseMove}
                />
              </div>

              {/* <div className="flex">
                <button
                  className="mt-12 border flex border-black px-1 py-1 rounded"
                  onClick={() => {
                    const input =
                      document.createElement("input");
                    input.type = "file";
                    input.click();
                  }}
                >
                  <RiFindReplaceLine className="mt-[5px] mr-2 text-[#699BF7]" />
                  <p>Replace Payment Proof</p>
                </button>
              </div> */}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default DirectPaymentPage;
