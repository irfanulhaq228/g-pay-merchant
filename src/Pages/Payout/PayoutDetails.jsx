import moment from 'moment-timezone';
import { TiTick } from "react-icons/ti";
import { FiEye } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { FaRegCopy } from "react-icons/fa6";
import { LuImageMinus } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { notification, Pagination, Modal, Input } from "antd";
import BACKEND_URL, { fn_getUploadExcelFileData, fn_updateExcelWithdraw } from "../../api/api";


const PayoutDetails = ({ showSidebar }) => {

  const location = useLocation();
  const { withraw } = location.state;
  const [slipData, setSlipData] = useState([]);
  const [copiedId, setCopiedId] = useState(null); ``
  const [totalPages, setTotalPages] = useState(1);
  const containerHeight = window.innerHeight - 120;
  const [currentPage, setCurrentPage] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedWithdrawData, setSelectedWithdrawData] = useState(null);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-[#10CB0026] text-[#0DA000]";
      case "Pending":
        return "bg-[#FFC70126] text-[#FFB800]";
      case "Manual Verified":
        return "bg-[#0865e851] text-[#0864E8]";
      case "Decline":
        return "bg-[#FF7A8F33] text-[#FF002A]";
      case "Cancel":
        return "bg-[rgba(0,0,0,0.1)] text-[#000]";
      default:
        return "bg-[#10CB0026] text-[#0DA000]";
    }
  };

  const getExcelFileData = async () => {
    try {
      const response = await fn_getUploadExcelFileData(withraw._id, currentPage);
      if (response?.status) {
        console.log("Excel details data:", response?.data);
        setSlipData(response?.data?.data || []);
        setTotalPages(response?.data?.totalPages || 1);
      } else {
        notification.error({
          message: "Error",
          description: response?.message,
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error fetching excel data:", error);
    }
  };

  useEffect(() => {
    if (withraw?._id) {
      getExcelFileData();
    }
  }, [withraw?._id, currentPage]);

  const handleViewDetails = (item) => {
    setSelectedWithdrawData(item);
    setIsModalVisible(true);
  };

  const handleCancelPayout = async (item) => {
    const response = await fn_updateExcelWithdraw(item?._id);
    if (response?.status) {
      getExcelFileData();
      notification.success({
        message: "Success",
        description: response?.message,
        placement: "topRight",
      });
    } else {
      notification.error({
        message: "Error",
        description: response?.message,
        placement: "topRight",
      });
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleCopyDetails = (item, index) => {
    const isUPI = item?.account?.includes("@");
    const detailsToCopy = `Account Holder Name: ${item.username}
Bank Account: ${item.account}${!isUPI ? `\nIFSC Number: ${item.ifsc || "IFSC Code"}` : ''}
Amount: ₹ ${item.amount}
UTR Number: ${item.utr || "N/A"}
Created Date: ${moment.utc(item?.createdAt).format('DD MMM YYYY, hh:mm A')}
Updated Date: ${moment.utc(item?.updatedAt)
        .tz('Asia/Kolkata')
        .format('DD MMM YYYY, hh:mm A')}`
    navigator.clipboard.writeText(detailsToCopy).then(() => {
      setCopiedId(index);
      notification.success({
        message: "Copied!",
        description: "Payout details copied to clipboard",
        placement: "topRight",
        duration: 2
      });
      setTimeout(() => setCopiedId(null), 2000);
    });
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
            <h1 className="text-[25px] font-[500]">Payouts Details</h1>
            <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
              Dashboard - Payout Details
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between pb-3">
              <div>
                <p className="text-black font-medium text-lg">
                  List of Payout
                </p>
              </div>
            </div>
            <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>

            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                    <th className="p-4 whitespace-nowrap">S_ID</th>
                    <th className="p-4 whitespace-nowrap">Account Holder Name</th>
                    <th className="p-4 whitespace-nowrap">Account Number</th>
                    <th className="p-4 whitespace-nowrap">IFSC Number</th>
                    <th className="p-4 whitespace-nowrap">Amount</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                    <th className="p-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slipData?.map((item, index) => (
                    <tr key={index} className="text-gray-800 text-sm border-b">
                      <td className="p-4 text-[12px] font-[600] text-[#000000B2] whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="p-4 text-[12px] font-[600] text-[#000000B2] whitespace-nowrap">
                        {item?.username}
                      </td>
                      <td className="p-4 text-[12px] font-[600] text-[#000000B2] whitespace-nowrap">
                        {item?.account}
                      </td>
                      <td className="p-4 text-[12px] font-[600] text-[#000000B2] whitespace-nowrap">
                        {item?.ifsc || "IFSC Number"}
                      </td>
                      <td className="p-4 text-[12px] font-[700] text-[#000000B2] whitespace-nowrap">
                        ₹ {item?.amount}
                      </td>
                      <td className="p-4 text-[13px] font-[500] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`py-1 rounded-[20px] text-[11px] font-[600] w-[100px] flex items-center justify-center ${getStatusClass(item?.status)}`}>
                            {item?.status}
                          </span>
                          {item?.status === "Approved" && (
                            <button
                              onClick={() => handleCopyDetails(item, index)}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                              title="Copy payout details"
                            >
                              {copiedId === index ? (
                                <TiTick className="text-green-600 text-lg" />
                              ) : (
                                <FaRegCopy className="text-gray-600 text-sm" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-[12px] font-[600] whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className={`rounded-[20px] text-[11px] font-[600] w-[29px] h-[29px] flex items-center justify-center ${item?.status !== "Pending" ? "bg-gray-300 text-black cursor-not-allowed" : "bg-[#FF173D33] text-[#D50000]"}`}
                            onClick={() => handleCancelPayout(item)}
                            disabled={item?.status !== "Pending"}
                            title="Cancel Withdraw ?"
                          >
                            <RxCross2 className="text-[14px]" />
                          </button>
                          <button
                            className="bg-blue-100 text-blue-600 rounded-full px-2 py-2"
                            title="View"
                            onClick={() => handleViewDetails(item)}
                          >
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <Modal
        title="Payout Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        width={(selectedWithdrawData?.status === "Pending" || selectedWithdrawData?.status === "Cancel") ? "95%" : "95%"}
        style={{
          fontFamily: "sans-serif",
          maxWidth: (selectedWithdrawData?.status === "Pending" || selectedWithdrawData?.status === "Cancel") ? "600px" : "900px",
          margin: "10px auto",
          top: "0%",
        }}
        bodyStyle={{
          padding: "12px",
          maxHeight: "85vh",
          overflowY: "auto"
        }}
        wrapClassName="flex items-start sm:items-center"
        footer={null}
      >
        {selectedWithdrawData && (
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Left Column */}
            <div className={`${(selectedWithdrawData.status === "Pending" || selectedWithdrawData.status === "Cancel") ? "w-full" : "w-full lg:w-[450px]"}`}>
              <div className="flex flex-col gap-2 mt-3">
                {/* Transaction Time */}
                <p className="text-[12px] font-[500] text-gray-600 mt-[-18px]">
                  Transaction Time:{" "}
                  <span className="font-[600] break-words">
                    {moment.utc(selectedWithdrawData?.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </p>

                {/* Username */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-[10px] w-full">
                  <p className="text-[12px] font-[600] min-w-[120px] sm:w-[200px] text-nowrap">Account Holder Name:</p>
                  <Input
                    className="text-[12px] bg-gray-200 w-full"
                    readOnly
                    value={selectedWithdrawData?.username || "N/A"}
                  />
                </div>

                {/* Account Number */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <p className="text-[12px] font-[600] min-w-[120px] sm:w-[200px] text-nowrap">Bank Account:</p>
                  <Input
                    className="text-[12px] bg-gray-200 w-full"
                    readOnly
                    value={selectedWithdrawData?.account || "N/A"}
                  />
                </div>

                {/* IFSC Number */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <p className="text-[12px] font-[600] min-w-[120px] sm:w-[200px] text-nowrap">IFSC Number:</p>
                  <Input
                    className="text-[12px] bg-gray-200 w-full"
                    readOnly
                    value={selectedWithdrawData?.ifsc || "-"}
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <p className="text-[12px] font-[600] min-w-[120px] sm:w-[200px] text-nowrap">Amount:</p>
                  <Input
                    className="text-[12px] bg-gray-200 w-full"
                    readOnly
                    value={`₹ ${selectedWithdrawData?.amount}` || "N/A"}
                  />
                </div>

                {/* Withdraw Amount */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <p className="text-[12px] font-[600] min-w-[120px] sm:w-[200px] text-nowrap">Withdraw Amount:</p>
                  <Input
                    className="text-[12px] bg-gray-200 w-full"
                    readOnly
                    value={`₹ ${selectedWithdrawData?.withdrawAmount}` || "N/A"}
                  />
                </div>

                {/* <div className="flex items-center gap-4">
                  <p className="text-[12px] font-[600] w-[200px]">Account Type:</p>
                  <Input
                    className="text-[12px] bg-gray-200"
                    readOnly
                    value={selectedWithdrawData?.account?.includes("@") ? "UPI" : "Bank"}
                  />
                </div> */}



                {/* Status Section */}
                <div className="border-t mt-2 mb-1"></div>

                {/* UTR Number */}
                {selectedWithdrawData.utr && (
                  <div className="flex items-center gap-4">
                    <p className="text-[14px] font-[600] w-[200px]">UTR Number:</p>
                    <Input
                      className="text-[12px] bg-gray-100"
                      readOnly
                      value={selectedWithdrawData.utr}
                    />
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <p className="text-[14px] font-[600] w-[150px]">STATUS:</p>
                  <div
                    className={`px-3 py-2 rounded-[20px] w-[100px] text-center text-[13px] font-[600] ${getStatusClass(selectedWithdrawData?.status)}`}
                  >
                    {selectedWithdrawData?.status}
                  </div>

                </div>
                {/* Show Updated Time only for certain statuses */}
                {(selectedWithdrawData?.status === "Approved" || 
                  selectedWithdrawData?.status === "Decline") && (
                  <div className="flex items-center mt-2">
                    <p className="text-[14px] font-[600] w-[150px]">
                      Updated Time: </p>
                    <span className="font-[400] break-words">
                      {moment.utc(selectedWithdrawData?.updatedAt)
                        .tz('Asia/Kolkata')
                        .format('DD MMM YYYY, hh:mm A')}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column */}
            {selectedWithdrawData.status !== "Pending" && selectedWithdrawData.status !== "Cancel" && selectedWithdrawData?.status !== "Decline" && (
              <div className="w-full lg:w-[350px] border-t lg:border-l lg:border-t-0 pt-4 lg:pt-0 lg:pl-4 mt-4 lg:mt-0">
                <div className="flex flex-col gap-4">
                  {/* Payment Proof */}
                  {selectedWithdrawData?.image ? (
                    <div>
                      <p className="text-[14px] font-[600] mb-2">
                        Payment Proof
                      </p>
                      <div
                        className="relative w-full max-w-[400px] overflow-hidden cursor-zoom-in"
                        style={{ aspectRatio: "1" }}
                      >
                        <img
                          src={`${BACKEND_URL}/${selectedWithdrawData?.image}`}
                          alt="Payment Proof"
                          className="w-full h-full object-contain"
                          style={{
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                            transform: isHovering ? "scale(2)" : "scale(1)",
                            transition: "transform 0.1s ease-out",
                          }}
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          onMouseMove={handleMouseMove}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-center italic text-gray-500 font-[500] mt-[10px]"><LuImageMinus className="inline-block mr-2 text-[22px] mt-[-2px]" />No Image Proof Provided</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default PayoutDetails;