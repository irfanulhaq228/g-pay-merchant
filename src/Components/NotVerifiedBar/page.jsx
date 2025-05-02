import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const NotVerfiedBar = () => {
  return (
    <div className="fixed top-0 left-0 h-[55px] bg-[#ff0000bd] w-full flex justify-center items-center text-white text-[14px] font-[500] z-[9999]">
      <FaExclamationCircle className="inline-block text-[22px]" />
      &nbsp;&nbsp; Merchant is not Verified. Verify it from &nbsp;
      <Link to={"/system-configuration"}>
        <u>Settings</u>
      </Link>
    </div>
  );
};

export default NotVerfiedBar;
