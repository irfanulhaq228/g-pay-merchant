import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
// import ReportAnalytic from "../../assets/ReportAnalytic.svg";
import userGraph from "../../assets/userGraph.svg";
import transactionGraph from "../../assets/transactionGraph.png";
import statasticGraph from "../../assets/statasticGraph.png";
import dailyconversion from "../../assets/dailyconversion.svg";
import visitbyday from "../../assets/visitbyday.svg";
import todayincome from "../../assets/todayincome.svg";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
// } from "chart.js";
import { Bar } from "react-chartjs-2";

const ReportsAndAnalytics = ({
  setSelectedPage,
  authorization,
  showSidebar,
}) => {
  const containerHeight = window.innerHeight - 120;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const transactions = [
    {
      id: "9780924782474",
      title: "Payment Issue",
      status: "New Ticket",
      ticketOpen: "01 Jan 2024, 11:30 AM",
      ticketClose: "02 Jan 2024, 03:45 PM",
    },
    {
      id: "9879827354233",
      title: "Refund Request",
      status: "In Progress",
      ticketOpen: "02 Jan 2024, 10:00 AM",
      ticketClose: "02 Jan 2024, 02:15 PM",
    },
    {
      id: "9780924782474",
      title: "Payment Issue",
      status: "Solved",
      ticketOpen: "01 Jan 2024, 11:30 AM",
      ticketClose: "02 Jan 2024, 03:45 PM",
    },
    {
      id: "9879827354233",
      title: "Refund Request",
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
    if (!authorization) navigate("/login");
    setSelectedPage("reports-and-analytics");
  }, [searchQuery]);

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
        label: "Manual Varified",
        data: [
          15300, 5200, 17300, 18500, 5300, 17200, 12400, 7100, 14300, 13500,
          5300, 7400,
        ],
        backgroundColor: "#0C67E9",
          borderRadius: {
          topLeft: 7,
          topRight: 7,
        },
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
        barPercentage: 0.2,
        categoryPercentage: 0.9,
      },
    },
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${
        showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
      }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
          <h1 className="text-[25px] font-[500]">Reports and analytics</h1>
          <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
            Dashboard - Data Table
          </p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-[20px] font-[700]">Earning Statistic</p>
          <p className="text-[14px] font-[400]">Yearly earning overview</p>
          {/* <div className="mt-4">
            <img src={ReportAnalytic} alt="" />
          </div> */}
          <div className="w-full h-[400px] mt-4">
            <Bar data={data} options={options} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mt-5">
          {/* User Overview Graph Card*/}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h3 className="text-[20px] font-[700] mb-2">User Overview</h3>
            <div className="flex items-center justify-center">
              <img
                src={userGraph}
                alt="User Overview Graph"
                className="max-w-full"
              />
            </div>
            <div className="flex justify-between">
              <div className="w-3 h-3 mt-[3px] rounded bg-[#487FFF]"></div>
              <p className="text-[11px] font-[700] mr-24">
                <span className="text-[#00000080] font-normal">New: </span>
                <span className="font-bold">500</span>
              </p>

              <div className="w-3 h-3 mt-[3px] rounded bg-[#FF9F2A]"></div>
              <p className="text-[11px] font-[700]">
                <span className="text-[#00000080] font-normal">
                  Subscribed:
                </span>
                 300
              </p>
            </div>
          </div>

          {/* Total Transactions Graph Card*/}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h3 className="text-[20px] font-[700] mb-2">Total Transactions</h3>
            <p className="text-[10px] font-[600]">
              <span className="text-[#00000080] font-normal">Total Gain: </span>
              $50,000
            </p>
            <div>
              <img
                src={transactionGraph}
                alt="Total Transactions Graph"
                className="max-w-full"
              />
            </div>
          </div>

          {/* Statistics Graph  Card*/}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h3 className="text-[20px] font-[700] mb-2">Statistics</h3>
            <div className="flex justify-between pt-5">
              <div className="">
                <p className="text-[13px]">Daily Conversions</p>
                <p className="text-[15px] font-[600]">%60</p>
              </div>
              <div className="">
                <img
                  src={dailyconversion}
                  alt="Total Transactions Graph"
                  className="max-w-full"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <div className="">
                <p className="text-[13px]">Visits By Day</p>
                <p className="text-[15px] font-[600]">₹ 20K</p>
              </div>
              <div className="">
                <img
                  src={visitbyday}
                  alt="Total Transactions Graph"
                  className="max-w-full"
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <div className="">
                <p className="text-[13px]">Today Income</p>
                <p className="text-[15px] font-[600]">₹ 550k</p>
              </div>
              <div className="">
                <img
                  src={todayincome}
                  alt="Total Transactions Graph"
                  className="max-w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAndAnalytics;
