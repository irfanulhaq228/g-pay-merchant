// import axios from "axios";
// import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import { Switch, Button, Modal, Input, notification } from "antd";

// import { Banks } from "../../json-data/banks";
// import { FiEdit, FiCamera } from "react-icons/fi";
// import upilogo2 from "../../assets/upilogo2.svg";
// import Rectangle from "../../assets/Rectangle.jpg";
// import BACKEND_URL, { fn_BankUpdate, fn_getBankByAccountTypeApi, fn_getMerchantData } from "../../api/api";

// const MerchantManagement = ({ setSelectedPage, authorization, showSidebar, permissionsData }) => {

//   const navigate = useNavigate();
//   const containerHeight = window.innerHeight - 120;
//   const [open, setOpen] = React.useState(false);
//   const [banksData, setBanksData] = useState([]);
//   const [activeTab, setActiveTab] = useState("bank");
//   const [merchantData, setMerchantData] = useState(null);
//   const [data, setData] = useState({
//     image: null,
//     bankName: "",
//     accountNo: "",
//     accountType: "",
//     iban: "",
//     accountLimit: "",
//     accountHolderName: "",
//   });
//   const [state, setState] = useState({
//     bank: "",
//   });
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editAccountId, setEditAccountId] = useState(null);
//   const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.merchantProfile?.edit : true;

//   useEffect(() => {
//     window.scroll(0, 0);
//     if (!authorization) {
//       navigate("/login");
//     }
//     setSelectedPage("merchant-profile");
//     fn_getBankByAccountType();
//   }, [activeTab]);

//   useEffect(() => {
//     const bank = Banks.find((item) => item.title === state.bank);
//     if (bank) {
//       setSelectedBank(bank);
//     }
//   }, [state.bank]);

//   useEffect(() => {
//     const fetchMerchantData = async () => {
//       const token = Cookies.get("merchantToken");
//       if (token) {
//         const result = await fn_getMerchantData();
//         if (result.status) {
//           setMerchantData(result.data?.data);
//         } else {
//           console.error(result.message);
//         }
//       }
//     };

//     fetchMerchantData();
//   }, []);

//   const handleInputChange = (evt) => {
//     const { name, value } = evt.target;
//     setState((prev) => {
//       const updateState = { ...prev, [name]: value };
//       if (name === "bank") {
//         setData((prevData) => {
//           const updatedData = {
//             ...prevData,
//             bankName: value,
//           };
//           console.log("Updated Data:", updatedData);
//           return updatedData;
//         });
//       }
//       // console.log('Updated State:', updateState);
//       return updateState;
//     });
//   };

//   const fn_getBankByAccountType = async () => {
//     const response = await fn_getBankByAccountTypeApi(activeTab.toLowerCase());
//     console.log(response);
//     if (response?.status) {
//       if (response?.data?.status === "ok") {
//         setBanksData(response?.data?.data);
//       }
//     }
//   };

//   const handleEdit = (account) => {
//     setData({
//       image: account.image,
//       bankName: account.bankName,
//       accountNo: account.accountNo,
//       iban: account.iban,
//       accountLimit: account.accountLimit,
//       accountHolderName: account.accountHolderName,
//     });
//     setEditAccountId(account._id);
//     setIsEditMode(true);
//     setOpen(true);
//   };

//   const handleAddAccount = () => {
//     setData({
//       image: null,
//       bankName: "",
//       accountNo: "",
//       accountType: "",
//       iban: "",
//       accountLimit: "",
//       accountHolderName: "",
//     });
//     setIsEditMode(false);
//     setEditAccountId(null);
//     setOpen(true);
//   };

//   const fn_submit = async () => {
//     try {
//       if (activeTab === "upi" && !data?.image) {
//         notification.error({
//           message: "Error",
//           description: "QR Code is required",
//           placement: "topRight",
//         });
//         return;
//       }

//       if (data?.bankName === "") {
//         if (activeTab === "bank") {
//           notification.error({
//             message: "Error",
//             description: "Enter Bank Name",
//             placement: "topRight",
//           });
//           return;
//         }
//       }
//       if (data?.accountNo === "") {
//         if (activeTab === "bank") {
//           notification.error({
//             message: "Error",
//             description: "Enter Account Number",
//             placement: "topRight",
//           });
//           return;
//         }
//       }
//       if (data?.iban === "") {
//         notification.error({
//           message: "Error",
//           description: `Enter ${activeTab === "bank" ? "IFSC Number" : "UPI ID"
//             }`,
//           placement: "topRight",
//         });
//         return;
//       }
//       if (data?.accountLimit === "") {
//         notification.error({
//           message: "Error",
//           description: "Enter Account Limit",
//           placement: "topRight",
//         });
//         return;
//       }
//       if (data?.accountHolderName === "") {
//         notification.error({
//           message: "Error",
//           description: "Enter Account Holder Name",
//           placement: "topRight",
//         });
//         return;
//       }
//       const formData = new FormData();
//       if (activeTab === "bank") {
//         // Bank account - QR is optional
//         if (data?.image) {
//           formData.append("image", data?.image);
//         }
//         formData.append("bankName", data?.bankName);
//         formData.append("accountNo", data?.accountNo);
//         formData.append("accountType", activeTab);
//         formData.append("iban", data?.iban);
//         formData.append("accountLimit", data?.accountLimit);
//         formData.append("accountHolderName", data?.accountHolderName);
//         formData.append("block", true);
//       } else {
//         // UPI account - QR is mandatory
//         if (!data?.image) return;
//         formData.append("image", data?.image);
//         formData.append("accountType", activeTab);
//         formData.append("iban", data?.iban);
//         formData.append("accountLimit", data?.accountLimit);
//         formData.append("accountHolderName", data?.accountHolderName);
//         formData.append("block", true);
//       }
//       const token = Cookies.get("merchantToken");
//       let response;
//       if (isEditMode) {
//         response = await axios.put(
//           `${BACKEND_URL}/bank/update/${editAccountId}`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       } else {
//         response = await axios.post(`${BACKEND_URL}/bank/create`, formData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//       }
//       if (response?.status === 200) {
//         setOpen(false);
//         notification.success({
//           message: "Success",
//           description: isEditMode
//             ? "Bank Updated Successfully!"
//             : "Bank Created Successfully!",
//           placement: "topRight",
//         });
//         setData({
//           image: null,
//           bankName: "",
//           accountNo: "",
//           iban: "",
//           accountLimit: "",
//           accountHolderName: "",
//         });
//         setIsEditMode(false);
//         setEditAccountId(null);
//         fn_getBankByAccountType();
//       }
//     } catch (error) {
//       const errorMessage = error?.response?.data?.message || "Network Error";
//       notification.error({
//         message: "Error",
//         description: errorMessage,
//         placement: "topRight",
//       });
//     }
//   };

//   const handleProfileImageUpdate = async (file) => {
//     try {
//       const formData = new FormData();
//       formData.append('image', file);

//       const token = Cookies.get("merchantToken");
//       const response = await axios.put(
//         `${BACKEND_URL}/merchant/update/${merchantData?._id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response?.status === 200) {
//         notification.success({
//           message: "Success",
//           description: "Profile image updated successfully!",
//           placement: "topRight",
//         });
//         const result = await fn_getMerchantData();
//         if (result.status) {
//           setMerchantData(result.data?.data);
//         }
//       }
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: error?.response?.data?.message || "Failed to update profile image",
//         placement: "topRight",
//       });
//     }
//   };

//   console.log("merchantData ", merchantData);

//   return (
//     <div
//       className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
//         }`}
//       style={{ minHeight: `${containerHeight}px` }}
//     >
//       <div className="p-7">
//         {/* header */}
//         <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
//           <h1 className="text-[25px] font-[500]">Banks Details</h1>
//           <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
//             Dashboard - Data Table
//           </p>
//         </div>
//         <div className="flex flex-col gap-7 md:flex-row bg-gray-100 ">
//           {/* Left side card section */}
//           <div className="w-full md:w-2/6 bg-white rounded-lg lg:min-h-[550px] shadow-md border">
//             <div className="flex flex-col z-[-1] items-center">
//               <img
//                 src={Rectangle}
//                 alt="image"
//                 className="h-[130px] object-cover w-full rounded-t-lg"
//               />
//               <div
//                 className="w-[150px] h-[150px] rounded-full flex justify-center items-center bg-white mt-[-75px] z-[9] relative"
//                 style={{ boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)" }}
//               >
//                 <img
//                   src={`${BACKEND_URL}/${merchantData?.image}`}
//                   alt="logo"
//                   className="w-[100px]"
//                 />
//                 <div
//                   className="absolute bottom-2 right-2 w-[35px] h-[35px] bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
//                   onClick={() => {
//                     const input = document.createElement('input');
//                     input.type = 'file';
//                     input.accept = 'image/*';
//                     input.onchange = async (e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         await handleProfileImageUpdate(file);
//                       }
//                     };
//                     input.click();
//                   }}
//                 >
//                   <FiCamera className="text-gray-600 text-xl" />
//                 </div>
//               </div>
//             </div>
//             <p className="text-gray-500 text-[19px] font-[600] text-center mt-4">
//               {merchantData?.merchantName}
//             </p>
//             <div className="m-3 mt-6">
//               <h3 className="text-[16px] font-[600] border-b pb-2">
//                 Personal Info
//               </h3>
//               <div className="space-y-3 pt-3">
//                 {/* <div className="flex">
//                   <span className="text-[12px]">{merchantData?.name}</span>
//                 </div> */}
//                 <div className="flex">
//                   <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px] ">
//                     Email:
//                   </span>
//                   <span className="text-[12px]">{merchantData?.email}</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px]">
//                     Phone:
//                   </span>
//                   <span className="text-[12px]">{merchantData?.phone}</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-[12px] font-[600] min-w-[105px] max-w-[105px]">
//                     Website:
//                   </span>
//                   <span className="text-[12px]">{merchantData?.website}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Right side Card */}
//           <div className="w-full md:w-3/4 lg:min-h-[550px] bg-white rounded-lg shadow-md border">
//             {/* Header */}
//             <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b space-y-4 md:space-y-0">
//               {/* Tab Buttons */}
//               <div className="w-full md:w-auto">
//                 <button
//                   className="text-[14px] font-[600] px-4 py-2 w-full md:w-auto border-t"
//                   style={{
//                     backgroundImage:
//                       activeTab === "bank"
//                         ? "linear-gradient(rgba(8, 100, 232, 0.1), rgba(115, 115, 115, 0))"
//                         : "none",
//                   }}
//                   onClick={() => setActiveTab("bank")}
//                 >
//                   Bank Accounts
//                 </button>
//                 <button
//                   className="text-[14px] font-[600] px-4 py-2 w-full md:w-auto border-t"
//                   style={{
//                     backgroundImage:
//                       activeTab === "upi"
//                         ? "linear-gradient(rgba(8, 100, 232, 0.1), rgba(115, 115, 115, 0))"
//                         : "none",
//                   }}
//                   onClick={() => setActiveTab("upi")}
//                 >
//                   UPI Accounts
//                 </button>
//               </div>

//               <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
//                 {editablePermission && (
//                   <Button type="primary" onClick={handleAddAccount}>
//                     Add Account
//                   </Button>
//                 )}
//                 <Modal
//                   centered
//                   width={600}
//                   style={{ fontFamily: "sans-serif" }}
//                   title={
//                     <p className="text-[16px] font-[700]">
//                       {isEditMode
//                         ? "Edit Your Bank Account"
//                         : "Add New Bank Account"}
//                     </p>
//                   }
//                   footer={
//                     <div className="flex gap-4 mt-6">
//                       <Button
//                         className="flex start px-10 text-[12px]"
//                         type="primary"
//                         onClick={fn_submit}
//                       >
//                         Save
//                       </Button>

//                       <Button
//                         className="flex start px-10 bg-white text-[#FF3D5C] border border-[#FF7A8F] text-[12px]"
//                         type=""
//                         onClick={() => setOpen(false)}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   }
//                   open={open}
//                   onCancel={() => setOpen(false)}
//                   onClose={() => setOpen(false)}
//                 >
//                   {activeTab === "bank" && (
//                     <>
//                       {/* bank image */}
//                       {selectedBank && (
//                         <div className="w-[120px] h-[120px]">
//                           <img alt="" src={selectedBank?.img} />
//                         </div>
//                       )}
//                       <div className="flex gap-4 ">
//                         {/* bank name */}
//                         <div className="flex-1 my-2">
//                           <p className="text-[12px] font-[500] pb-1">
//                             Bank Name <span className="text-[#D50000]">*</span>
//                           </p>
//                           <select
//                             name="bank"
//                             value={data?.bankName || ""}
//                             onChange={handleInputChange}
//                             className="w-full  text-[12px] border border-[#d9d9d9] h-[28.84px] px-[11px] py-[4px] rounded-[6px]"
//                           >
//                             <option value="" disabled>
//                               ---Select Bank---
//                             </option>
//                             {Banks.map((item, index) => (
//                               <option key={index} value={item.title}>
//                                 {item.title}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                         {/* Account Number */}
//                         <div className="flex-1 my-2">
//                           <p className="text-[12px] font-[500] pb-1">
//                             Account Number{" "}
//                             <span className="text-[#D50000]">*</span>
//                           </p>
//                           <Input
//                             value={data?.accountNo}
//                             onChange={(e) =>
//                               setData((prev) => ({
//                                 ...prev,
//                                 accountNo: e.target.value,
//                               }))
//                             }
//                             className="w-full  text-[12px]"
//                             placeholder="Enter Account Number"
//                           />
//                         </div>
//                       </div>
//                     </>
//                   )}
//                   <div className="flex gap-4">
//                     {/* IFCS No. */}
//                     <div className="flex-1 my-2">
//                       <p className="text-[12px] font-[500] pb-1">
//                         {activeTab === "bank" ? (
//                           <>
//                             IFSC No. <span className="text-[#D50000]">*</span>
//                           </>
//                         ) : (
//                           <>
//                             UPI ID <span className="text-[#D50000]">*</span>
//                           </>
//                         )}
//                       </p>
//                       <Input
//                         value={data?.iban}
//                         onChange={(e) =>
//                           setData((prev) => ({
//                             ...prev,
//                             iban: e.target.value,
//                           }))
//                         }
//                         className="w-full text-[12px]"
//                         placeholder={`${activeTab === "bank"
//                           ? "Enter IFSC Number"
//                           : "Enter UPI ID"
//                           }`}
//                       />
//                     </div>
//                     {/* account Holder Name */}
//                     <div className="flex-1 my-2">
//                       <p className="text-[12px] font-[500] pb-1">
//                         Account Holder Name{" "}
//                         <span className="text-[#D50000]">*</span>
//                       </p>
//                       <Input
//                         value={data?.accountHolderName}
//                         onChange={(e) =>
//                           setData((prev) => ({
//                             ...prev,
//                             accountHolderName: e.target.value,
//                           }))
//                         }
//                         className="w-full text-[12px]"
//                         placeholder="Account Holder Name"
//                       />
//                     </div>
//                   </div>
//                   <div className="flex gap-4">
//                     {/* Account Limit */}
//                     <div className="flex-1 my-2">
//                       <p className="text-[12px] font-[500] pb-1">
//                         Account Limit <span className="text-[#D50000]">*</span>
//                       </p>
//                       <Input
//                         value={data?.accountLimit}
//                         onChange={(e) =>
//                           setData((prev) => ({
//                             ...prev,
//                             accountLimit: e.target.value,
//                           }))
//                         }
//                         className="w-full text-[12px]"
//                         placeholder="Account Limit "
//                       />
//                     </div>
//                     {/* Account QR Code - only show for UPI */}
//                     {activeTab === "upi" && (
//                       <div className="flex-1 my-2">
//                         <p className="text-[12px] font-[500] pb-1">
//                           UPI QR Code <span className="text-[#D50000]">*</span>
//                         </p>
//                         <Input
//                           type="file"
//                           required
//                           onChange={(e) => {
//                             setData((prev) => ({
//                               ...prev,
//                               image: e.target.files[0],
//                             }));
//                           }}
//                           className="w-full text-[12px]"
//                           placeholder="Select QR Code"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </Modal>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-[#ECF0FA]">
//                   <tr>
//                     <th className="p-3 text-[13px] font-[600] text-nowrap">
//                       Bank Name
//                     </th>
//                     <th className="pl-20 text-[13px] font-[600] text-nowrap">
//                       {activeTab === "upi" ? "UPI ID" : "IFSC"}
//                     </th>
//                     <th className="p-5 text-[13px] font-[600] whitespace-nowrap">
//                       Account Title
//                     </th>
//                     <th className="p-5 text-[13px] font-[600]">Limit</th>
//                     <th className="p-5 text-[13px] font-[600] text-nowrap">
//                       Remaining Limit
//                     </th>
//                     <th className="p-5 text-[13px] font-[600]">Status</th>
//                     <th className="p-5 text-[13px] font-[600] pl-10">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {banksData.map((account, index) => {
//                     return (
//                       <tr
//                         key={index}
//                         className={`border-t border-b ${index % 2 === 0 ? "bg-white" : ""
//                           }`}
//                       >
//                         <td className="p-3 text-[13px] font-[600]">
//                           <div className="flex items-center space-x-2 flex-wrap md:flex-nowrap">
//                             {activeTab === "bank" ? (
//                               <div className="flex items-center gap-[3px]">
//                                 <img
//                                   src={
//                                     Banks?.find(
//                                       (bank) =>
//                                         bank?.title === account?.bankName
//                                     )?.img
//                                   }
//                                   alt=""
//                                   className="w-[50px]"
//                                 />
//                                 <span className="whitespace-nowrap">
//                                   {account.bankName}
//                                 </span>
//                               </div>
//                             ) : (
//                               <img src={upilogo2} alt="" className="w-[50px]" />
//                             )}
//                           </div>
//                         </td>
//                         <td className="p-3 text-[13px]">
//                           <div className="ml-14">
//                             {" "}
//                             <span className="whitespace-nowrap">
//                               {account.iban}
//                             </span>
//                             {activeTab === "upi" && (
//                               <div className="text-[12px] text-gray-600 mt-1">
//                                 {account.UPIID}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="p-3 text-[13px] whitespace-nowrap">
//                           <div className="ml-2">
//                             {account.accountHolderName}
//                           </div>
//                         </td>
//                         <td className="p-3 text-[13px] font-[400] text-nowrap">
//                           <div className="ml-1">₹ {account.accountLimit}</div>
//                         </td>
//                         <td className="p-3 text-[13px] font-[400]">
//                           <div className="ml-3">₹ {account.remainingLimit}</div>
//                         </td>
//                         <td className="text-center">
//                           <button
//                             className={`px-3 py-[5px]  rounded-[20px] w-20 flex items-center justify-center text-[11px] font-[500] ${account?.block === false
//                               ? "bg-[#10CB0026] text-[#0DA000]"
//                               : "bg-[#FF173D33] text-[#D50000]"
//                               }`}
//                           >
//                             {!account?.block ? "Active" : "Inactive"}
//                           </button>
//                         </td>
//                         <td className="p-3 text-center">
//                           <div className="flex justify-center items-center ml-6">
//                             {editablePermission && (
//                               <>
//                                 <Switch
//                                   size="small"
//                                   checked={!account?.block}
//                                   onChange={async (checked) => {
//                                     const newStatus = checked;
//                                     const response = await fn_BankUpdate(
//                                       account?._id,
//                                       {
//                                         block: !newStatus,
//                                         accountType: activeTab,
//                                       }
//                                     );

//                                     if (response?.status) {
//                                       fn_getBankByAccountType();
//                                       notification.success({
//                                         message: "Status Updated",
//                                         description: `Bank Status Updated!.`,
//                                         placement: "topRight",
//                                       });
//                                     } else {
//                                       notification.error({
//                                         message: "Error",
//                                         description:
//                                           response.message ||
//                                           "Failed to update bank status.",
//                                         placement: "topRight",
//                                       });
//                                     }
//                                   }}
//                                 />
//                                 <Button
//                                   className="bg-green-100 text-green-600 rounded-full px-2 py-2 mx-2"
//                                   title="Edit"
//                                   onClick={() => handleEdit(account)}
//                                 >
//                                   <FiEdit />
//                                 </Button>
//                               </>
//                             )}
//                             {!editablePermission && (
//                               <p className="italic text-[12px] text-red-500 mt-[2px] text-nowrap">Action Not Allowed</p>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MerchantManagement;










