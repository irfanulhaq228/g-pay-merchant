import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, Modal, Input, notification, Switch } from "antd";
import {
  fn_createStaffApi,
  fn_getStaffApi,
  fn_updateStaffApi,
  fn_deleteStaffApi,
} from "../../api/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const Staff = ({ setSelectedPage, authorization, showSidebar }) => {
  const navigate = useNavigate();
  const containerHeight = window.innerHeight - 120;
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    permissions: [],
    merchantProfile: false,
    uploadStatement: false,
    type: ""
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [staffStatuses, setStaffStatuses] = useState({});

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      merchantProfile: false,
      uploadStatement: false,
      type: ""
    });
    setErrors({});
    setIsEditMode(false);
    setEditStaffId(null);
  };

  const handleAddStaff = () => {
    resetForm();
    setOpen(true);
  };

  const handleEdit = (staff) => {
    setFormData({
      userName: staff.userName,
      email: staff.email,
      password: staff.password,
      merchantProfile: staff.merchantProfile || false,
      uploadStatement: staff.uploadStatement || false,
    });
    setEditStaffId(staff._id);
    setIsEditMode(true);
    setOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 5) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append("userName", formData.userName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("uploadStatement", formData.uploadStatement);
    submitData.append("merchantProfile", formData.merchantProfile);
    submitData.append("type", formData.type);

    try {
      let response;
      if (isEditMode) {
        response = await fn_updateStaffApi(editStaffId, submitData);
      } else {
        response = await fn_createStaffApi(submitData);
      }

      if (response?.status) {
        notification.success({
          message: "Success",
          description: isEditMode
            ? "Staff updated successfully!"
            : "Staff created successfully!",
          placement: "topRight",
        });
        setOpen(false);
        resetForm();
        fetchStaffList();
      } else {
        notification.error({
          message: "Error",
          description:
            response?.message ||
            `Failed to ${isEditMode ? "update" : "create"} staff`,
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "An unexpected error occurred",
        placement: "topRight",
      });
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      const response = await fn_deleteStaffApi(staffId);
      if (response?.status) {
        notification.success({
          message: "Success",
          description: "Staff Deleted Successfully!",
          placement: "topRight",
        });
        fetchStaffList();
      } else {
        notification.error({
          message: "Error",
          description: response?.message || "Failed to delete staff",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "An unexpected error occurred while deleting staff",
        placement: "topRight",
      });
    }
  };

  const handleStatusChange = async (staffId, checked) => {
    try {
      const currentStaff = staffList.find((staff) => staff._id === staffId);
      if (!currentStaff) return;

      const response = await fn_updateStaffApi(staffId, {
        block: !checked,
        status: checked ? "Active" : "Inactive",
      });

      if (response?.status) {
        setStaffList((prev) =>
          prev.map((staff) =>
            staff._id === staffId
              ? {
                  ...staff,
                  block: !checked,
                  status: checked ? "Active" : "Inactive",
                }
              : staff
          )
        );

        notification.success({
          message: "Status Updated",
          description: `Staff ${
            checked ? "activated" : "deactivated"
          } successfully!`,
          placement: "topRight",
        });

        await fetchStaffList();
      } else {
        notification.error({
          message: "Error",
          description: response?.message || "Failed to update staff status",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update staff status",
        placement: "topRight",
      });
    }
  };

  useEffect(() => {
    if (!authorization) {
      navigate("/login");
      return;
    }
    setSelectedPage("staff");
  }, [authorization, navigate, setSelectedPage]);

  const fetchStaffList = async () => {
    try {
      const result = await fn_getStaffApi();
      if (result.status) {
        setStaffList(result?.data?.data);
        setStaffStatuses(
          result?.data?.data.reduce(
            (acc, staff) => ({
              ...acc,
              [staff._id]: staff.status !== "Inactive",
            }),
            {}
          )
        );
      } else {
        notification.error({
          message: "Error",
          description: result.message || "Failed to fetch staff data",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "An unexpected error occurred while fetching staff data",
        placement: "topRight",
      });
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fn_changeStaff = (value) => {
    if(value !== ""){
      setFormData((prev) => ({ ...prev, type: value, merchantProfile: false, uploadStatement: false }));
    };
    if(value === formData.type){
      setFormData((prev) => ({ ...prev, type: "", merchantProfile: false, uploadStatement: false }));
    }
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
          <h1 className="text-[25px] font-[500]">Staff Management</h1>
          <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
            Dashboard - Staff Table
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="p-3 flex flex-col md:flex-row items-center justify-between border-b space-y-4 md:space-y-0">
            <h2 className="text-black font-medium text-lg">
              Staff Information
            </h2>
            <Button
              type="primary"
              onClick={handleAddStaff}
              className="w-full md:w-auto"
            >
              Add Staff
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-[#ECF0FA]">
                <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                  <th className="p-3 text-[13px] font-[600]">Sr No.</th>
                  <th className="p-3 text-[13px] font-[600]">Name</th>
                  <th className="p-3 text-[13px] font-[600]">Email</th>
                  <th className="pl-7 text-[13px] font-[600]">Status</th>
                  <th className="p-3 text-[13px] font-[600] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffList.length > 0 ? (
                  staffList.map((staff, index) => (
                    <tr key={staff.id} className="border">
                      <td className="p-3 text-[13px]">{index + 1}</td>
                      <td className="p-3 text-[13px]">{staff.userName}</td>
                      <td className="p-3 text-[13px]">{staff.email}</td>
                      <td className="p-3">
                        <button
                          className={`px-3 py-[5px] rounded-[20px] w-20 flex items-center justify-center text-[11px] font-[500] ${
                            !staff.block
                              ? "bg-[#10CB0026] text-[#0DA000]"
                              : "bg-[#FF173D33] text-[#D50000]"
                          }`}
                        >
                          {!staff.block ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            size="small"
                            className="min-w-[28px]"
                            checked={!staff.block}
                            onChange={(checked) =>
                              handleStatusChange(staff._id, checked)
                            }
                          />
                          <Button
                            className="bg-green-100 hover:bg-green-200 text-green-600 rounded-full p-2 flex items-center justify-center min-w-[32px] h-[32px] border-none"
                            title="Edit"
                            onClick={() => handleEdit(staff)}
                          >
                            <FiEdit size={16} />
                          </Button>
                          <Button
                            className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 flex items-center justify-center min-w-[32px] h-[32px] border-none"
                            title="Delete"
                            onClick={() => handleDeleteStaff(staff._id)}
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-b">
                    <td className="p-3 text-center" colSpan="5">
                      No staff data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Modal
          title={
            <p className="text-[20px] font-[600]">
              {isEditMode ? "Edit Staff" : "Add New Staff"}
            </p>
          }
          open={open}
          onCancel={() => {
            setOpen(false);
            resetForm();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              Save
            </Button>,
          ]}
          width={600}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">
                  Username <span className="text-red-500">*</span>
                </p>
                <Input
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      userName: e.target.value,
                    }))
                  }
                  status={errors.userName ? "error" : ""}
                  placeholder="Enter username"
                />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </p>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  status={errors.email ? "error" : ""}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">
                Password{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </p>
              <Input.Password
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                status={errors.password ? "error" : ""}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Permissions</p>
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="upload-statement"
                    disabled={formData?.type !== ""}
                    checked={formData?.uploadStatement}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        uploadStatement: e.target.checked,
                      }))
                    }
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor="upload-statement" className="cursor-pointer">Upload Statement</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="merchant-profile"
                    disabled={formData?.type !== ""}
                    checked={formData?.merchantProfile}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        merchantProfile: e.target.checked,
                      }))
                    }
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor="merchant-profile" className="cursor-pointer">Merchant Profile</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="major-staff"
                    checked={formData?.type === "major"}
                    onChange={() => fn_changeStaff("major")}
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor="major-staff" className="cursor-pointer">Major Staff</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="minor-staff"
                    checked={formData?.type === "minor"}
                    onChange={() => fn_changeStaff("minor")}
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor="minor-staff" className="cursor-pointer">Minor Staff</label>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Staff;
