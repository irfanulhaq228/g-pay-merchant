import * as XLSX from "xlsx";
import moment from "moment/moment";
import { FaBox } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiEye } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { MagnifyingGlass } from "react-loader-spinner";
import { Pagination, notification, Modal, Input, Form } from "antd";
import { fn_uploadExcelFile, fn_getUploadExcelFile, fn_singlePayout } from "../../api/api";


const Payout = ({ authorization, showSidebar }) => {
  const navigate = useNavigate();
  const [slipData, setSlipData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const containerHeight = window.innerHeight - 120;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleFileUpload = async (event) => {
    setLoading(true);
    try {
      const fileInput = event.target;
      const csv = fileInput.files[0];

      if (!csv) {
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const formData = new FormData();
          formData.append('csv', csv);

          const response = await fn_uploadExcelFile(formData);
          setLoading(false);

          if (!response.status) {
            notification.error({
              message: "Excel File Error",
              description: response.message,
              placement: "topRight",
              duration: 3
            });
            fileInput.value = "";
            return;
          }

          getExcelFile();
          notification.success({
            message: "Success",
            description: "Excel file uploaded successfully",
            placement: "topRight"
          });

          fileInput.value = "";
        } catch (err) {
          setLoading(false);
          fileInput.value = "";
          notification.error({
            message: "Error",
            description: "Failed to process Excel file",
            placement: "topRight"
          });
        }
      };
      reader.readAsArrayBuffer(csv);
    } catch (error) {
      setLoading(false);
    }
  };

  const getExcelFile = async () => {
    try {
      const response = await fn_getUploadExcelFile(currentPage);
      console.log("Excel files response:", response);
      if (response?.status) {
        console.log("Excel data:", response?.data?.data);
        setTotalPages(response?.data?.totalPages);
        setSlipData(response?.data?.data);
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
    getExcelFile();
  }, [currentPage]);

  const handleViewTransaction = (withraw) => {
    navigate("/payout-details", { state: { withraw } });
  };

  useEffect(() => {
    if (!authorization) navigate("/login");
  }, [authorization, currentPage]);

  const handleDownloadSample = () => {
    const sampleData = [
      ["Account Holder Name", "Account Number", "IFSC Number", "Amount"],
      ["Hafeez", "HBL -1234567890", "ABCD123456", 1000],
      ["Irfan", "upi@irfan.com", "-", 2000],
      ["Arbaz", "UBL-8842492", "7472784", 1500],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "sample.xlsx");
  };

  const handleCreateSinglePayout = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmitPayout = async (values) => {
    try {
      const payoutData = {
        username: values.username,
        account: values.account,
        ifsc: values.ifsc,
        amount: values.amount,
        type: "single"
      };

      const response = await fn_singlePayout(payoutData);

      if (!response.status) {
        notification.error({
          message: "Payout Error",
          description: response.message,
          placement: "topRight",
          duration: 3
        });
        return;
      }

      getExcelFile(); // Refresh the list
      notification.success({
        message: "Success",
        description: "Single payout created successfully",
        placement: "topRight"
      });

      handleModalClose();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to create single payout",
        placement: "topRight"
      });
    }
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
          <h1 className="text-[25px] font-[500]">Payout</h1>
        </div>
        <div className="bg-white rounded-lg flex justify-center items-center h-45 p-6">
          <div className="flex flex-col items-center justify-center w-full space-y-4">
            <p className="text-[18px] font-[600] text-center">
              Please Upload Your Excel Sheet Here
            </p>
            <div className="flex items-center justify-center relative">
              <label
                htmlFor="file-upload"
                className="flex items-center bg-blue-500 text-white rounded py-2 px-4 cursor-pointer gap-3"
              >
                <FiUpload />
                Choose a file
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              {loading && (
                <div className="absolute right-[-60px]">
                  <MagnifyingGlass
                    visible={true}
                    height="50"
                    width="50"
                    ariaLabel="magnifying-glass-loading"
                    wrapperStyle={{}}
                    wrapperClass="magnifying-glass-wrapper"
                    glassColor="white"
                    color="gray"
                  />
                </div>
              )}
            </div>
            <span className="text-[11px] text-[#00000040]">Excel Files Only</span>

            <button
              onClick={handleCreateSinglePayout}
              className="flex items-center bg-blue-500 text-white rounded py-2 px-4 cursor-pointer gap-2"
            >
              <FaBox />
              Create Single Payout
            </button>
            <button
              onClick={handleDownloadSample}
              className="flex items-center bg-blue-500 text-white rounded py-2 px-4 cursor-pointer gap-2"
            >
              <FiDownload />
              Download Sample File
            </button>
          </div>
        </div>

        <div className="flex justify-between my-4">
          <p className="text-black font-medium text-lg">All Payout Files</p>
        </div>
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                  <th className="p-4 text-nowrap">Payout ID</th>
                  <th className="p-4 text-nowrap">Excel File Name</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4 text-nowrap">No Of Withdraws</th>
                  <th className="p-4 cursor-pointer">Action</th>
                </tr>
              </thead>
              <tbody>
                {slipData?.length > 0 ? (
                  slipData?.map((withraw, index) => (
                    <tr
                      key={withraw?._id}
                      className="text-gray-800 text-sm border-b"
                    >
                      <td className="p-4 text-[11px] font-[600] text-[#000000B2]">
                        {withraw?.payoutId}
                      </td>
                      <td className="p-4">
                        <span className="text-[12px] font-[700] text-black whitespace-nowrap">
                          {withraw?.fileName || withraw?.csv}
                        </span>
                      </td>
                      <td className="p-4 text-[11px] font-[600] text-[#000000B2] whitespace-nowrap ">
                        {moment.utc(withraw?.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </td>
                      <td className="p-4 text-[11px] font-[600] text-[#000000B2] whitespace-nowrap ">
                        {withraw?.withdrawCount || withraw?.noOfWithdraws || withraw?.data?.length || 0}
                      </td>
                      <td className="p-4 flex space-x-2 transaction-view-model">
                        <button
                          className="bg-blue-100 text-blue-600 rounded-full px-2 py-2 mx-2"
                          title="View"
                          onClick={() => handleViewTransaction(withraw)}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No Excel Sheet File Uploaded
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

      <Modal
        title="Create Single Payout"
        open={isModalVisible}
        onCancel={handleModalClose}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitPayout}
          className="mt-4"
        >
          <Form.Item
            label="Account Holder Name"
            name="username"
            rules={[{ required: true, message: 'Please enter account holder name' }]}
          >
            <Input placeholder="Enter account holder name" className="text-[14px]" />
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="account"
            rules={[{ required: true, message: 'Please enter account number' }]}
          >
            <Input placeholder="Enter account number" className="text-[14px]" />
          </Form.Item>

          <Form.Item
            label="IFSC Number"
            name="ifsc"
            rules={[{ required: true, message: 'Please enter IFSC number' }]}
          >
            <Input placeholder="Enter IFSC number" className="text-[14px]" />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type="number" placeholder="Enter amount" className="text-[14px]" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payout;