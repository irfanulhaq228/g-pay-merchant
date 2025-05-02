import React from "react";

const Footer = ({ showSidebar }) => {
  return (
    <div className={`h-[50px] bg-white flex justify-center items-center`}>
      <a
        href="https://netrex.ae"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7987A1] font-[500] text-[13px] sm:text-[15px] hover:text-[#5d6b82] cursor-pointer"
      >
        Developed by NETREX Inc. All rights reserved
      </a>
    </div>
  );
};

export default Footer;
