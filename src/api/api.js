import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment/moment";

export const BACKEND_URL = "https://backend.gpay.one";
// export const BACKEND_URL = "http://46.202.166.64:8015";
export const PDF_READ_URL = "https://pdf.royal247.org/parse-statement"

// ------------------------------------- Merchant Login api------------------------------------
export const fn_loginMerchantApi = async (data) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/merchant/login`, data);
        if (response?.status === 200) {
            return { status: true, message: "OTP sents to Email" }
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

export const fn_otpVerifyApi = async (data, setPermissionsData) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/merchant/login`, data);

        let id; let type; let message; let website; let permissions; let merchantVerified;
        let token = response?.data?.token;

        if (response?.data?.type === "merchant") {
            type = "merchant";
            id = response?.data?.data?._id;
            website = response?.data?.data?.website;
            message = "Merchant Logged in successfully";
            merchantVerified = response?.data?.data?.verify;
            localStorage.setItem("userName", response?.data?.data?.merchantName);
        } else {
            type = response?.data?.data?.type;
            message = "Logged in successfully";
            id = response?.data?.data?.merchantId?._id;
            website = response?.data?.data?.merchantId?.website;
            merchantVerified = response?.data?.data?.merchantId?.verify;

            permissions = {
                userName: response?.data?.data?.userName,
                email: response?.data?.data?.email,
                dashboard: response?.data?.data?.dashboard,
                transactionHistory: response?.data?.data?.transactionHistory,
                directPayment: response?.data?.data?.directPayment,
                approvalPoints: response?.data?.data?.approvalPoints,
                merchantProfile: response?.data?.data?.merchantProfile,
                reportsAnalytics: response?.data?.data?.reportsAnalytics,
                support: response?.data?.data?.support,
                uploadStatement: response?.data?.data?.uploadStatement,
            };
            setPermissionsData(permissions);
            localStorage.setItem("permissions", JSON.stringify(permissions));
            localStorage.setItem("userName", response?.data?.data?.userName);
            localStorage.setItem("email", response?.data?.data?.email);
        };
        Cookies.set("merchantId", id);
        Cookies.set("loginType", type);
        Cookies.set("website", website);
        Cookies.set("merchantToken", token);
        localStorage.setItem("merchantVerified", merchantVerified);

        return { id: id, type: type, status: true, token: token, message: message, website: website, permissions: permissions, merchantVerified: merchantVerified };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};


// ------------------------------------- staff Login api------------------------------------
export const fn_loginStaffApi = async (data) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/staff/login`, data);
        console.log(response)
        const token = response?.data?.token;
        const id = response?.data?.data?.merchantId;
        if (response?.data?.data?.block) {
            return {
                status: false,
                message: "Staff is blocked by merchat",
            };
        }
        const merchantVerified = true;
        return {
            status: true,
            message: "Staff Logged in successfully",
            token: token,
            id: id,
            merchantVerified: merchantVerified,
            data: response?.data?.data
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// ------------------------------------- Merchant Login History api----------------------------
export const fn_getMerchantLoginHistoryApi = async (MerchantId) => {
    try {
        const token = Cookies.get('merchantToken');
        const response = await axios.get(`${BACKEND_URL}/loginHistory/getAll`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            status: true,
            message: "Data Fetched Successfully",
            data: response?.data?.data
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// ------------------------------------- Update Api Keys api------------------------------------
export const fn_updateApiKeys = async (apiKey, secretKey) => {
    try {
        const token = Cookies.get("merchantToken");
        const formData = new FormData;
        formData.append('apiKey', apiKey)
        formData.append('secretKey', secretKey)
        const response = await axios.post(`${BACKEND_URL}/merchant/verify`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            message: "Merchant Verified Successfully",
            data: response
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// ------------------------------------- Get API Keys api---------------------------------------
export const fn_getApiKeys = async () => {
    try {
        const merchantId = Cookies.get("merchantId");
        const response = await axios.get(`${BACKEND_URL}/merchant/get/${merchantId}`);
        return { status: true, data: response.data };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// ------------------------------------- Get Bank Account api-----------------------------------
export const fn_getBankByAccountTypeApi = async (accountType) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/withdrawBank/getAll?accountType=${accountType}`, // accountType="bank","upi"
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response?.data,
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// ------------------------------------- Bank Update api----------------------------------------
export const fn_BankUpdate = async (id, data) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.put(`${BACKEND_URL}/withdrawBank/update/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return { status: false, message: error?.response?.data?.message };
        }
        return { status: false, message: "Network Error" };
    }
};

// -------------------------------- get All Merchant api----------------------------------------
export const fn_getAllMerchantApi = async (status, pageNumber, merchant, searchQuery, searchTrnId, bankId, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams();

        // Add required parameters
        queryParams.append("page", pageNumber || 1);
        queryParams.append("type", "manual");

        // Add optional parameters only if they have values
        if (status) queryParams.append("status", status);
        if (merchant) queryParams.append("trnStatus", merchant);
        if (searchQuery) queryParams.append("search", searchQuery);
        if (searchTrnId) queryParams.append("trnNo", searchTrnId);
        if (bankId) queryParams.append("bankId", bankId);

        // Add date range parameters if provided
        if (dateRange?.startDate) {
            console.log('Adding startDate to query:', dateRange.startDate);
            queryParams.append("startDate", dateRange.startDate);
        }
        if (dateRange?.endDate) {
            console.log('Adding endDate to query:', dateRange.endDate);
            queryParams.append("endDate", dateRange.endDate);
        }
        // {moment.utc(selectedTransaction?.createdAt).format('DD MMM YYYY, hh:mm A')}

        const url = `${BACKEND_URL}/ledger/getAllMerchant?${queryParams.toString()}`;
        console.log('Making API request to:', url);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data,
        };
    } catch (error) {
        console.error("API Error:", error.response || error);
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "No transaction found",
            };
        }
        return { status: false, message: "Network Error" };
    }
};


// -------------------------------- get All Dirext Payment api----------------------------------------
export const fn_getAllDirectPaymentApi = async (status, pageNumber, merchant, searchQuery, searchTrnId, bankId, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams({
            page: pageNumber,
            status: status || "",
            type: "direct",
            trnStatus: merchant || "",
            search: searchQuery || ""
        });

        // Only add bankId if it exists and is not null
        // if (bankId) {
        //     queryParams.append("bankId", bankId);
        // }

        // // Add date range if provided
        // if (dateRange && dateRange[0] && dateRange[1]) {
        //     queryParams.append("startDate", dateRange[0]);
        //     queryParams.append("endDate", dateRange[1]);
        // }

        if (bankId) {
            queryParams.append("bankId", bankId);
        }

        // Add date range if provided using moment.utc
        if (dateRange && dateRange[0] && dateRange[1]) {
            queryParams.append("startDate", moment.utc(dateRange[0]).format('YYYY-MM-DD'));
            queryParams.append("endDate", moment.utc(dateRange[1]).format('YYYY-MM-DD'));
        }

        const response = await axios.get(
            `${BACKEND_URL}/ledger/getAllMerchant?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data,
        };
    } catch (error) {
        console.error("API Error:", error.response || error);
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "No transaction found",
            };
        }
        return { status: false, message: "Network Error" };
    }
};


//----------------------------------Get All Points Payment api--------------------------------------
export const fn_getAllPointsPaymentApi = async (status, pageNumber, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams();

        // Add basic parameters
        if (status) queryParams.append("status", status);
        if (pageNumber) queryParams.append("page", pageNumber);

        // Add date range parameters if provided
        if (dateRange?.startDate) queryParams.append("startDate", dateRange.startDate);
        if (dateRange?.endDate) queryParams.append("endDate", dateRange.endDate);

        const response = await axios.get(
            `${BACKEND_URL}/approval/getAllMerchant?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data,
        };
    } catch (error) {
        console.error(error);

        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "No transaction found",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//----------------------------------Transaction Status api--------------------------------------
export const fn_updateTransactionStatusApi = async (transactionId, data) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.put(
            `${BACKEND_URL}/ledger/update/${transactionId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }
        );

        return {
            status: response?.data?.status === "ok",
            message: response?.data?.message || "Transaction updated successfully",
            data: response?.data,
        };
    } catch (error) {
        console.error(`Error updating transaction status:`, error?.response || error);
        return {
            status: false,
            message: error?.response?.data?.message || "An error occurred",
        };
    }
};

// -----------------------------------Verified Transactions api---------------------------------
export const fn_getAllVerifiedTransactionApi = async (status) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/ledger/cardMerchantData?status=${status}&filter=all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        console.log(response);
        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data?.data,
        };
    } catch (error) {
        console.error(error);

        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

// -----------------------------------Get All Transactions api---------------------------------
export const fn_getAllTransactionApi = async (bankId) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/ledger/cardMerchantData${bankId ? `&bankId=${bankId}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        console.log(response);
        return {
            status: true,
            message: "Merchants show successfully",
            data: response.data?.data,
        };
    } catch (error) {
        console.error(error);

        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//----------------------------------Compare Transaction api---------------------------------------
export const fn_compareTransactions = async (data) => {
    try {
        const token = Cookies.get("merchantToken");

        const response = await axios.post(
            `${BACKEND_URL}/ledger/compare`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Compare API Response:", response?.data);

        return {
            status: true,
            message: "Transaction Verified",
            data: response.data?.data,
        };
    } catch (error) {
        if (error?.response) {
            console.error("Error during compare API:", error?.response?.data);
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        console.error("Network Error during compare API:", error);
        return { status: false, message: "Network Error" };
    }
};
//----------------------------------Delete Transaction api---------------------------------------
export const fn_deleteTransactionApi = async (id) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.delete(`${BACKEND_URL}/ledger/delete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        return {
            status: true,
            message: "Transaction Deleted",
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};
//----------------------------------Delete Transacion Slip Data api---------------------------------------
export const fn_deleteTransactionSlipApi = async (id) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.delete(`${BACKEND_URL}/slip/delete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        return {
            status: true,
            message: "Transaction Deleted",
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//----------------------------------Create Transactio slip api---------------------------------------
export const fn_crateTransactionSlip = async (data) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/slip/create`, data);
        return {
            status: true,
            data: response.data?.data,
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//----------------------------------Show Transaction Slip api----------------------------------------
export const fn_showTransactionSlipData = async () => {
    try {
        const id = Cookies.get("merchantId");
        const response = await axios.get(`${BACKEND_URL}/slip/get?id=${id}`);
        return {
            status: true,
            data: response.data?.data,
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//----------------------------------Get Merchant Data api--------------------------------------------
export const fn_getMerchantData = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const merchantId = Cookies.get("merchantId");
        const response = await axios.get(`${BACKEND_URL}/merchant/get/${merchantId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return { status: false, message: "Network Error" };
    }
};

//------------------------------------Create Staff Api-----------------------------------------------
export const fn_createStaffApi = async (formdata) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.post(`${BACKEND_URL}/staff/create`,
            formdata,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response?.status !== 500) {
            return {
                status: false,
                message: error?.response?.data?.message
            };
        }
        return {
            status: false,
            message: "Network Error"
        };
    }
};

//------------------------------------Get Staff Api-----------------------------------------------
export const fn_getStaffApi = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(`${BACKEND_URL}/staff/getAll`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("response ", response)
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response?.status !== 500) {
            return {
                status: false,
                message: error?.response?.data?.message,
            };
        }
        return {
            status: false,
            message: "Network Error",
        };
    }
};

//------------------------------------Update Staff Api-----------------------------------------------
export const fn_updateStaffApi = async (staffId, formData) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.put(
            `${BACKEND_URL}/staff/update/${staffId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response?.status !== 500) {
            return {
                status: false,
                message: error?.response?.data?.message,
            };
        }
        return {
            status: false,
            message: "Network Error",
        };
    }
};

//------------------------------------Delete Staff Api-----------------------------------------------
export const fn_deleteStaffApi = async (id) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.delete(`${BACKEND_URL}/staff/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            status: true,
            message: "Staff Deleted Successfully",
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//------------------------------------Get Card Data By Status API---------------------------------------------
export const fn_getCardDataByStatus = async (status, filter, dateRange) => {
    try {
        const token = Cookies.get("merchantToken");
        const queryParams = new URLSearchParams({
            status: status,
            filter: filter
        });

        // Format and add date range if provided
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');
            queryParams.append("startDate", startDate);
            queryParams.append("endDate", endDate);
        }

        const response = await axios.get(
            `${BACKEND_URL}/ledger/cardMerchantData?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        if (error?.response) {
            return {
                status: false,
                message: error?.response?.data?.message || "An error occurred",
            };
        }
        return { status: false, message: "Network Error" };
    }
};

//------------------------------------Get all banks API---------------------------------------------
export const fn_getAllBanksData = async (accountType) => {
    try {
        const token = Cookies.get("merchantToken");
        const url = `${BACKEND_URL}/bank/getAll?${accountType === "disabledBanks"
            ? "disable=true"
            : `accountType=${accountType}&disable=false`
            }`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return { status: false, message: "Network Error" };
    }
};

export const fn_getAllBanksData2 = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const url = `${BACKEND_URL}/bank/allBank`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return { status: false, message: "Network Error" };
    }
};


//------------------------------------Get all banks API---------------------------------------------
export const fn_getAllBankNames = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/bankNames/getAll`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data?.data || []
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to fetch bank names"
        };
    }
};

//------------------------------------ Upload Excel File API --------------------------------------
export const fn_uploadExcelFile = async (formData) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.post(
            `${BACKEND_URL}/excelWithdraw/uploadExcel`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return {
            status: true,
            data: response.data,
            message: "Excel File uploaded successfully"
        };
    } catch (error) {
        if (error?.response?.status === 400) {
            return {
                status: false,
                message: error?.response?.data?.message || "Invalid Excel file format"
            };
        }
        return {
            status: false,
            message: "Failed to upload excel file"
        };
    }
};

//------------------------------------  Get Upload Excel File API --------------------------------------
export const fn_getUploadExcelFile = async (page) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/excelFile/getAll?type=merchant&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to get excel file data"
        };
    }
}

//------------------------------------  Get Upload Excel File Data API --------------------------------------
export const fn_getUploadExcelFileData = async (id, page) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/excelWithdraw/getAll?excelFileId=${id}&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to get excel file data"
        };
    }
}

//------------------------------------  Get Upload Excel File Update API --------------------------------------

export const fn_updateExcelWithdraw = async (id) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.put(
            `${BACKEND_URL}/excelWithdraw/update/${id}`, { status: "Cancel" },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to get excel file data"
        };
    }
}

//------------------------------------  Single Payout  API --------------------------------------
export const fn_singlePayout = async (payoutData) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.post(
            `${BACKEND_URL}/excelWithdraw/create`,
            payoutData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            message: "Payout created successfully",
            data: response.data
        };
    } catch (error) {
        return {
            status: false,
            message: error.response?.data?.message || "Failed to create payout"
        };
    }
};

//------------------------------------  Get All Locations API --------------------------------------
export const fn_getAllLocations = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/location/getAll`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data?.data || []
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to fetch locations"
        };
    }
};


export const fn_getAllLocationsById = async (id) => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/location/get/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data?.data || []
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to fetch locations"
        };
    }
};

//------------------------------------  Get All Portal API --------------------------------------
export const fn_getAllPortals = async () => {
    try {
        const token = Cookies.get("merchantToken");
        const response = await axios.get(
            `${BACKEND_URL}/portal/getAll`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return {
            status: true,
            data: response.data?.data || []
        };
    } catch (error) {
        return {
            status: false,
            message: error?.response?.data?.message || "Failed to fetch portals"
        };
    }
};

export default BACKEND_URL;



// location/get/id