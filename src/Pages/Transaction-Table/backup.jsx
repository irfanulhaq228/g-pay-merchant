// import { useNavigate } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import "react-datepicker/dist/react-datepicker.css";
// import { Pagination, Modal, Input, notification, DatePicker, Space, Select, Button } from "antd";
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// import { FaRegEdit } from "react-icons/fa";
// import { IoMdCheckmark } from "react-icons/io";
// import { GoCircleSlash } from "react-icons/go";
// import { FiEye, FiTrash2 } from "react-icons/fi";
// import { RiFindReplaceLine } from "react-icons/ri";
// import { FaCheck, FaIndianRupeeSign } from "react-icons/fa6";

// import BACKEND_URL, { fn_deleteTransactionApi, fn_getAllMerchantApi, fn_updateTransactionStatusApi } from "../../api/api";
// import { RxCross2 } from "react-icons/rx";
// import axios from "axios";

// const TransactionsTable = ({ setSelectedPage, authorization, showSidebar, permissionsData, loginType }) => {

//   const navigate = useNavigate();
//   const searchParams = new URLSearchParams(location.search);

//   const { RangePicker } = DatePicker;
//   const [open, setOpen] = useState(false);
//   const status = searchParams.get("status");
//   const [isEdit, setIsEdit] = useState(false);
//   const [merchant, setMerchant] = useState("");
//   const [totalPages, setTotalPages] = useState(1);
//   const containerHeight = window.innerHeight - 120;
//   const [showPopup, setShowPopup] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState(""); 
//   const [searchTrnId, setSearchTrnId] = useState("");
//   const [transactions, setTransactions] = useState([]);
//   const [selectedTrns, setSelectedTrns] = useState(null);
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [reasonForDecline, setReasonForDecline] = useState("");
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.transactionHistory?.edit : true;

//   const fetchTransactions = async (pageNumber) => {
//     try {
//       const result = await fn_getAllMerchantApi(status || null, pageNumber, merchant, searchQuery, searchTrnId);
//       if (result?.status) {
//         if (result?.data?.status === "ok") {
//           setTransactions(result?.data?.data);
//           setTotalPages(result?.data?.totalPages);
//         } else {
//           setTransactions([]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setTransactions([]);
//     }
//   };

//   useEffect(() => {
//     window.scroll(0, 0);
//     if (!authorization) {
//       navigate("/login");
//       return;
//     }
//     setSelectedPage("transaction-history");
//   }, []);

//   useEffect(() => {
//     fetchTransactions(currentPage);
//   }, [currentPage, merchant, searchQuery, searchTrnId]);

//   const filteredTransactions = transactions.filter((transaction) => {
//     const transactionDate = new Date(transaction.createdAt);

//     const adjustedEndDate = dateRange[1] ? new Date(dateRange[1]) : null;
//     if (adjustedEndDate) {
//       adjustedEndDate.setHours(23, 59, 59, 999);
//     }

//     const isWithinDateRange =
//       (!dateRange[0] || transactionDate >= dateRange[0]) &&
//       (!adjustedEndDate || transactionDate <= adjustedEndDate);

//     const statusCondition = loginType === "minor" ? (transaction?.status === "Approved" && transaction?.approval === false && (!transaction?.reason || transaction?.reason === "")) : true;

//     return (
//       transaction?.trnNo?.toString().includes(searchTrnId) &&
//       transaction?.utr?.toLowerCase().includes(searchQuery.toLowerCase()) &&
//       (merchant === "" || transaction?.merchantName === merchant) &&
//       isWithinDateRange &&
//       statusCondition
//     );
//   });

//   const handleViewTransaction = (transaction) => {
//     setSelectedTransaction(transaction);
//     setOpen(true);
//   };

//   const fn_checkPoints = async (item) => {
//     console.log("item ", item);
//     const data = {
//       merchantId: item?.merchantId,
//       ledgerId: item?._id
//     };
//     const response = await axios.post(`${BACKEND_URL}/approval/create`, data);
//     if (response?.data?.status === "ok") {
//       fetchTransactions(currentPage);
//       notification.success({
//         message: "Updated Successfully",
//         description: "Added to Approval Points Table",
//         placement: "topRight",
//       });
//     } else {
//       notification.error({
//         message: "Failed",
//         description: "Failed to add to Approval Points Table",
//         placement: "topRight",
//       });
//     };
//   };

//   const fn_declinePoints = async (item) => {
//     const response = await fn_updateTransactionStatusApi(item?._id, { reason: reasonForDecline });
//     if (response?.data?.status === "ok") {
//       fetchTransactions(currentPage);
//       notification.success({
//         message: "Updated Successfully",
//         description: "Transaction Updated",
//         placement: "topRight",
//       });
//     } else {
//       notification.error({
//         message: "Failed",
//         description: "Failed",
//         placement: "topRight",
//       });
//     };
//   };

//   const downloadPDF = async () => {
//     try {
//       // Fetch all transactions
//       const allTransactions = [];
//       let page = 1;
//       let hasMore = true;

//       while (hasMore) {
//         const result = await fn_getAllMerchantApi(status || null, page, merchant, searchQuery, searchTrnId);
//         if (result?.status && result?.data?.status === "ok") {
//           allTransactions.push(...result.data.data);
//           if (result.data.data.length < 10) { // Assuming 10 is your page size
//             hasMore = false;
//           }
//           page++;
//         } else {
//           hasMore = false;
//         }
//       }

//       // Create PDF in landscape mode with larger width
//       const doc = new jsPDF('landscape', 'mm', 'a4');

//       // Add title
//       doc.setFontSize(16);
//       doc.text('Transactions Report', 14, 15);
//       doc.setFontSize(10);
//       doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

//       // Define the columns for the table
//       const columns = [
//         { header: 'TRN-ID', dataKey: 'trnNo' },
//         { header: 'Date', dataKey: 'date' },
//         { header: 'User Name', dataKey: 'username' },
//         { header: 'Bank', dataKey: 'bank' },
//         { header: 'Amount', dataKey: 'amount' },
//         { header: 'UTR', dataKey: 'utr' },
//         { header: 'Status', dataKey: 'status' }
//       ];

//       // Prepare the data
//       const data = allTransactions.map(transaction => ({
//         trnNo: transaction.trnNo,
//         date: new Date(transaction.createdAt).toLocaleDateString(),
//         username: transaction.username || 'GUEST',
//         bank: transaction.bankId?.bankName || 'UPI',
//         amount: transaction.total,
//         utr: transaction.utr,
//         status: transaction.status === "Decline" ? "Transaction Decline"
//           : transaction.status === "Pending" ? "Transaction Pending"
//             : transaction.approval === true ? "Points Approved"
//               : (transaction.reason && transaction.reason !== "") ? "Points Decline"
//                 : "Points Pending"
//       }));

//       // Generate the table with wider columns
//       doc.autoTable({
//         head: [columns.map(col => col.header)],
//         body: data.map(item => columns.map(col => item[col.dataKey])),
//         startY: 35,
//         styles: {
//           fontSize: 8,
//           cellPadding: 3,
//           overflow: 'visible',
//           halign: 'left',
//           textColor: [0, 0, 0]
//         },
//         headStyles: {
//           fillColor: [66, 139, 202],
//           fontSize: 9,
//           fontStyle: 'bold',
//           halign: 'center'
//         },
//         columnStyles: {
//           0: { cellWidth: 30 },  // TRN-ID
//           1: { cellWidth: 35 },  // Date
//           2: { cellWidth: 40 },  // User Name
//           3: { cellWidth: 35 },  // Bank
//           4: { cellWidth: 25 },  // Amount
//           5: { cellWidth: 40 },  // UTR
//           6: { cellWidth: 40 }   // Status
//         },
//         bodyStyles: {
//           valign: 'middle',
//         },
//         margin: { top: 35, left: 10, right: 10, bottom: 20 },
//         tableWidth: 'auto',
//         didDrawPage: function (data) {
//           // Add page number at the bottom
//           doc.setFontSize(8);
//           doc.text(
//             `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
//             doc.internal.pageSize.width - 20,
//             doc.internal.pageSize.height - 10,
//             { align: 'right' }
//           );
//         },
//       });

//       // Add total count at the bottom of the last page
//       const lastPage = doc.internal.getNumberOfPages();
//       doc.setPage(lastPage);
//       doc.setFontSize(10);
//       doc.text(`Total Transactions: ${data.length}`, 14, doc.internal.pageSize.height - 10);

//       // Save the PDF
//       doc.save('transactions-report.pdf');

//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       notification.error({
//         message: "Error",
//         description: "Failed to generate PDF report",
//         placement: "topRight",
//       });
//     }
//   };

//   return (
//     <>
//       <div
//         style={{ minHeight: `${containerHeight}px` }}
//         className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"}`}
//       >
//         <div className="p-7">
//           <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-4">
//             <h1 className="text-[25px] font-[500]">All Transaction</h1>
//             <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
//               Dashboard - Data Table
//             </p>
//           </div>
//           <div className="flex justify-end mb-2">
//             <Button type="primary" onClick={downloadPDF}>
//               <p className="">Download Report</p>
//             </Button>
//           </div>
//           <div className="bg-white rounded-lg p-4">
//             <div className="flex flex-col md:flex-row items-center justify-between pb-3">
//               <div>
//                 <p className="text-black font-medium text-lg">
//                   List of all Transactions
//                 </p>
//               </div>
//               <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
//                 {/* DropDown of status */}
//                 <div>
//                   <Select
//                     className="min-w-[180px]"
//                     placeholder="Status"
//                     value={merchant}
//                     onChange={(value) => setMerchant(value)}
//                     options={[
//                       { value: '', label: <span className="text-gray-400">All Status</span> },
//                       { value: 'Points Pending', label: 'Points Pending' },
//                       { value: 'Points Decline', label: 'Points Decline' },
//                       { value: 'Points Approved', label: 'Points Approved' },
//                       { value: 'Transaction Pending', label: 'Transaction Pending' },
//                       { value: 'Transaction Decline', label: 'Transaction Decline' }
//                     ]}
//                     dropdownStyle={{ minWidth: '180px' }}
//                   />
//                 </div>
//                 <Space direction="vertical" size={10}>
//                   <RangePicker
//                     value={dateRange}
//                     onChange={(dates) => {
//                       setDateRange(dates);
//                     }}
//                   />
//                 </Space>
//                 {/* Search By TRN Is */}
//                 <div className="flex flex-col w-full md:w-40">
//                   <input
//                     type="text"
//                     placeholder="Search by TRN-ID"
//                     value={searchTrnId}
//                     onChange={(e) => setSearchTrnId(e.target.value)}
//                     className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                 </div>
//                 <div className="flex flex-col w-full md:w-40">
//                   <input
//                     type="text"
//                     placeholder="Search by UTR"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full border">
//                 <thead>
//                   <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
//                     <th className="p-4 text-nowrap">TRN-ID</th>
//                     <th className="p-4">DATE</th>
//                     <th className="p-4 text-nowrap">User Name</th>
//                     <th className="p-4 text-nowrap">BANK NAME</th>
//                     <th className="p-4 text-nowrap">TOTAL AMOUNT</th>
//                     <th className="p-4 ">UTR#</th>
//                     <th className="pl-8">Status</th>
//                     <th className="pl-7 cursor-pointer">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {transactions.length > 0 ? (
//                     transactions.map((transaction) => (
//                       <tr
//                         key={transaction?._id}
//                         className="text-gray-800 text-sm border-b"
//                       >
//                         <td className="p-4 text-[13px] font-[600] text-[#000000B2]">{transaction?.trnNo}</td>
//                         <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
//                           {new Date(transaction?.createdAt).toDateString()},{" "}
//                           {new Date(transaction?.createdAt).toLocaleTimeString()}
//                         </td>
//                         <td className="p-4 text-[13px] font-[700] text-[#000000B2]">{transaction?.username && transaction?.username !== "" ? transaction?.username : "GUEST"}</td>
//                         <td className="p-4">
//                           {transaction?.bankId?.bankName ? (
//                             <div className="">
//                               <span className="text-[13px] font-[700] text-black whitespace-nowrap">
//                                 {transaction?.bankId?.bankName}
//                               </span>
//                             </div>
//                           ) : (
//                             <div className="">
//                               <p className="text-[14px] font-[700] text-black ">
//                                 UPI
//                               </p>
//                             </div>
//                           )}
//                         </td>
//                         <td className="p-4 text-[13px] font-[700] text-[#000000B2]">
//                           <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
//                           {transaction?.total}
//                         </td>
//                         <td className="p-4 text-[12px] font-[700] text-[#0864E8]">{transaction?.utr}</td>
//                         <td className="p-4 text-[13px] font-[500]">
//                           <span
//                             className={`px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center
//                               ${transaction?.status === "Decline" ? "bg-[#FF7A8F33] text-[#FF002A]" : transaction?.status === "Pending" ? "bg-[#FFC70126] text-[#FFB800]" : transaction?.approval === true ? "bg-[#10CB0026] text-[#0DA000]" : (transaction?.reason && transaction?.reason !== "") ? "bg-[#cc7aff33] text-[#9929d5]" : "bg-[#00000026] text-[#5a5a5a]"}`}
//                           >
//                             {transaction?.status === "Decline" ? "Transaction Decline" : transaction?.status === "Pending" ? "Transaction Pending" : transaction?.approval === true ? "Points Approved" : (transaction?.reason && transaction?.reason !== "") ? "Points Decline" : "Points Pending"}
//                           </span>
//                         </td>
//                         <td className="p-4 flex space-x-2 transaction-view-model">
//                           <button
//                             className="bg-blue-100 text-blue-600 rounded-full px-2 py-2 mx-2"
//                             title="View"
//                             onClick={() => handleViewTransaction(transaction)}
//                           >
//                             <FiEye />
//                           </button>
//                           {transaction?.status === "Approved" && loginType === "minor" && (
//                             <>
//                               <button
//                                 disabled={transaction?.approval || transaction?.reason && transaction?.reason !== ""}
//                                 className={`px-2 py-2 rounded-full ${(transaction?.approval || transaction?.reason && transaction?.reason !== "") ? "cursor-not-allowed bg-gray-300" : "cursor-pointer bg-green-300"}`}
//                                 onClick={() => fn_checkPoints(transaction)}
//                               >
//                                 <FaCheck />
//                               </button>
//                               <button
//                                 disabled={transaction?.approval || transaction?.reason && transaction?.reason !== ""}
//                                 className={`px-2 py-2 rounded-full ${(transaction?.approval || transaction?.reason && transaction?.reason !== "") ? "cursor-not-allowed bg-gray-300" : "cursor-pointer bg-red-300"}`}
//                                 onClick={() => { setShowPopup(true); setSelectedTrns(transaction) }}
//                               >
//                                 <RxCross2 />
//                               </button>
//                             </>
//                           )}

//                           {showPopup && (
//                             <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
//                               <div className="bg-white p-5 rounded-lg shadow-sm w-80">
//                                 <h3 className="text-lg font-bold mb-4">Select Reason</h3>
//                                 <div className="space-y-3">
//                                   {[
//                                     "Site Name Incorrect",
//                                     "User ID Incorrect",
//                                     "Both UserID and Site Name are Incorrect",
//                                   ].map((reason, index) => (
//                                     <label
//                                       key={index}
//                                       onChange={() => setReasonForDecline(reason)}
//                                       className="flex items-center space-x-3 bg-gray-200 py-2 px-3 rounded-lg hover:bg-gray-300 cursor-pointer"
//                                     >
//                                       <input type="radio" name="same" className="w-5 h-5 cursor-pointer" />
//                                       <span>{reason}</span>
//                                     </label>
//                                   ))}
//                                 </div>
//                                 <button
//                                   className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
//                                   onClick={() => { setShowPopup(false); fn_declinePoints(selectedTrns) }}
//                                 >
//                                   Submit
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="8" className="p-4 text-center text-gray-500">
//                         No Transactions found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex flex-col md:flex-row items-center p-4 justify-between space-y-4 md:space-y-0">
//               <p className="text-[13px] font-[500] text-gray-500 text-center md:text-left"></p>
//               <Pagination
//                 className="self-center md:self-auto"
//                 onChange={(e) => setCurrentPage(e)}
//                 defaultCurrent={1}
//                 total={totalPages * 10}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <Modal
//         centered
//         footer={null}
//         width={900}
//         style={{ fontFamily: "sans-serif", padding: "20px" }}
//         title={
//           <p className="text-[20px] font-[700]">
//             Transaction Details
//           </p>
//         }
//         open={open}
//         onCancel={() => {
//           setOpen(false);
//           setIsEdit(false);
//         }}
//         onClose={() => {
//           setOpen(false);
//           setIsEdit(false);
//         }}
//       >
//         {selectedTransaction && (
//           <div className="flex flex-col md:flex-row">
//             {/* Left side input fields */}
//             <div className="flex flex-col gap-2 mt-3 w-full md:w-1/2">
//               <p className="font-[500] mt-[-20px] mb-[15px]">Transaction Id: <span className="text-gray-500 font-[700]">{selectedTransaction.trnNo}</span></p>
//               {[
//                 {
//                   label: "Total Amount:",
//                   value: selectedTransaction?.total,
//                 },
//                 {
//                   label: "UTR#:",
//                   value: selectedTransaction?.utr,
//                 },
//                 {
//                   label: "Date & Time:",
//                   value: `${new Date(
//                     selectedTransaction.createdAt
//                   ).toLocaleString()}`,
//                 },
//                 {
//                   label: "Bank Name:",
//                   value:
//                     selectedTransaction.bankId?.bankName ||
//                     "UPI",
//                 },
//                 {
//                   label: "Trn Status:",
//                   value:
//                     selectedTransaction.status,
//                 },
//                 // {
//                 //   label: "Description:",
//                 //   value:
//                 //     selectedTransaction.description || "",
//                 //   isTextarea: true,
//                 // },
//               ].map((field, index) => (
//                 <div
//                   className="flex items-center gap-4"
//                   key={index}
//                 >
//                   <p className="text-[12px] font-[600] w-[150px]">
//                     {field.label}
//                   </p>
//                   {field.isTextarea ? (
//                     <textarea
//                       className="w-[50%] text-[11px] border rounded p-1 resize-none outline-none input-placeholder-black overflow-hidden"
//                       value={field.value}
//                       rows={3}
//                       readOnly
//                       style={{
//                         overflow: "auto",
//                         resize: "none",
//                       }}
//                     />
//                   ) : (
//                     <Input
//                       prefix={
//                         field.label === "Amount:" ? (
//                           <FaIndianRupeeSign className="mt-[2px]" />
//                         ) : null
//                       }
//                       className={`w-[50%] text-[12px] input-placeholder-black ${isEdit &&
//                         (field.label === "Amount:" ||
//                           field?.label === "UTR#:")
//                         ? "bg-white"
//                         : "bg-gray-200"
//                         }`}
//                       readOnly={
//                         isEdit &&
//                           (field.label === "Amount:" ||
//                             field?.label === "UTR#:")
//                           ? false
//                           : true
//                       }
//                       value={field?.value}
//                       onChange={(e) => {
//                         if (field?.label === "Amount:") {
//                           setSelectedTransaction((prev) => ({
//                             ...prev,
//                             total: e.target.value,
//                           }));
//                         } else {
//                           setSelectedTransaction((prev) => ({
//                             ...prev,
//                             utr: e.target.value,
//                           }));
//                         }
//                       }}
//                     />
//                   )}
//                 </div>
//               ))}
//               <div className="border-b w-[370px] mt-4">
//                 {loginType === "major" && selectedTransaction?.status === "Approved" && (selectedTransaction?.reason && selectedTransaction?.reason !== "") && !selectedTransaction?.approval && (
//                   <button className="bg-[#F6790233] flex text-[#F67A03] h-[35px] items-center mb-[10px] px-[10px] rounded-[5px]">Update Information</button>
//                 )}
//               </div>
//               {selectedTransaction?.reason && selectedTransaction?.reason !== "" && (
//                 <div>
//                   <p className="font-[600]">Reason For Decline Points:</p>
//                   <p className="font-[400] text-[13px]">{selectedTransaction?.reason}</p>
//                 </div>
//               )}

//               {selectedTransaction?.transactionReason ?
//                 <>
//                   <p className="text-[14px] font-[700]">
//                     Reason for Decline Transaction
//                   </p>

//                   <p className="text-[14px] font-[400]">
//                     {selectedTransaction?.transactionReason}
//                   </p>
//                 </>
//                 : null}


//               {selectedTransaction?.activity && selectedTransaction?.activity !== "" &&
//                 (<>
//                   <p className="text-[14px] font-[700]">
//                     Activity
//                   </p>

//                   <p className="text-[14px] font-[400]">
//                     {selectedTransaction?.activity}
//                   </p>
//                 </>)}
//             </div>
//             {/* Right side with border and image */}
//             <div className="w-full md:w-1/2 md:border-l my-10 md:mt-0 pl-0 md:pl-6 flex flex-col justify-between items-center h-full">
//               <img
//                 src={`${BACKEND_URL}/${selectedTransaction?.image}`}
//                 alt="Payment Proof"
//                 className="max-h-[400px]"
//               />

//               {/* <div className="flex">
//                 <button
//                   className="mt-12 border flex border-black px-1 py-1 rounded"
//                   onClick={() => {
//                     const input =
//                       document.createElement("input");
//                     input.type = "file";
//                     input.click();
//                   }}
//                 >
//                   <RiFindReplaceLine className="mt-[5px] mr-2 text-[#699BF7]" />
//                   <p>Replace Payment Proof</p>
//                 </button>
//               </div> */}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </>
//   );
// };

// export default TransactionsTable;















import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { RxCross2 } from "react-icons/rx";
import { FaRegEdit } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { GoCircleSlash } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { RiFindReplaceLine } from "react-icons/ri";
import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck, FaIndianRupeeSign } from "react-icons/fa6";
import { Pagination, Modal, Input, notification, DatePicker, Space, Select, Button } from "antd";
import BACKEND_URL, { fn_deleteTransactionApi, fn_getAllMerchantApi, fn_updateTransactionStatusApi, fn_getAllBanksData2 } from "../../api/api";

// import { io } from "socket.io-client";

const TransactionsTable = ({ setSelectedPage, authorization, showSidebar, permissionsData, loginType }) => {

  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  // const socket = io(`${BACKEND_URL}/payment`);
  const { RangePicker } = DatePicker;
  const [open, setOpen] = useState(false);
  const status = searchParams.get("status");
  const [isEdit, setIsEdit] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const containerHeight = window.innerHeight - 120;
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrnId, setSearchTrnId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedTrns, setSelectedTrns] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [reasonForDecline, setReasonForDecline] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.transactionHistory?.edit : true;
  const [allBanks, setAllBanks] = useState([]);
  const [selectedFilteredBank, setSelectedFilteredBank] = useState("");

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
      console.log('Fetching with bank:', selectedFilteredBank); // Debug log
      const result = await fn_getAllMerchantApi(
        status || null,
        pageNumber,
        merchant,
        searchQuery,
        searchTrnId,
        selectedFilteredBank  // Add bank filter
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
        setAllBanks(
          result?.data?.data?.map((item) => {
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
    setSelectedPage("transaction-history");
    fetchBanks();
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, merchant, searchQuery, searchTrnId, selectedFilteredBank]); 

  const filteredTransactions = transactions;

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
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
    const response = await fn_updateTransactionStatusApi(item?._id, { reason: reasonForDecline });
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
      // Fetch all transactions
      const allTransactions = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await fn_getAllMerchantApi(status || null, page, merchant, searchQuery, searchTrnId);
        if (result?.status && result?.data?.status === "ok") {
          allTransactions.push(...result.data.data);
          if (result.data.data.length < 10) {
            hasMore = false;
          }
          page++;
        } else {
          hasMore = false;
        }
      }

      // Create PDF in landscape mode with larger width
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // Add title
      doc.setFontSize(16);
      doc.text('Transactions Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

      // Define the columns for the table
      const columns = [
        { header: 'TRN-ID', dataKey: 'trnNo' },
        { header: 'Date', dataKey: 'date' },
        { header: 'User Name', dataKey: 'username' },
        { header: 'Bank', dataKey: 'bank' },
        { header: 'Amount', dataKey: 'amount' },
        { header: 'UTR', dataKey: 'utr' },
        { header: 'Status', dataKey: 'status' }
      ];

      // Prepare the data
      const data = allTransactions.map(transaction => ({
        trnNo: transaction.trnNo,
        date: new Date(transaction.createdAt).toLocaleDateString(),
        username: transaction.username || 'GUEST',
        bank: transaction.bankId?.bankName || 'UPI',
        amount: transaction.total,
        utr: transaction.utr,
        status: transaction.status === "Decline" ? "Transaction Decline"
          : transaction.status === "Pending" ? "Transaction Pending"
            : transaction.approval === true ? "Points Approved"
              : (transaction.reason && transaction.reason !== "") ? "Points Decline"
                : "Points Pending"
      }));

      // Generate the table with wider columns
      doc.autoTable({
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => item[col.dataKey])),
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'visible',
          halign: 'left',
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [66, 139, 202],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 30 },  // TRN-ID
          1: { cellWidth: 35 },  // Date
          2: { cellWidth: 40 },  // User Name
          3: { cellWidth: 35 },  // Bank
          4: { cellWidth: 25 },  // Amount
          5: { cellWidth: 40 },  // UTR
          6: { cellWidth: 40 }   // Status
        },
        bodyStyles: {
          valign: 'middle',
        },
        margin: { top: 35, left: 10, right: 10, bottom: 20 },
        tableWidth: 'auto',
        didDrawPage: function (data) {
          // Add page number at the bottom
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        },
      });

      // Add total count at the bottom of the last page
      const lastPage = doc.internal.getNumberOfPages();
      doc.setPage(lastPage);
      doc.setFontSize(10);
      doc.text(`Total Transactions: ${data.length}`, 14, doc.internal.pageSize.height - 10);

      // Save the PDF
      doc.save('transactions-report.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      notification.error({
        message: "Error",
        description: "Failed to generate PDF report",
        placement: "topRight",
      });
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
            <h1 className="text-[25px] font-[500]">All Transaction</h1>
            <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
              Dashboard - Data Table
            </p>
          </div>
          <div className="flex justify-end mb-2">
            <Button type="primary" onClick={downloadPDF}>
              <p className="">Download Report</p>
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between pb-3">
              <div>
                <p className="text-black font-[500] text-[24px] mr-2">
                  Filters
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <Space direction="vertical" size={10}>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      setDateRange(dates);
                    }}
                  />
                </Space>

                {/* Search By TRN Is */}
                <div className="flex flex-col w-full md:w-40">
                  <input
                    type="text"
                    placeholder="Search by TRN-ID"
                    value={searchTrnId}
                    onChange={(e) => setSearchTrnId(e.target.value)}
                    className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col w-full md:w-40">
                  <input
                    type="text"
                    placeholder="Search by UTR"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                {/* DropDown of status */}
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
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2]">{transaction?.trnNo}</td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                          {new Date(transaction?.createdAt).toDateString()},{" "}
                          {new Date(transaction?.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2]">{transaction?.username && transaction?.username !== "" ? transaction?.username : "GUEST"}</td>
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
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2]">
                          <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
                          {transaction?.total}
                        </td>
                        <td className="p-4 text-[12px] font-[700] text-[#0864E8]">{transaction?.utr}</td>
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
                            className="bg-blue-100 text-blue-600 rounded-full px-2 py-2 mx-2"
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
                  label: "Total Amount:",
                  value: selectedTransaction?.total,
                },
                {
                  label: "UTR#:",
                  value: selectedTransaction?.utr,
                },
                {
                  label: "Date & Time:",
                  value: `${new Date(
                    selectedTransaction.createdAt
                  ).toLocaleString()}`,
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
                      className={`w-[50%] text-[12px] input-placeholder-black ${isEdit &&
                        (field.label === "Amount:" ||
                          field?.label === "UTR#:")
                        ? "bg-white"
                        : "bg-gray-200"
                        }`}
                      readOnly={
                        isEdit &&
                          (field.label === "Amount:" ||
                            field?.label === "UTR#:")
                          ? false
                          : true
                      }
                      value={field?.value}
                      onChange={(e) => {
                        if (field?.label === "Amount:") {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            total: e.target.value,
                          }));
                        } else {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            utr: e.target.value,
                          }));
                        }
                      }}
                    />
                  )}
                </div>
              ))}
              <div className="border-b w-[370px] mt-4">
                {loginType === "major" && selectedTransaction?.status === "Approved" && (selectedTransaction?.reason && selectedTransaction?.reason !== "") && !selectedTransaction?.approval && (
                  <button className="bg-[#F6790233] flex text-[#F67A03] h-[35px] items-center mb-[10px] px-[10px] rounded-[5px]">Update Information</button>
                )}
              </div>
              {selectedTransaction?.reason && selectedTransaction?.reason !== "" && (
                <div>
                  <p className="font-[600]">Reason For Decline Points:</p>
                  <p className="font-[400] text-[13px]">{selectedTransaction?.reason}</p>
                </div>
              )}

              {selectedTransaction?.transactionReason ?
                <>
                  <p className="text-[14px] font-[700]">
                    Reason for Decline Transaction
                  </p>

                  <p className="text-[14px] font-[400]">
                    {selectedTransaction?.transactionReason}
                  </p>
                </>
                : null}


              {selectedTransaction?.activity && selectedTransaction?.activity !== "" &&
                (<>
                  <p className="text-[14px] font-[700]">
                    Activity
                  </p>

                  <p className="text-[14px] font-[400]">
                    {selectedTransaction?.activity}
                  </p>
                </>)}
            </div>
            {/* Right side with border and image */}
            <div className="w-full md:w-1/2 md:border-l my-10 md:mt-0 pl-0 md:pl-6 flex flex-col justify-between items-center h-full">
              <img
                src={`${BACKEND_URL}/${selectedTransaction?.image}`}
                alt="Payment Proof"
                className="max-h-[400px]"
              />

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

export default TransactionsTable;
