import React, { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { TbArrowBack } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Input } from "antd";

const SupportHelpCenter = ({ setSelectedPage, authorization, showSidebar }) => {
  const containerHeight = window.innerHeight - 120;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const { TextArea } = Input;
  const navigate = useNavigate();

  const transactions = [
    {
      id: "9780924782474",
      title: "Receipt Issue",
      status: "New Ticket",
      ticketOpen: "01 Jan 2024, 11:30 AM",
      ticketClose: "02 Jan 2024, 03:45 PM",
    },
    {
      id: "9879827354233",
      title: "Payment Failed",
      status: "In Progress",
      ticketOpen: "02 Jan 2024, 10:00 AM",
      ticketClose: "02 Jan 2024, 02:15 PM",
    },
    {
      id: "9780924782474",
      title: "Account Logins",
      status: "Solved",
      ticketOpen: "01 Jan 2024, 11:30 AM",
      ticketClose: "02 Jan 2024, 03:45 PM",
    },
    {
      id: "9879827354233",
      title: "Balance Declined",
      status: "In Progress",
      ticketOpen: "02 Jan 2024, 10:00 AM",
      ticketClose: "02 Jan 2024, 02:15 PM",
    },
  ];

  const getStatusClass = (status) => {
    const statusClasses = {
      "New Ticket":
        "bg-[#00000080] text-white px-2  rounded-full text-[11px] font-[500] ",
      "In Progress":
        "bg-[#0864E833] text-[#0864E8] px-2  rounded-full text-[11px] font-[500] ",
      Solved:
        "bg-green-100 text-green-800 px-[18px]  rounded-full text-[11px] font-[500] ",
    };
    return (
      statusClasses[status] ||
      "bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium"
    );
  };

  const handleSearch = () => {
    const filtered = transactions.filter((transaction) =>
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    handleSearch();
    if(!authorization) navigate("/login");
    setSelectedPage("help-center")
  }, [searchQuery]);

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${
        showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
      }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
          <h1 className="text-[25px] font-[500]">Support / Help Center</h1>
          <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
            Dashboard - Data Table
          </p>
        </div>
        <div className="bg-white rounded-lg p-4">
          {/* Input Fields */}
          <div className="flex flex-col gap-4">
            {/* First Row: Name and Email */}
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                Full Name <span className="text-[#FF173D]">*</span>
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Full Name" />
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                Email Address *
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Email Address" />
              </div>
            </div>

            {/* Second Row: Phone and City */}
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                  Phone 
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Phone Number" />
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                  City
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Your City Name" />
              </div>
            </div>

            {/* Third Row: State and ZIP Code */}
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                  State <span className="text-[#FF173D]">*</span>
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Your Country Name" />
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-black text-[12px] font-[600]">
                  Zip Code <span className="text-[#FF173D]">*</span>
                </label>
                <Input className="mt-1 text-[12px]" placeholder="Enter Your City Name" />
              </div>
            </div>

            {/* Full Row: Address */}
            <div className="flex flex-col">
              <label className="text-black text-[12px] font-[600]">
                Address
              </label>
              <Input className="mt-1 text-[12px]" placeholder="Enter your address" />
            </div>

            {/* Full Row: Description */}
            <div className="flex flex-col">
              <label className="text-black text-[12px] font-[600]">
                Description
              </label>
              <textarea
                className="mt-1 p-2 text-[12px] border rounded outline-none resize-none"
                rows={4}
                placeholder="Write description....."
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button className="flex start px-10 text-[11px]" type="primary">
              Save
            </Button>
            <Button
              className="flex start px-10 bg-white text-[#FF3D5C] border border-[#FF7A8F] text-[11px]"
              type=""
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-black text-[15px] font-[600]">Tickets</p>
            <Button type="primary" onClick={() => setOpen(true)}>
              Add New Ticket
            </Button>
          </div>
          <Modal
            centered
            width={600}
            title={<p className="text-[16px] font-[700]">Add New Ticket</p>}
            footer={
              <Button className="px-10" type="primary">
                Save
              </Button>
            }
            open={open}
            onCancel={() => setOpen(false)}
          >
            <p className="text-[12px] font-[500] pb-1">Subject</p>
            <Input className="text-[12px]" placeholder="Choose a subject" />
            <p className="text-[12px] font-[500] pt-4 pb-1">Description</p>
            <TextArea
              className="text-[12px]"
              rows={6}
              placeholder="Please describe your issue"
              maxLength={50}
            />
          </Modal>
          <div className="bg-white rounded-lg mt-2">
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                    <th className="p-4 whitespace-nowrap">Ticket ID</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                    <th className="p-4 whitespace-nowrap">Title</th>
                    <th className="p-4 whitespace-nowrap">Ticket Open</th>
                    <th className="p-4 whitespace-nowrap">Ticket Close</th>
                    <th className="p-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="text-gray-800 text-sm border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-[11px] font-[600] whitespace-nowrap">
                          {transaction.id}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`${getStatusClass(
                              transaction.status
                            )} inline-block`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] font-[600] whitespace-nowrap text-ellipsis overflow-hidden">
                          {transaction.title}
                        </td>
                        <td className="p-4 text-[11px] font-[600] whitespace-nowrap">
                          {transaction.ticketOpen}
                        </td>
                        <td className="p-4 text-[11px] font-[600] whitespace-nowrap">
                          {transaction.ticketClose}
                        </td>
                        <td className="p-3 flex space-x-2 whitespace-nowrap">
                          <button className="bg-blue-100 text-blue-600 rounded-full px-2 py-2">
                            <TbArrowBack />
                          </button>
                          <button className="bg-green-100 text-green-600 rounded-full px-2 py-2">
                            <FiCheck />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHelpCenter;
