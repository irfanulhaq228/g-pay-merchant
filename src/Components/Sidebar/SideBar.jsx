import React from "react";
import Cookies from "js-cookie";
import { MdPayments } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";
import { FaHeadphones } from "react-icons/fa";
import { TbBookUpload } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineDashboard } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut, LuShieldCheck } from "react-icons/lu";
import Royal247Logo from "../../assets/Royal247Logo.png";
import { PiNotebook, PiHandWithdraw } from "react-icons/pi";

const SideBar = ({ merchantVerified, showSidebar, setShowSide, setAuthorization, selectedPage, setSelectedPage, setMerchantVerified, loginType, permissionsData }) => {

  const navigate = useNavigate();
  const isMobile = () => window.innerWidth < 1024;
  const fn_controlSidebar = () => { setShowSide(!showSidebar) };

  const fn_logout = () => {
    Cookies.remove("website");
    Cookies.remove("loginType");
    Cookies.remove("merchantId");
    Cookies.remove("merchantToken");
    localStorage.removeItem("permissions");
    localStorage.removeItem("merchantVerified");
    setAuthorization(false);
    setMerchantVerified(true);
    window.location.reload();
    navigate("/login");
  };

  return (
    <div
      style={{ zIndex: 999 }}
      className={`fixed w-[270px] h-[100vh] bg-white border-r transition-all duration-500 ${showSidebar ? "left-0" : "left-[-270px]"}`}
    >
      <div className="flex pl-[21px] h-[55px] items-center gap-3 border-b border-secondary">
        <div>
          <img className="w-[160px]" src={Royal247Logo} alt="" />
        </div>
        <button
          className="bg-gray-200 h-[25px] w-[25px] rounded-sm flex md:hidden justify-center ml-20 items-center"
          onClick={fn_controlSidebar}
        >
          X
        </button>
      </div>
      <div className="mt-[10px]">
        {(loginType === "merchant" && merchantVerified) ? (
          <>
            <Menu
              onClick={() => {
                setSelectedPage("dashboard");
                navigate("/");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Dashboard"
              name="dashboard"
              selectedPage={selectedPage}
              icon={<MdOutlineDashboard className="text-[20px]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("transaction-history");
                navigate("/transactions-table");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Transactions"
              name="transaction-history"
              selectedPage={selectedPage}
              icon={<PiNotebook className="text-[20px]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("direct-payment");
                navigate("/direct-payment-page");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Direct Payment"
              name="direct-payment"
              selectedPage={selectedPage}
              icon={<MdPayments className="text-[20px]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("approval-points");
                navigate("/approval-points");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Approved Points"
              name="approval-points"
              selectedPage={selectedPage}
              icon={<LuShieldCheck className="text-[20px] scale-[1.1]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("withdraw");
                navigate("/withdraw");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Withdraw Requests"
              name="withdraw"
              selectedPage={selectedPage}
              icon={<PiHandWithdraw className="text-[20px] scale-[1.1]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("merchant-profile");
                navigate("/merchant-management");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Merchant Profile"
              name="merchant-profile"
              selectedPage={selectedPage}
              icon={<FaRegCircleUser className="text-[20px]" />}
            />
            {/* <Menu
              onClick={() => {
                setSelectedPage("help-center");
                navigate("/support-help-center");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Support / Help Center"
              name="help-center"
              selectedPage={selectedPage}
              icon={<FaHeadphones className="text-[20px]" />}
            /> */}
            <Menu
              onClick={() => {
                setSelectedPage("reports");
                navigate("/reports");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Reports"
              name="reports"
              selectedPage={selectedPage}
              icon={<TbReportSearch className="text-[20px]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("payout");
                navigate("/payout");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Payout"
              name="payout"
              selectedPage={selectedPage}
              icon={<FaMoneyBillWave className="text-[20px]" />}
            />
            {/* <Menu
              onClick={() => {
                setSelectedPage("setting");
                navigate("/system-configuration");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Settings"
              name="setting"
              selectedPage={selectedPage}
              icon={<IoSettingsOutline className="text-[20px]" />}
            /> */}
            <Menu
              onClick={() => {
                setSelectedPage("staff");
                navigate("/staff");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Staff"
              name="staff"
              selectedPage={selectedPage}
              icon={<FaPeopleGroup className="text-[20px]" />}
            />
          </>
        ) : (loginType === "merchant" && !merchantVerified) ? (
          <>
            <Menu
              onClick={() => {
                setSelectedPage("dashboard");
                navigate("/");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Dashboard"
              name="dashboard"
              selectedPage={selectedPage}
              icon={<MdOutlineDashboard className="text-[20px]" />}
            />
            <Menu
              onClick={() => {
                setSelectedPage("setting");
                navigate("/system-configuration");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Settings"
              name="setting"
              selectedPage={selectedPage}
              icon={<IoSettingsOutline className="text-[20px]" />}
            />
          </>
        ) : (
          <>
            {permissionsData?.dashboard?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("dashboard");
                  navigate("/");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Dashboard"
                name="dashboard"
                selectedPage={selectedPage}
                icon={<MdOutlineDashboard className="text-[20px]" />}
              />
            )}
            {permissionsData?.transactionHistory?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("transaction-history");
                  navigate("/transactions-table");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Transactions"
                name="transaction-history"
                selectedPage={selectedPage}
                icon={<PiNotebook className="text-[20px]" />}
              />
            )}
            {permissionsData?.directPayment?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("direct-payment");
                  navigate("/direct-payment-page");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Direct Payment"
                name="direct-payment"
                selectedPage={selectedPage}
                icon={<MdPayments className="text-[20px]" />}
              />
            )}
            {permissionsData?.approvalPoints?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("approval-points");
                  navigate("/approval-points");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Approved Points"
                name="approval-points"
                selectedPage={selectedPage}
                icon={<LuShieldCheck className="text-[20px] scale-[1.1]" />}
              />
            )}
            {permissionsData?.merchantProfile?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("withdraw");
                  navigate("/withdraw");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Withdraw Requests"
                name="withdraw"
                selectedPage={selectedPage}
                icon={<PiHandWithdraw className="text-[20px] scale-[1.1]" />}
              />
            )}
            {permissionsData?.merchantProfile?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("merchant-profile");
                  navigate("/merchant-management");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Merchant Profile"
                name="merchant-profile"
                selectedPage={selectedPage}
                icon={<FaRegCircleUser className="text-[20px]" />}
              />
            )}
            {permissionsData?.reportsAnalytics?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("reports");
                  navigate("/reports");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Reports"
                name="reports"
                selectedPage={selectedPage}
                icon={<TbReportSearch className="text-[20px]" />}
              />
            )}
            {permissionsData?.reportsAnalytics?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("payout");
                  navigate("/payout");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Payout"
                name="payout"
                selectedPage={selectedPage}
                icon={<FaMoneyBillWave className="text-[20px]" />}
              />
            )}
            {permissionsData?.merchantProfile?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("staff");
                  navigate("/staff");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Staff"
                name="staff"
                selectedPage={selectedPage}
                icon={<FaPeopleGroup className="text-[20px]" />}
              />
            )}
            {/* {permissionsData?.support?.view && (
              <Menu
                onClick={() => {
                  setSelectedPage("help-center");
                  navigate("/support-help-center");
                  if (isMobile()) fn_controlSidebar();
                }}
                label="Support / Help Center"
                name="help-center"
                selectedPage={selectedPage}
                icon={<FaHeadphones className="text-[20px]" />}
              />
            )} */}
          </>
        )}
      </div>
      <div
        onClick={fn_logout}
        className="flex border-t gap-[15px] items-center py-[14px] px-[20px] cursor-pointer absolute bottom-0 w-full"
      >
        <div className="text-[rgba(105,155,247,1)]">
          <LuLogOut className="text-[20px] rotate-180" />
        </div>
        <p className="text-[14px] font-[600] text-gray-500">Logout</p>
      </div>
    </div>
  );
};

export default SideBar;

const Menu = ({ label, name, icon, onClick, selectedPage }) => {
  return (
    <div
      className={`flex border-b gap-[15px] items-center py-[14px] px-[20px] cursor-pointer ${name === selectedPage && "bg-blue-50"
        }`}
      onClick={onClick}
    >
      <div className="text-[rgba(105,155,247,1)]">{icon}</div>
      <p className="text-[14px] font-[600] text-gray-500">{label}</p>
    </div>
  );
};
