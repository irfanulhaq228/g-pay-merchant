import axios from "axios";
import "jspdf-autotable";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, DatePicker, notification, Select, Space, Table, Modal } from "antd";
import * as XLSX from "xlsx";

import { FaDownload } from "react-icons/fa6";

import BACKEND_URL, { fn_getAllBanksData2 } from "../../api/api";

const columns = [
    {
        title: 'Sr No',
        dataIndex: 'reportId',
        key: 'reportId',
    },
    {
        title: 'Creation Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
    },
    // {
    //     title: 'Merchant',
    //     dataIndex: 'merchant',
    //     key: 'merchant',
    // },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'Date Range',
        dataIndex: 'dateRange',
        key: 'dateRange',
    }
];

const Reports = ({ authorization, showSidebar }) => {

    const navigate = useNavigate();
    const { RangePicker } = DatePicker;

    const containerHeight = window.innerHeight - 120;
    const statusOptions = [
        { label: "All", value: "" },
        { label: "Approved", value: "Approved" },
        { label: "Pending", value: "Pending" },
        { label: "Decline", value: "Decline" },
    ];

    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [dateRange, setDateRange] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
    const selectedMerchantName = localStorage.getItem('userName');

    useEffect(() => {
        window.scroll(0, 0);
        if (!authorization) {
            navigate("/login");
        }
        // Initial load of data
        fn_getReportsLog();
    }, [authorization]);

    useEffect(() => {
        // This effect will handle both status and date range changes
        fn_getReportsLog();
    }, [selectedStatus, dateRange]);

    const fn_changeStatus = (value) => {
        setSelectedStatus(value || ""); // Ensure we handle null/undefined when clearing
    };

    const fn_submit = async () => {
        try {
            if (!dateRange || !dateRange[0] || !dateRange[1]) {
                notification.error({
                    message: "Error",
                    description: "Please Select Date Range",
                    placement: "topRight",
                });
                return;
            }

            const token = Cookies.get("merchantToken");
            const merchantId = Cookies.get("merchantId");

            const startDate = new Date(dateRange[0].$d);
            const endDate = new Date(dateRange[1].$d);
            
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            const startISOString = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
            const endISOString = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();

            const queryParams = new URLSearchParams({
                merchantId: `["${merchantId}"]`,
                status: selectedStatus,
                startDate: startISOString,
                endDate: endISOString,
                filterByMerchantId: merchantId
            });

            const response = await axios.get(
                `${BACKEND_URL}/ledger/transactionSummaryTest?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data?.status === "ok") {
                setReportData(response.data);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error generating report:", error);
            notification.error({
                message: "Error",
                description: "Failed to generate report",
                placement: "topRight"
            });
        }
    };

    const handleDownload = (type) => {
        if (type === 'pdf') {
            downloadPDF(reportData);
        } else {
            downloadExcel(reportData);
        }
        fn_getReportsLog();
        setIsModalOpen(false);
        setReportData(null);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setReportData(null);
    };

    const downloadPDF = (data) => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4"
        });

        // Add title and timestamp
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("Transactions Report", doc.internal.pageSize.width / 2, 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${moment().format('M/D/YYYY, h:mm:ss A')}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });

        const tableColumn = [
            "Date",
            "Trn Status",
            "No. of Transactions",
            "PayIn (INR)",
            "Payout (INR)", 
            "Charges (INR)",
            "Net Amount (INR)"
        ];

        // Calculate total transactions (PayIn + Payout)
        const totalTransactions = (data?.payIn?.totalTransaction || 0) + (data?.payout?.totalTransaction || 0);

        const tableRows = data?.data?.map((item) => {
            const isPayIn = item.Type === "payIn";
            return [
                item.Date || "All",
                (!item.Status || item.Status === "") ? "All" : item.Status,
                item.NoOfTransaction || "0",
                isPayIn ? (Number(item.PayIn || 0) > 0 ? Number(item.PayIn).toFixed(2) : "-") : "-",
                !isPayIn ? (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-") : "-",
                isPayIn ? (Number(item.Charges || 0) > 0 ? Number(item.Charges).toFixed(2) : "-") : "-",
                isPayIn ? (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-") : 
                         (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-"),
            ];
        }) || [];

        // Add totals row
        tableRows.push([
            "SUBTOTAL",
            "",
            totalTransactions.toString(),
            Number(data.payIn?.totalPayIn || 0).toFixed(2),
            Number(data.payout?.totalAmount || 0).toFixed(2), 
            Number((data.payIn?.totalCharges || 0) + (data.payout?.totalCharges || 0)).toFixed(2),
            Number((data.payIn?.totalAmount || 0) + (data.payout?.totalAmount || 0)).toFixed(2)
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10 },
            theme: "",
            margin: { top: 70 }, // Increased top margin to accommodate the title
            didDrawCell: (data) => {
                // Add blue background to the total row
                if (data.row.index === tableRows.length - 1) {
                    const cell = data.cell;
                    doc.setFillColor(220, 220, 240); // Light purple color
                    doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
                    doc.setTextColor(0, 0, 0);
                    doc.text(cell.text, cell.x + cell.padding('left'), cell.y + cell.padding('top') + cell.styles.fontSize * 0.4);
                    return false;
                }
            }
        });

        doc.save("report.pdf");
    };

    const downloadExcel = (data) => {
        const tableRows = data?.data?.map((item) => {
            const isPayIn = item.Type === "payIn";
            return {
                Date: item.Date || "All",
                Status: (!item.Status || item.Status === "") ? "All" : item.Status,
                "No. of Transactions": item.NoOfTransaction || "0",
                "PayIn (INR)": isPayIn ? (Number(item.PayIn || 0) > 0 ? Number(item.PayIn).toFixed(2) : "-") : "-",
                "Payout (INR)": !isPayIn ? (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-") : "-",
                "Charges (INR)": isPayIn ? (Number(item.Charges || 0) > 0 ? Number(item.Charges).toFixed(2) : "-") : "-",
                "Net Amount (INR)": isPayIn ? (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-") : 
                                   (Number(item.Amount || 0) > 0 ? Number(item.Amount).toFixed(2) : "-"),
            };
        }) || [];

        // Calculate total transactions
        const totalTransactions = (data.payIn?.totalTransaction || 0) + (data.payout?.totalTransaction || 0);

        // Add totals row
        tableRows.push({
            Date: "Total",
            Status: "",
            "No. of Transactions": totalTransactions.toString(),
            "PayIn (INR)": Number(data.payIn?.totalPayIn || 0).toFixed(2),
            "Payout (INR)": Number(data.payout?.totalAmount || 0).toFixed(2),
            "Charges (INR)": Number((data.payIn?.totalCharges || 0) + (data.payout?.totalCharges || 0)).toFixed(2),
            "Net Amount (INR)": Number((data.payIn?.totalAmount || 0) + (data.payout?.totalAmount || 0)).toFixed(2)
        });

        const worksheet = XLSX.utils.json_to_sheet(tableRows);
        const workbook = XLSX.utils.book_new();

        // Style the total row
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const totalRowIndex = range.e.r;
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
            if (!worksheet[cellRef]) worksheet[cellRef] = {};
            worksheet[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "DCDCF0" } }, // Light purple background
            };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "report.xlsx");
    };

    const fn_getReportsLog = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("merchantToken");
            const merchantId = Cookies.get("merchantId");

            const queryParams = new URLSearchParams({
                filterByMerchantId: merchantId
            });

            // Only add status if it's not empty
            if (selectedStatus !== "") {
                queryParams.append("status", selectedStatus);
            }

            // Add date range if selected
            if (dateRange && dateRange[0] && dateRange[1]) {
                const startDate = new Date(dateRange[0].$d);
                const endDate = new Date(dateRange[1].$d);
                
                // Set start date to beginning of day
                startDate.setHours(0, 0, 0, 0);
                
                // Set end date to end of day
                endDate.setHours(23, 59, 59, 999);
                
                const startISOString = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
                const endISOString = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();
                
                queryParams.append("startDate", startISOString);
                queryParams.append("endDate", endISOString);
            }

            const url = `${BACKEND_URL}/ledgerLog/getAll?${queryParams.toString()}`;
            console.log('Fetching reports with URL:', url); // Debug log

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response?.data?.status === "ok") {
                const formattedData = response?.data?.data?.map((item, index) => {
                    const startDate = new Date(item?.startDate);
                    const endDate = new Date(item?.endDate);
                    
                    return {
                        key: `${index + 1}`,
                        reportId: `${index + 1}`,
                        createdAt: `${moment.utc(item?.createdAt).format('DD MMM YYYY, hh:mm A')}`,
                        status: item?.status || "All",
                        dateRange: item?.startDate && item?.endDate 
                            ? `${startDate.getUTCDate()} ${getMonthName(startDate.getUTCMonth())} ${startDate.getUTCFullYear()} - ${endDate.getUTCDate()} ${getMonthName(endDate.getUTCMonth())} ${endDate.getUTCFullYear()}`
                            : "All"
                    };
                });
                setTableData(formattedData || []);
            } else {
                notification.error({
                    message: "Error",
                    description: response?.data?.message || "Failed to fetch reports",
                    placement: "topRight"
                });
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            notification.error({
                message: "Error",
                description: "Failed to fetch reports",
                placement: "topRight"
            });
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (monthIndex) => {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return monthNames[monthIndex];
    };

    return (
        <div
            style={{ minHeight: `${containerHeight}px` }}
            className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"}`}
        >
            <div className="p-7">
                <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
                    <h1 className="text-[20px] md:text-[25px] font-[500]">
                        Reports
                    </h1>
                    <p
                        onClick={() => navigate("/SystemConfigurationIntegration")}
                        className="text-[#7987A1] text-[13px] md:text-[15px] font-[400] cursor-pointer"
                    >
                        Dashboard - Reports
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-[20px]">
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-[13px] font-[500]">Select Status</p>
                        <Select
                            style={{ width: '100%', height: "38px" }}
                            placeholder="Please Select Status"
                            onChange={fn_changeStatus}
                            value={selectedStatus}
                            options={statusOptions}
                            allowClear
                        />
                    </div>
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-[13px] font-[500]">Select Date Range</p>
                        <Space direction="vertical" size={10}>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates)}
                                style={{ width: "100%", height: "38px" }}
                                format="DD/MM/YYYY"
                                placeholder={["Start Date", "End Date"]}
                                allowClear
                            />
                        </Space>
                    </div>
                </div>
                <div className="flex justify-end mt-[20px]">
                    <Button 
                        type="primary" 
                        className="h-[38px] w-[200px]" 
                        onClick={fn_submit}
                    >
                        <FaDownload /> Download Report
                    </Button>
                </div>
                <div className="w-full bg-[white] mt-[30px]">
                    <Table 
                        dataSource={tableData} 
                        columns={columns} 
                        loading={loading}
                    />
                </div>
            </div>
            <Modal
                title="Select Download Format"
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
            >
                <div className="flex justify-center gap-4 py-4">
                    <Button type="primary" onClick={() => handleDownload('pdf')} icon={<FaDownload />}>
                        Download PDF
                    </Button>
                    <Button type="primary" onClick={() => handleDownload('excel')} icon={<FaDownload />}>
                        Download Excel
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Reports;





